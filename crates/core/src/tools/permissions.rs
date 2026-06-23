use super::helpers::*;
use crate::error::CoreError;
use crate::platform;
use crate::types::{
    GuidedCommand, PrivilegeLevel, ToolActionInput, ToolActionKind, ToolCategory, ToolDefinition,
    ToolResult, ToolScanInput, ToolStatus,
};
use serde_json::json;
use std::env;
use std::fs;
use std::path::{Path, PathBuf};

pub struct PermissionOwnershipTool;

impl super::LinuxTool for PermissionOwnershipTool {
    fn definition(&self) -> ToolDefinition {
        definition(
            TOOL_PERMISSIONS,
            "Permission & Ownership Repair",
            ToolCategory::Permissions,
            "Repair executable bits and ownership problems that break launcher and app integration.",
            PrivilegeLevel::ElevatedWrite,
            &["linux"],
            &["KDE", "GNOME", "Xfce", "XDG"],
            true,
            vec![
                action("make_executable", "Make executable", ToolActionKind::Repair, true, false, false),
                action("repair_xdg_dir", "Repair XDG dir", ToolActionKind::Repair, true, false, false),
                action("fix_ownership", "Fix ownership", ToolActionKind::ElevatedAction, true, false, true),
            ],
            "Path to repair",
            "~/.local/share/applications",
            "Optional value",
            "Unused for current actions",
        )
    }

    fn status(&self) -> ToolStatus {
        ToolStatus {
            tool_id: TOOL_PERMISSIONS.to_string(),
            available: true,
            summary: "Select a path to inspect or repair".to_string(),
            warnings: Vec::new(),
        }
    }

    fn scan(&self, input: ToolScanInput) -> Result<ToolResult, CoreError> {
        let Some(path) = input.path.or(input.query) else {
            return result(
                TOOL_PERMISSIONS,
                "Select a path to inspect permissions",
                json!({
                    "suggestedPaths": [
                        platform::applications_dir(),
                        platform::config_home().join("autostart"),
                        managed_portable_dir()
                    ]
                }),
                Vec::new(),
                Vec::new(),
                Vec::new(),
                None,
                Vec::new(),
                Vec::new(),
            );
        };
        inspect_permission_path(Path::new(&path))
    }

    fn validate_action(&self, input: ToolActionInput) -> Result<ToolResult, CoreError> {
        let action_id = expect_action(&input)?;
        let path = required_path(&input)?;
        validate_only(
            TOOL_PERMISSIONS,
            format!("Ready to {action_id} {}", path),
            json!({ "path": path, "action": action_id }),
            Vec::new(),
            Vec::new(),
            Vec::new(),
        )
    }

    fn apply_action(&self, input: ToolActionInput) -> Result<ToolResult, CoreError> {
        let action_id = expect_action(&input)?;
        let path = PathBuf::from(required_path(&input)?);
        match action_id {
            "make_executable" => {
                set_user_file_executable(&path)?;
                inspect_permission_path(&path)
            }
            "repair_xdg_dir" => {
                fs::create_dir_all(&path)?;
                inspect_permission_path(&path)
            }
            "fix_ownership" => {
                let user = env::var("USER").unwrap_or_else(|_| "root".to_string());
                let command = format!("chown -R '{}':'{}' '{}'", user, user, path.display());
                let status = run_elevated_shell(&command)?;
                result(
                    TOOL_PERMISSIONS,
                    format!("Repaired ownership for {}", path.display()),
                    json!({ "path": path, "status": status }),
                    Vec::new(),
                    Vec::new(),
                    vec!["ownership repaired".to_string()],
                    None,
                    vec!["re-open file managers or launchers if they cached ownership errors".to_string()],
                    Vec::new(),
                )
            }
            _ => Err(CoreError::UnsupportedTarget(format!(
                "Unsupported permission action: {action_id}"
            ))),
        }
    }

    fn guided_admin_commands(&self) -> Vec<GuidedCommand> {
        vec![GuidedCommand {
            label: "Repair applications dir ownership".to_string(),
            command: format!(
                "sudo chown -R \"$USER\":\"$USER\" '{}'",
                platform::applications_dir().display()
            ),
            privilege_level: PrivilegeLevel::SystemRepair,
            explanation: "Restores ownership when launcher directories were accidentally written as root.".to_string(),
        }]
    }
}

fn inspect_permission_path(path: &Path) -> Result<ToolResult, CoreError> {
    let metadata = fs::metadata(path)?;
    let writable = !metadata.permissions().readonly();
    result(
        TOOL_PERMISSIONS,
        format!("Inspected {}", path.display()),
        json!({
            "path": path,
            "isFile": metadata.is_file(),
            "isDir": metadata.is_dir(),
            "executable": is_executable(path),
            "writable": writable,
            "ownedByUser": is_owned_by_user(path)
        }),
        Vec::new(),
        Vec::new(),
        Vec::new(),
        None,
        Vec::new(),
        Vec::new(),
    )
}
