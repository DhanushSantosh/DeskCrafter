use super::helpers::*;
use crate::error::CoreError;
use crate::platform;
use crate::types::{
    GuidedCommand, PrivilegeLevel, ToolActionInput, ToolActionKind, ToolCategory, ToolDefinition,
    ToolResult, ToolScanInput, ToolStatus,
};
use serde_json::json;

pub struct SystemProfileTool;

impl super::LinuxTool for SystemProfileTool {
    fn definition(&self) -> ToolDefinition {
        definition(
            TOOL_SYSTEM_PROFILE,
            "System Profile",
            ToolCategory::Advanced,
            "Expose desktop environment facts that the repair tools rely on behind the scenes.",
            PrivilegeLevel::ReadOnly,
            &["linux"],
            &["KDE", "GNOME", "Xfce", "XDG"],
            false,
            vec![action("refresh_profile", "Refresh profile", ToolActionKind::Scan, false, false, false)],
            "Optional query",
            "Leave empty to scan the current system",
            "Optional value",
            "Unused for current actions",
        )
    }

    fn status(&self) -> ToolStatus {
        ToolStatus {
            tool_id: TOOL_SYSTEM_PROFILE.to_string(),
            available: true,
            summary: "Local Linux environment detected".to_string(),
            warnings: Vec::new(),
        }
    }

    fn scan(&self, _input: ToolScanInput) -> Result<ToolResult, CoreError> {
        result(
            TOOL_SYSTEM_PROFILE,
            "System profile loaded",
            platform::system_profile(),
            Vec::new(),
            Vec::new(),
            Vec::new(),
            None,
            Vec::new(),
            Vec::new(),
        )
    }

    fn validate_action(&self, _input: ToolActionInput) -> Result<ToolResult, CoreError> {
        validate_only(
            TOOL_SYSTEM_PROFILE,
            "System profile does not require action validation",
            json!({}),
            Vec::new(),
            Vec::new(),
            Vec::new(),
        )
    }

    fn apply_action(&self, _input: ToolActionInput) -> Result<ToolResult, CoreError> {
        self.scan(ToolScanInput::default())
    }

    fn guided_admin_commands(&self) -> Vec<GuidedCommand> {
        Vec::new()
    }
}
