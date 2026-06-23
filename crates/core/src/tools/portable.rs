use super::helpers::*;
use crate::error::CoreError;
use crate::launcher_library::LauncherLibrary;
use crate::platform;
use crate::types::{
    GuidedCommand, PrivilegeLevel, ToolActionInput, ToolActionKind, ToolCategory, ToolDefinition,
    ToolResult, ToolScanInput, ToolStatus,
};
use serde_json::json;
use std::fs;
use std::path::{Path, PathBuf};

pub struct PortableIntegratorTool<'a> {
    pub library: &'a LauncherLibrary,
}

impl super::LinuxTool for PortableIntegratorTool<'_> {
    fn definition(&self) -> ToolDefinition {
        definition(
            TOOL_PORTABLE_INTEGRATOR,
            "Portable App Integrator",
            ToolCategory::Apps,
            "Integrate AppImages, binaries, and scripts into the desktop with real launchers.",
            PrivilegeLevel::UserWrite,
            &["linux"],
            &["KDE", "GNOME", "Xfce", "XDG"],
            true,
            vec![
                action("integrate_path", "Integrate path", ToolActionKind::Install, true, false, false),
                action("relink_target", "Re-link target", ToolActionKind::Repair, true, false, false),
                action("remove_integration", "Remove integration", ToolActionKind::Remove, false, true, false),
            ],
            "Portable target",
            "~/.local/share/portable-apps/MyApp.AppImage",
            "Launcher id",
            "Used for remove integration",
        )
    }

    fn status(&self) -> ToolStatus {
        ToolStatus {
            tool_id: TOOL_PORTABLE_INTEGRATOR.to_string(),
            available: true,
            summary: managed_portable_dir().display().to_string(),
            warnings: Vec::new(),
        }
    }

    fn scan(&self, _input: ToolScanInput) -> Result<ToolResult, CoreError> {
        let roots = portable_roots();
        let appimages = find_portables(&roots, &["AppImage", "appimage"]);
        let scripts = find_portables(&roots, &["sh", "py", "bin"]);
        result(
            TOOL_PORTABLE_INTEGRATOR,
            format!(
                "{} AppImage(s), {} script/binary candidate(s)",
                appimages.len(),
                scripts.len()
            ),
            json!({ "roots": roots, "appimages": appimages, "scripts": scripts }),
            Vec::new(),
            Vec::new(),
            Vec::new(),
            None,
            Vec::new(),
            Vec::new(),
        )
    }

    fn validate_action(&self, input: ToolActionInput) -> Result<ToolResult, CoreError> {
        let action_id = expect_action(&input)?;
        match action_id {
            "integrate_path" | "relink_target" => {
                let path = required_path(&input)?;
                let inspection = self.library.inspect_target(&path)?;
                let warnings = inspection.warnings.clone();
                validate_only(
                    TOOL_PORTABLE_INTEGRATOR,
                    format!("Ready to {action_id} {}", inspection.suggested_name),
                    json!({ "path": path, "inspection": inspection }),
                    warnings,
                    Vec::new(),
                    Vec::new(),
                )
            }
            "remove_integration" => {
                let target_id = required_value(&input, "A launcher id is required")?;
                validate_only(
                    TOOL_PORTABLE_INTEGRATOR,
                    format!("Ready to remove integration for {target_id}"),
                    json!({ "targetId": target_id }),
                    Vec::new(),
                    Vec::new(),
                    Vec::new(),
                )
            }
            _ => Err(CoreError::UnsupportedTarget(format!(
                "Unsupported portable integration action: {action_id}"
            ))),
        }
    }

    fn apply_action(&self, input: ToolActionInput) -> Result<ToolResult, CoreError> {
        let action_id = expect_action(&input)?;
        match action_id {
            "integrate_path" | "relink_target" => {
                integrate_target(self.library, &required_path(&input)?)
            }
            "remove_integration" => {
                let target_id = required_value(&input, "A launcher id is required")?;
                let before = self.library.get_launcher(target_id)?;
                self.library.delete_launcher(target_id)?;
                result(
                    TOOL_PORTABLE_INTEGRATOR,
                    format!("Removed integration for {}", before.name),
                    json!({ "removed": before.id }),
                    Vec::new(),
                    Vec::new(),
                    vec!["portable integration removed".to_string()],
                    Some(json!({ "before": before, "after": null })),
                    Vec::new(),
                    Vec::new(),
                )
            }
            _ => Err(CoreError::UnsupportedTarget(format!(
                "Unsupported portable integration action: {action_id}"
            ))),
        }
    }

    fn guided_admin_commands(&self) -> Vec<GuidedCommand> {
        Vec::new()
    }
}

fn integrate_target(library: &LauncherLibrary, path: &str) -> Result<ToolResult, CoreError> {
    let source = PathBuf::from(path);
    if !source.is_file() {
        return Err(CoreError::NotFound(format!(
            "Portable target does not exist: {}",
            source.display()
        )));
    }
    let inspection = library.inspect_target(path)?;
    let managed_path = copy_portable_if_needed(&source)?;
    set_user_file_executable(&managed_path)?;
    let input = crate::types::LauncherInput {
        name: inspection.suggested_name.clone(),
        description: format!("Integrated by DeskCrafter from {}", source.display()),
        exec_path: managed_path.display().to_string(),
        icon_path: String::new(),
        categories: vec!["Utility".to_string()],
        terminal: inspection.terminal,
        kind: inspection.kind,
        url: None,
    };
    let launcher = library.create_launcher(input)?;
    result(
        TOOL_PORTABLE_INTEGRATOR,
        format!("Integrated {}", inspection.suggested_name),
        json!({ "launcher": launcher, "managedPath": managed_path }),
        inspection.warnings,
        Vec::new(),
        vec![
            "portable file integrated".to_string(),
            "launcher created".to_string(),
            "desktop caches refreshed".to_string(),
        ],
        None,
        Vec::new(),
        Vec::new(),
    )
}

fn portable_roots() -> Vec<PathBuf> {
    vec![
        platform::home_dir().join("Applications"),
        platform::home_dir().join("Downloads"),
        platform::home_dir().join(".local/bin"),
        managed_portable_dir(),
    ]
}

fn copy_portable_if_needed(source: &Path) -> Result<PathBuf, CoreError> {
    let destination_root = managed_portable_dir();
    fs::create_dir_all(&destination_root)?;
    if source.starts_with(&destination_root) {
        return Ok(source.to_path_buf());
    }
    let destination = destination_root.join(
        source
            .file_name()
            .ok_or_else(|| CoreError::InvalidInput("Target has no file name".to_string()))?,
    );
    fs::copy(source, &destination)?;
    Ok(destination)
}

fn find_portables(roots: &[PathBuf], extensions: &[&str]) -> Vec<serde_json::Value> {
    let mut entries = Vec::new();
    for root in roots {
        if !root.exists() {
            continue;
        }
        visit_directory(root, 0, &mut |path| {
            let Some(extension) = path.extension().and_then(|value| value.to_str()) else {
                return;
            };
            if extensions.iter().any(|candidate| extension.eq_ignore_ascii_case(candidate)) {
                entries.push(json!({
                    "path": path,
                    "executable": is_executable(path),
                    "sizeBytes": fs::metadata(path).map(|meta| meta.len()).unwrap_or(0)
                }));
            }
        });
    }
    entries
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::tempdir;

    #[test]
    fn portable_integration_copies_target_into_managed_dir() {
        let temp = tempdir().expect("tempdir should exist");
        let source = temp.path().join("sample.AppImage");
        fs::write(&source, "placeholder").expect("file should be written");
        let destination_root = managed_portable_dir();
        let copied = copy_portable_if_needed(&source).expect("copy should work");
        assert!(copied.starts_with(destination_root));
    }
}
