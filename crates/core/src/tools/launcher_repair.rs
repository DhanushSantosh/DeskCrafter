use super::helpers::*;
use crate::error::CoreError;
use crate::launcher_library::LauncherLibrary;
use crate::types::{
    GuidedCommand, PrivilegeLevel, ToolActionInput, ToolActionKind, ToolCategory, ToolDefinition,
    ToolResult, ToolScanInput, ToolStatus,
};
use serde_json::json;

pub struct LauncherRepairTool<'a> {
    pub library: &'a LauncherLibrary,
}

impl super::LinuxTool for LauncherRepairTool<'_> {
    fn definition(&self) -> ToolDefinition {
        definition(
            TOOL_LAUNCHER_REPAIR,
            "Launcher Repair & Integrator",
            ToolCategory::Launchers,
            "Create, repair, refresh, and remove launchers so apps actually show up and launch.",
            PrivilegeLevel::UserWrite,
            &["linux"],
            &["KDE", "GNOME", "Xfce", "XDG"],
            true,
            vec![
                action("refresh_menus", "Refresh menus", ToolActionKind::Repair, false, false, false),
                action("repair_selected", "Repair selected", ToolActionKind::Repair, false, true, false),
                action("remove_selected", "Remove selected", ToolActionKind::Remove, false, true, false),
                action("install_global", "Install globally", ToolActionKind::ElevatedAction, false, true, true),
            ],
            "Inspect target",
            "Path to AppImage, script, executable, or https:// URL",
            "Selected launcher id",
            "Uses the selected launcher when available",
        )
    }

    fn status(&self) -> ToolStatus {
        ToolStatus {
            tool_id: TOOL_LAUNCHER_REPAIR.to_string(),
            available: true,
            summary: self.library.applications_dir().display().to_string(),
            warnings: Vec::new(),
        }
    }

    fn scan(&self, _input: ToolScanInput) -> Result<ToolResult, CoreError> {
        let launchers = self.library.list_launchers()?;
        let issues = self.library.scan_launcher_issues()?;
        let blocking = issues
            .iter()
            .filter(|issue| issue.severity == crate::types::IssueSeverity::Error)
            .map(|issue| issue.message.clone())
            .collect();
        result(
            TOOL_LAUNCHER_REPAIR,
            format!("{} launcher(s), {} issue(s)", launchers.len(), issues.len()),
            json!({ "launchers": launchers, "issues": issues }),
            Vec::new(),
            blocking,
            Vec::new(),
            None,
            Vec::new(),
            Vec::new(),
        )
    }

    fn validate_action(&self, input: ToolActionInput) -> Result<ToolResult, CoreError> {
        let action_id = expect_action(&input)?;
        match action_id {
            "refresh_menus" => validate_only(
                TOOL_LAUNCHER_REPAIR,
                "Menu refresh will rebuild launcher caches",
                json!({ "action": action_id }),
                Vec::new(),
                Vec::new(),
                Vec::new(),
            ),
            "repair_selected" | "remove_selected" | "install_global" => {
                let target_id = required_value(&input, "A launcher id is required")?;
                validate_only(
                    TOOL_LAUNCHER_REPAIR,
                    format!("{action_id} is ready for launcher {target_id}"),
                    json!({ "action": action_id, "targetId": target_id }),
                    Vec::new(),
                    Vec::new(),
                    if action_id == "install_global" {
                        vec![GuidedCommand {
                            label: "Install launcher globally".to_string(),
                            command: format!(
                                "sudo cp {}/deskcrafter-{}.desktop /usr/share/applications/",
                                self.library.applications_dir().display(),
                                target_id
                            ),
                            privilege_level: PrivilegeLevel::ElevatedWrite,
                            explanation: "Promotes a user launcher into the system applications directory.".to_string(),
                        }]
                    } else {
                        Vec::new()
                    },
                )
            }
            _ => Err(CoreError::UnsupportedTarget(format!(
                "Unsupported launcher action: {action_id}"
            ))),
        }
    }

    fn apply_action(&self, input: ToolActionInput) -> Result<ToolResult, CoreError> {
        let action_id = expect_action(&input)?;
        match action_id {
            "refresh_menus" => {
                refresh_desktop_entry_cache(self.library.applications_dir());
                result(
                    TOOL_LAUNCHER_REPAIR,
                    "Desktop entry caches refreshed",
                    json!({ "applicationsDir": self.library.applications_dir() }),
                    Vec::new(),
                    Vec::new(),
                    vec!["desktop cache refreshed".to_string()],
                    None,
                    Vec::new(),
                    Vec::new(),
                )
            }
            "repair_selected" => {
                let target_id = required_value(&input, "A launcher id is required")?;
                let before = self.library.get_launcher(target_id)?;
                let repaired = self.library.repair_launcher(target_id, Default::default())?;
                result(
                    TOOL_LAUNCHER_REPAIR,
                    format!("Repaired {}", repaired.name),
                    json!({ "launcher": repaired }),
                    Vec::new(),
                    Vec::new(),
                    vec!["launcher repaired".to_string()],
                    Some(json!({ "before": before, "after": self.library.get_launcher(target_id)? })),
                    Vec::new(),
                    Vec::new(),
                )
            }
            "remove_selected" => {
                let target_id = required_value(&input, "A launcher id is required")?;
                let before = self.library.get_launcher(target_id)?;
                self.library.delete_launcher(target_id)?;
                result(
                    TOOL_LAUNCHER_REPAIR,
                    format!("Removed {}", before.name),
                    json!({ "removed": before.id }),
                    Vec::new(),
                    Vec::new(),
                    vec!["launcher removed".to_string()],
                    Some(json!({ "before": before, "after": null })),
                    Vec::new(),
                    Vec::new(),
                )
            }
            "install_global" => {
                let target_id = required_value(&input, "A launcher id is required")?;
                let launcher = self.library.get_launcher(target_id)?;
                let file_name = launcher
                    .desktop_file_path
                    .file_name()
                    .and_then(|value| value.to_str())
                    .ok_or_else(|| CoreError::Parse("Launcher file name is invalid".to_string()))?;
                let command = format!(
                    "install -m 0644 '{}' '/usr/share/applications/{}' && update-desktop-database /usr/share/applications",
                    launcher.desktop_file_path.display(),
                    file_name
                );
                let status = run_elevated_shell(&command)?;
                result(
                    TOOL_LAUNCHER_REPAIR,
                    format!("Installed {} globally", launcher.name),
                    json!({ "launcher": launcher.id, "status": status }),
                    Vec::new(),
                    Vec::new(),
                    vec!["launcher installed globally".to_string()],
                    None,
                    vec!["system application menu may take a moment to refresh".to_string()],
                    Vec::new(),
                )
            }
            _ => Err(CoreError::UnsupportedTarget(format!(
                "Unsupported launcher action: {action_id}"
            ))),
        }
    }

    fn guided_admin_commands(&self) -> Vec<GuidedCommand> {
        vec![GuidedCommand {
            label: "Refresh desktop caches".to_string(),
            command: "update-desktop-database ~/.local/share/applications && kbuildsycoca6".to_string(),
            privilege_level: PrivilegeLevel::UserWrite,
            explanation: "Rebuilds the application caches after desktop entry changes.".to_string(),
        }]
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tools::LinuxTool;
    use crate::types::{LauncherInput, LauncherKind};
    use tempfile::tempdir;

    #[test]
    fn launcher_repair_tool_scan_works_on_temp_library() {
        let temp = tempdir().expect("tempdir should exist");
        let library = LauncherLibrary::new(temp.path().to_path_buf());
        library
            .create_launcher(LauncherInput {
                name: "Desk Test".to_string(),
                description: "Test".to_string(),
                exec_path: "/usr/bin/env true".to_string(),
                icon_path: String::new(),
                categories: vec!["Utility".to_string()],
                terminal: false,
                kind: LauncherKind::Application,
                url: None,
            })
            .expect("launcher should be created");
        let tool = LauncherRepairTool { library: &library };
        let result = tool.scan(ToolScanInput::default()).expect("scan should work");
        assert_eq!(result.tool_id, TOOL_LAUNCHER_REPAIR);
    }
}
