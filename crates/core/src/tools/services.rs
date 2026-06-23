use super::helpers::*;
use crate::error::CoreError;
use crate::platform;
use crate::types::{
    GuidedCommand, PrivilegeLevel, ToolActionInput, ToolActionKind, ToolCategory, ToolDefinition,
    ToolResult, ToolScanInput, ToolStatus,
};
use serde_json::json;
use std::process::Command;

const MAX_SERVICE_ROWS: usize = 80;

pub struct ServiceActionsTool;

impl super::LinuxTool for ServiceActionsTool {
    fn definition(&self) -> ToolDefinition {
        definition(
            TOOL_SERVICES,
            "Service Actions",
            ToolCategory::Advanced,
            "Start, stop, and enable services when desktop tools depend on them.",
            PrivilegeLevel::SystemRepair,
            &["linux"],
            &["systemd"],
            true,
            vec![
                action("start_user", "Start user", ToolActionKind::Update, true, false, false),
                action("enable_user", "Enable user", ToolActionKind::Update, true, false, false),
                action("start_system", "Start system", ToolActionKind::ElevatedAction, true, false, true),
                action("enable_system", "Enable system", ToolActionKind::ElevatedAction, true, false, true),
            ],
            "Service name",
            "pipewire.service",
            "Optional value",
            "Unused for current actions",
        )
    }

    fn status(&self) -> ToolStatus {
        let available = platform::command_exists("systemctl");
        ToolStatus {
            tool_id: TOOL_SERVICES.to_string(),
            available,
            summary: if available {
                "systemctl available".to_string()
            } else {
                "systemctl not found".to_string()
            },
            warnings: if available {
                Vec::new()
            } else {
                vec!["systemd service actions are unavailable".to_string()]
            },
        }
    }

    fn scan(&self, _input: ToolScanInput) -> Result<ToolResult, CoreError> {
        if !platform::command_exists("systemctl") {
            return result(
                TOOL_SERVICES,
                "systemctl is not available",
                json!({ "userServices": [], "systemServices": [] }),
                vec!["This system does not expose systemd service control.".to_string()],
                Vec::new(),
                Vec::new(),
                None,
                Vec::new(),
                Vec::new(),
            );
        }
        let user_services = service_rows(&[
            "--user",
            "list-unit-files",
            "--type=service",
            "--no-pager",
            "--no-legend",
        ]);
        let system_services = service_rows(&[
            "list-unit-files",
            "--type=service",
            "--no-pager",
            "--no-legend",
        ]);
        result(
            TOOL_SERVICES,
            format!(
                "{} user service row(s), {} system service row(s)",
                user_services.len(),
                system_services.len()
            ),
            json!({ "userServices": user_services, "systemServices": system_services }),
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
        let service = required_path(&input)?;
        validate_only(
            TOOL_SERVICES,
            format!("Ready to {action_id} {service}"),
            json!({ "service": service, "action": action_id }),
            Vec::new(),
            Vec::new(),
            Vec::new(),
        )
    }

    fn apply_action(&self, input: ToolActionInput) -> Result<ToolResult, CoreError> {
        let action_id = expect_action(&input)?;
        let service = required_path(&input)?;
        match action_id {
            "start_user" => run_command("systemctl", &["--user", "start", &service])?,
            "enable_user" => run_command("systemctl", &["--user", "enable", "--now", &service])?,
            "start_system" => {
                let status = run_elevated_shell(&format!("systemctl start '{}'", service))?;
                return result(
                    TOOL_SERVICES,
                    format!("Started system service {service}"),
                    json!({ "service": service, "status": status }),
                    Vec::new(),
                    Vec::new(),
                    vec!["system service started".to_string()],
                    None,
                    Vec::new(),
                    Vec::new(),
                );
            }
            "enable_system" => {
                let status = run_elevated_shell(&format!("systemctl enable --now '{}'", service))?;
                return result(
                    TOOL_SERVICES,
                    format!("Enabled system service {service}"),
                    json!({ "service": service, "status": status }),
                    Vec::new(),
                    Vec::new(),
                    vec!["system service enabled".to_string()],
                    None,
                    Vec::new(),
                    Vec::new(),
                );
            }
            _ => {
                return Err(CoreError::UnsupportedTarget(format!(
                    "Unsupported service action: {action_id}"
                )))
            }
        };

        result(
            TOOL_SERVICES,
            format!("Applied {action_id} to {service}"),
            json!({ "service": service }),
            Vec::new(),
            Vec::new(),
            vec![format!("service action {action_id} applied")],
            None,
            Vec::new(),
            Vec::new(),
        )
    }

    fn guided_admin_commands(&self) -> Vec<GuidedCommand> {
        vec![GuidedCommand {
            label: "Check a service".to_string(),
            command: "systemctl status <service-name>".to_string(),
            privilege_level: PrivilegeLevel::ReadOnly,
            explanation: "Shows the current state of a service without modifying it.".to_string(),
        }]
    }
}

fn service_rows(args: &[&str]) -> Vec<serde_json::Value> {
    let Ok(output) = Command::new("systemctl").args(args).output() else {
        return Vec::new();
    };
    String::from_utf8_lossy(&output.stdout)
        .lines()
        .take(MAX_SERVICE_ROWS)
        .filter_map(|line| {
            let mut columns = line.split_whitespace();
            let unit = columns.next()?;
            let state = columns.next().unwrap_or_default();
            Some(json!({ "unit": unit, "state": state }))
        })
        .collect()
}
