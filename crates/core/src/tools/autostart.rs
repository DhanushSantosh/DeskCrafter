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

pub struct AutostartActionsTool<'a> {
    pub library: &'a LauncherLibrary,
}

impl super::LinuxTool for AutostartActionsTool<'_> {
    fn definition(&self) -> ToolDefinition {
        definition(
            TOOL_AUTOSTART,
            "Autostart Actions",
            ToolCategory::Startup,
            "Enable, disable, duplicate, and repair startup entries that should run on login.",
            PrivilegeLevel::UserWrite,
            &["linux"],
            &["KDE", "GNOME", "Xfce", "XDG"],
            true,
            vec![
                action("enable_launcher", "Enable selected launcher", ToolActionKind::Install, false, true, false),
                action("disable_path", "Disable path", ToolActionKind::Remove, true, false, false),
                action("repair_path", "Repair path", ToolActionKind::Repair, true, false, false),
                action("duplicate_path", "Duplicate path", ToolActionKind::Update, true, true, false),
            ],
            "Autostart path or target",
            "~/.config/autostart/example.desktop",
            "Launcher id or new file name",
            "Selected launcher id or copied desktop file name",
        )
    }

    fn status(&self) -> ToolStatus {
        ToolStatus {
            tool_id: TOOL_AUTOSTART.to_string(),
            available: true,
            summary: platform::autostart_dir().display().to_string(),
            warnings: Vec::new(),
        }
    }

    fn scan(&self, _input: ToolScanInput) -> Result<ToolResult, CoreError> {
        let user_dir = platform::autostart_dir();
        let system_dir = PathBuf::from("/etc/xdg/autostart");
        result(
            TOOL_AUTOSTART,
            "Autostart entries scanned",
            json!({
                "userDir": user_dir,
                "systemDir": system_dir,
                "userEntries": list_desktop_files(&platform::autostart_dir()),
                "systemEntries": list_desktop_files(&system_dir)
            }),
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
            "enable_launcher" => {
                let target_id = required_value(&input, "A launcher id is required")?;
                validate_only(
                    TOOL_AUTOSTART,
                    format!("Ready to enable launcher {target_id} at login"),
                    json!({ "targetId": target_id }),
                    Vec::new(),
                    Vec::new(),
                    Vec::new(),
                )
            }
            "disable_path" | "repair_path" => {
                let path = required_path(&input)?;
                validate_only(
                    TOOL_AUTOSTART,
                    format!("Ready to {action_id} {}", path),
                    json!({ "path": path }),
                    Vec::new(),
                    Vec::new(),
                    Vec::new(),
                )
            }
            "duplicate_path" => {
                let path = required_path(&input)?;
                let value = required_value(&input, "A new desktop file name is required")?;
                validate_only(
                    TOOL_AUTOSTART,
                    format!("Ready to duplicate {}", path),
                    json!({ "path": path, "newName": value }),
                    Vec::new(),
                    Vec::new(),
                    Vec::new(),
                )
            }
            _ => Err(CoreError::UnsupportedTarget(format!(
                "Unsupported autostart action: {action_id}"
            ))),
        }
    }

    fn apply_action(&self, input: ToolActionInput) -> Result<ToolResult, CoreError> {
        let action_id = expect_action(&input)?;
        match action_id {
            "enable_launcher" => {
                let target_id = required_value(&input, "A launcher id is required")?;
                let launcher = self.library.get_launcher(target_id)?;
                let destination = platform::autostart_dir().join(
                    launcher
                        .desktop_file_path
                        .file_name()
                        .ok_or_else(|| CoreError::Parse("Invalid launcher file name".to_string()))?,
                );
                fs::create_dir_all(platform::autostart_dir())?;
                let before = read_optional(&destination);
                fs::copy(&launcher.desktop_file_path, &destination)?;
                refresh_autostart_cache();
                result(
                    TOOL_AUTOSTART,
                    format!("Enabled {} at login", launcher.name),
                    json!({ "destination": destination }),
                    Vec::new(),
                    Vec::new(),
                    vec!["autostart entry enabled".to_string()],
                    Some(json!({ "before": before, "after": read_optional(&destination) })),
                    Vec::new(),
                    Vec::new(),
                )
            }
            "disable_path" => {
                let path = PathBuf::from(required_path(&input)?);
                let before = fs::read_to_string(&path)?;
                let after = set_desktop_entry_key(&before, "Hidden", "true");
                fs::write(&path, &after)?;
                refresh_autostart_cache();
                result(
                    TOOL_AUTOSTART,
                    format!("Disabled {}", path.display()),
                    json!({ "path": path }),
                    Vec::new(),
                    Vec::new(),
                    vec!["autostart entry disabled".to_string()],
                    Some(json!({ "before": before, "after": after })),
                    Vec::new(),
                    Vec::new(),
                )
            }
            "repair_path" => {
                let path = PathBuf::from(required_path(&input)?);
                let before = fs::read_to_string(&path)?;
                let mut after = set_desktop_entry_key(&before, "Hidden", "false");
                if !after.contains("X-DeskCrafter-Repaired=true") {
                    after.push_str("X-DeskCrafter-Repaired=true\n");
                }
                fs::write(&path, &after)?;
                refresh_autostart_cache();
                result(
                    TOOL_AUTOSTART,
                    format!("Repaired {}", path.display()),
                    json!({ "path": path }),
                    Vec::new(),
                    Vec::new(),
                    vec!["autostart entry repaired".to_string()],
                    Some(json!({ "before": before, "after": after })),
                    Vec::new(),
                    Vec::new(),
                )
            }
            "duplicate_path" => {
                let path = PathBuf::from(required_path(&input)?);
                let new_name = required_value(&input, "A new desktop file name is required")?;
                let destination = platform::autostart_dir().join(new_name);
                fs::create_dir_all(platform::autostart_dir())?;
                fs::copy(&path, &destination)?;
                refresh_autostart_cache();
                result(
                    TOOL_AUTOSTART,
                    format!("Duplicated {} to {}", path.display(), destination.display()),
                    json!({ "source": path, "destination": destination }),
                    Vec::new(),
                    Vec::new(),
                    vec!["autostart entry duplicated".to_string()],
                    None,
                    Vec::new(),
                    Vec::new(),
                )
            }
            _ => Err(CoreError::UnsupportedTarget(format!(
                "Unsupported autostart action: {action_id}"
            ))),
        }
    }

    fn guided_admin_commands(&self) -> Vec<GuidedCommand> {
        vec![GuidedCommand {
            label: "Inspect system autostart".to_string(),
            command: "ls /etc/xdg/autostart".to_string(),
            privilege_level: PrivilegeLevel::ReadOnly,
            explanation: "Lists distro-managed startup entries that DeskCrafter leaves alone.".to_string(),
        }]
    }
}

fn list_desktop_files(dir: &Path) -> Vec<serde_json::Value> {
    let Ok(entries) = fs::read_dir(dir) else {
        return Vec::new();
    };
    entries
        .filter_map(Result::ok)
        .map(|entry| entry.path())
        .filter(|path| path.extension().and_then(|value| value.to_str()) == Some("desktop"))
        .map(|path| {
            json!({
                "path": path,
                "name": path.file_name().and_then(|value| value.to_str()).unwrap_or("unknown"),
            })
        })
        .collect()
}
