use super::helpers::*;
use crate::error::CoreError;
use crate::platform;
use crate::types::{
    GuidedCommand, PrivilegeLevel, ToolActionInput, ToolActionKind, ToolCategory, ToolDefinition,
    ToolResult, ToolScanInput, ToolStatus,
};
use serde_json::json;
use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;
use std::process::Command;

pub struct DefaultAppsMimeTool;

impl super::LinuxTool for DefaultAppsMimeTool {
    fn definition(&self) -> ToolDefinition {
        definition(
            TOOL_DEFAULT_APPS,
            "Default Apps & MIME Manager",
            ToolCategory::Associations,
            "Inspect and repair file associations, URL scheme handlers, and open-with defaults.",
            PrivilegeLevel::ElevatedWrite,
            &["linux"],
            &["KDE", "GNOME", "Xfce", "XDG"],
            true,
            vec![
                action("set_default_mime", "Set MIME default", ToolActionKind::Update, true, true, false),
                action("set_default_browser", "Set default browser", ToolActionKind::Update, false, true, false),
                action("set_system_default_mime", "Set system MIME default", ToolActionKind::ElevatedAction, true, true, true),
            ],
            "MIME type",
            "application/pdf or x-scheme-handler/https",
            "Desktop file id",
            "org.mozilla.firefox.desktop",
        )
    }

    fn status(&self) -> ToolStatus {
        ToolStatus {
            tool_id: TOOL_DEFAULT_APPS.to_string(),
            available: platform::command_exists("xdg-mime"),
            summary: "~/.config/mimeapps.list".to_string(),
            warnings: if platform::command_exists("xdg-mime") {
                Vec::new()
            } else {
                vec!["xdg-mime is not available on this system".to_string()]
            },
        }
    }

    fn scan(&self, input: ToolScanInput) -> Result<ToolResult, CoreError> {
        let mimeapps = read_mimeapps_defaults();
        let query = input.query.or(input.path);
        let query_result = query.as_deref().map(query_default_for);
        result(
            TOOL_DEFAULT_APPS,
            "MIME defaults inspected",
            json!({ "defaults": mimeapps, "queryResult": query_result }),
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
            "set_default_mime" | "set_system_default_mime" => {
                let mime = required_path(&input)?;
                let desktop_id = required_value(&input, "A desktop file id is required")?;
                validate_only(
                    TOOL_DEFAULT_APPS,
                    format!("Ready to set {desktop_id} as default for {mime}"),
                    json!({ "mime": mime, "desktopId": desktop_id }),
                    Vec::new(),
                    Vec::new(),
                    Vec::new(),
                )
            }
            "set_default_browser" => {
                let desktop_id = required_value(&input, "A desktop file id is required")?;
                validate_only(
                    TOOL_DEFAULT_APPS,
                    format!("Ready to set {desktop_id} as the default browser"),
                    json!({ "desktopId": desktop_id }),
                    Vec::new(),
                    Vec::new(),
                    Vec::new(),
                )
            }
            _ => Err(CoreError::UnsupportedTarget(format!(
                "Unsupported default apps action: {action_id}"
            ))),
        }
    }

    fn apply_action(&self, input: ToolActionInput) -> Result<ToolResult, CoreError> {
        let action_id = expect_action(&input)?;
        match action_id {
            "set_default_mime" => {
                let mime = required_path(&input)?;
                let desktop_id = required_value(&input, "A desktop file id is required")?;
                run_command("xdg-mime", &["default", desktop_id, &mime])?;
                result(
                    TOOL_DEFAULT_APPS,
                    format!("Set {desktop_id} as default for {mime}"),
                    json!({ "mime": mime, "desktopId": desktop_id }),
                    Vec::new(),
                    Vec::new(),
                    vec!["mime default updated".to_string()],
                    None,
                    vec!["apps may need to be reopened to pick up new defaults".to_string()],
                    Vec::new(),
                )
            }
            "set_default_browser" => {
                let desktop_id = required_value(&input, "A desktop file id is required")?;
                for scheme in ["x-scheme-handler/http", "x-scheme-handler/https"] {
                    run_command("xdg-mime", &["default", desktop_id, scheme])?;
                }
                result(
                    TOOL_DEFAULT_APPS,
                    format!("Set {desktop_id} as the default browser"),
                    json!({ "desktopId": desktop_id }),
                    Vec::new(),
                    Vec::new(),
                    vec!["browser default updated".to_string()],
                    None,
                    vec!["apps may need to be reopened to pick up new defaults".to_string()],
                    Vec::new(),
                )
            }
            "set_system_default_mime" => {
                let mime = required_path(&input)?;
                let desktop_id = required_value(&input, "A desktop file id is required")?;
                let command = format!(
                    "mkdir -p /etc/xdg && printf '[Default Applications]\\n{}={}\\n' >> /etc/xdg/mimeapps.list",
                    shell_escape(&mime),
                    shell_escape(desktop_id)
                );
                let status = run_elevated_shell(&command)?;
                result(
                    TOOL_DEFAULT_APPS,
                    format!("Set system default for {mime}"),
                    json!({ "mime": mime, "desktopId": desktop_id, "status": status }),
                    Vec::new(),
                    Vec::new(),
                    vec!["system mime default updated".to_string()],
                    None,
                    vec!["system-wide defaults may require relogin for all apps".to_string()],
                    Vec::new(),
                )
            }
            _ => Err(CoreError::UnsupportedTarget(format!(
                "Unsupported default apps action: {action_id}"
            ))),
        }
    }

    fn guided_admin_commands(&self) -> Vec<GuidedCommand> {
        vec![GuidedCommand {
            label: "Inspect current PDF default".to_string(),
            command: "xdg-mime query default application/pdf".to_string(),
            privilege_level: PrivilegeLevel::ReadOnly,
            explanation: "Shows which desktop file currently handles PDF files.".to_string(),
        }]
    }
}

fn read_mimeapps_defaults() -> BTreeMap<String, String> {
    let mut defaults = BTreeMap::new();
    for path in mimeapps_locations() {
        let Ok(content) = fs::read_to_string(path) else {
            continue;
        };
        let mut in_defaults = false;
        for line in content.lines() {
            let trimmed = line.trim();
            if trimmed.starts_with('[') {
                in_defaults = trimmed == "[Default Applications]";
                continue;
            }
            if !in_defaults || trimmed.is_empty() || trimmed.starts_with('#') {
                continue;
            }
            if let Some((key, value)) = trimmed.split_once('=') {
                defaults.insert(key.to_string(), value.to_string());
            }
        }
    }
    defaults
}

fn mimeapps_locations() -> Vec<PathBuf> {
    vec![
        platform::config_home().join("mimeapps.list"),
        platform::data_home().join("applications").join("mimeapps.list"),
        PathBuf::from("/etc/xdg/mimeapps.list"),
    ]
}

fn query_default_for(input: &str) -> serde_json::Value {
    let output = Command::new("xdg-mime")
        .args(["query", "default", input])
        .output();
    match output {
        Ok(output) => json!({
            "query": input,
            "defaultDesktopId": String::from_utf8_lossy(&output.stdout).trim(),
            "success": output.status.success()
        }),
        Err(_) => json!({ "query": input, "defaultDesktopId": null, "success": false }),
    }
}
