use super::helpers::*;
use crate::error::CoreError;
use crate::platform;
use crate::types::{
    GuidedCommand, PrivilegeLevel, ToolActionInput, ToolActionKind, ToolCategory, ToolDefinition,
    ToolResult, ToolScanInput, ToolStatus,
};
use serde_json::json;
use std::process::Command;

pub struct FlatpakPermissionsTool;

impl super::LinuxTool for FlatpakPermissionsTool {
    fn definition(&self) -> ToolDefinition {
        definition(
            TOOL_FLATPAK,
            "Flatpak Permissions Manager",
            ToolCategory::Sandboxes,
            "Inspect and change Flatpak overrides so sandboxed apps can actually work.",
            PrivilegeLevel::ElevatedWrite,
            &["linux"],
            &["KDE", "GNOME", "Xfce", "XDG"],
            true,
            vec![
                action("grant_home", "Grant home", ToolActionKind::Update, true, false, false),
                action("grant_path", "Grant path", ToolActionKind::Update, true, true, false),
                action("reset_overrides", "Reset overrides", ToolActionKind::Repair, true, false, false),
                action("grant_system_path", "Grant system path", ToolActionKind::ElevatedAction, true, true, true),
            ],
            "Flatpak app id",
            "org.mozilla.firefox",
            "Filesystem path",
            "/home/user/Documents",
        )
    }

    fn status(&self) -> ToolStatus {
        let available = platform::command_exists("flatpak");
        ToolStatus {
            tool_id: TOOL_FLATPAK.to_string(),
            available,
            summary: if available {
                "flatpak available".to_string()
            } else {
                "flatpak not found".to_string()
            },
            warnings: if available {
                Vec::new()
            } else {
                vec!["Flatpak is not installed on this system".to_string()]
            },
        }
    }

    fn scan(&self, input: ToolScanInput) -> Result<ToolResult, CoreError> {
        if !platform::command_exists("flatpak") {
            return result(
                TOOL_FLATPAK,
                "Flatpak is not available",
                json!({ "apps": [] }),
                vec!["Install Flatpak to manage sandboxed apps with this tool.".to_string()],
                Vec::new(),
                Vec::new(),
                None,
                Vec::new(),
                Vec::new(),
            );
        }
        let apps = flatpak_app_ids();
        let permissions = input
            .query
            .or(input.path)
            .map(|app_id| flatpak_permissions(&app_id))
            .transpose()?;
        result(
            TOOL_FLATPAK,
            format!("{} Flatpak app(s) detected", apps.len()),
            json!({ "apps": apps, "permissions": permissions }),
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
        let app_id = required_path(&input)?;
        let value = if matches!(action_id, "grant_path" | "grant_system_path") {
            Some(required_value(&input, "A filesystem path is required")?)
        } else {
            None
        };
        validate_only(
            TOOL_FLATPAK,
            format!("Ready to {action_id} for {app_id}"),
            json!({ "appId": app_id, "value": value }),
            Vec::new(),
            Vec::new(),
            Vec::new(),
        )
    }

    fn apply_action(&self, input: ToolActionInput) -> Result<ToolResult, CoreError> {
        let action_id = expect_action(&input)?;
        let app_id = required_path(&input)?;
        match action_id {
            "grant_home" => {
                run_command("flatpak", &["override", "--user", "--filesystem=home", &app_id])?;
                result(
                    TOOL_FLATPAK,
                    format!("Granted home access to {app_id}"),
                    json!({ "appId": app_id }),
                    Vec::new(),
                    Vec::new(),
                    vec!["flatpak override applied".to_string()],
                    None,
                    vec!["restart the Flatpak app to apply new permissions".to_string()],
                    Vec::new(),
                )
            }
            "grant_path" => {
                let value = required_value(&input, "A filesystem path is required")?;
                let filesystem_arg = format!("--filesystem={value}");
                run_command("flatpak", &["override", "--user", &filesystem_arg, &app_id])?;
                result(
                    TOOL_FLATPAK,
                    format!("Granted {} to {app_id}", value),
                    json!({ "appId": app_id, "path": value }),
                    Vec::new(),
                    Vec::new(),
                    vec!["flatpak override applied".to_string()],
                    None,
                    vec!["restart the Flatpak app to apply new permissions".to_string()],
                    Vec::new(),
                )
            }
            "reset_overrides" => {
                run_command("flatpak", &["override", "--user", "--reset", &app_id])?;
                result(
                    TOOL_FLATPAK,
                    format!("Reset overrides for {app_id}"),
                    json!({ "appId": app_id }),
                    Vec::new(),
                    Vec::new(),
                    vec!["flatpak overrides reset".to_string()],
                    None,
                    vec!["restart the Flatpak app to apply new permissions".to_string()],
                    Vec::new(),
                )
            }
            "grant_system_path" => {
                let value = required_value(&input, "A filesystem path is required")?;
                let command = format!(
                    "flatpak override --system --filesystem='{}' '{}'",
                    value, app_id
                );
                let status = run_elevated_shell(&command)?;
                result(
                    TOOL_FLATPAK,
                    format!("Granted system path {} to {app_id}", value),
                    json!({ "appId": app_id, "path": value, "status": status }),
                    Vec::new(),
                    Vec::new(),
                    vec!["system flatpak override applied".to_string()],
                    None,
                    vec!["restart the Flatpak app to apply new permissions".to_string()],
                    Vec::new(),
                )
            }
            _ => Err(CoreError::UnsupportedTarget(format!(
                "Unsupported Flatpak action: {action_id}"
            ))),
        }
    }

    fn guided_admin_commands(&self) -> Vec<GuidedCommand> {
        vec![GuidedCommand {
            label: "Inspect effective permissions".to_string(),
            command: "flatpak info --show-permissions <app-id>".to_string(),
            privilege_level: PrivilegeLevel::ReadOnly,
            explanation: "Shows the current Flatpak permissions and overrides for an app.".to_string(),
        }]
    }
}

fn flatpak_app_ids() -> Vec<String> {
    let Ok(output) = Command::new("flatpak")
        .args(["list", "--app", "--columns=application"])
        .output()
    else {
        return Vec::new();
    };
    String::from_utf8_lossy(&output.stdout)
        .lines()
        .filter(|line| !line.trim().is_empty())
        .map(|line| line.trim().to_string())
        .collect()
}

fn flatpak_permissions(app_id: &str) -> Result<String, CoreError> {
    let output = Command::new("flatpak")
        .args(["info", "--show-permissions", app_id])
        .output()
        .map_err(CoreError::Io)?;
    if !output.status.success() {
        return Err(CoreError::UnsupportedTarget(format!(
            "Unable to inspect Flatpak permissions for {app_id}"
        )));
    }
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
