mod autostart;
mod default_apps;
mod flatpak;
mod helpers;
mod launcher_repair;
mod permissions;
mod portable;
mod services;
mod system_profile;

use autostart::AutostartActionsTool;
use default_apps::DefaultAppsMimeTool;
use flatpak::FlatpakPermissionsTool;
use launcher_repair::LauncherRepairTool;
use permissions::PermissionOwnershipTool;
use portable::PortableIntegratorTool;
use services::ServiceActionsTool;
use system_profile::SystemProfileTool;

use crate::error::CoreError;
use crate::launcher_library::LauncherLibrary;
use crate::types::{GuidedCommand, ToolActionInput, ToolDefinition, ToolResult, ToolScanInput, ToolStatus};

pub trait LinuxTool {
    fn definition(&self) -> ToolDefinition;
    fn status(&self) -> ToolStatus;
    fn scan(&self, input: ToolScanInput) -> Result<ToolResult, CoreError>;
    fn validate_action(&self, input: ToolActionInput) -> Result<ToolResult, CoreError>;
    fn apply_action(&self, input: ToolActionInput) -> Result<ToolResult, CoreError>;
    fn guided_admin_commands(&self) -> Vec<GuidedCommand>;
}

pub struct ToolRegistry {
    launcher_library: LauncherLibrary,
}

impl Default for ToolRegistry {
    fn default() -> Self {
        Self::new(LauncherLibrary::default())
    }
}

impl ToolRegistry {
    pub fn new(launcher_library: LauncherLibrary) -> Self {
        Self { launcher_library }
    }

    pub fn list_tools(&self) -> Vec<ToolDefinition> {
        self.with_tools(|tools| tools.into_iter().map(|tool| tool.definition()).collect())
    }

    pub fn get_tool_status(&self, tool_id: &str) -> Result<ToolStatus, CoreError> {
        self.with_tool(tool_id, |tool| Ok(tool.status()))
    }

    pub fn run_tool_scan(
        &self,
        tool_id: &str,
        input: ToolScanInput,
    ) -> Result<ToolResult, CoreError> {
        self.with_tool(tool_id, |tool| tool.scan(input))
    }

    pub fn validate_tool_action(
        &self,
        tool_id: &str,
        input: ToolActionInput,
    ) -> Result<ToolResult, CoreError> {
        self.with_tool(tool_id, |tool| tool.validate_action(input))
    }

    pub fn apply_tool_action(
        &self,
        tool_id: &str,
        input: ToolActionInput,
    ) -> Result<ToolResult, CoreError> {
        self.with_tool(tool_id, |tool| tool.apply_action(input))
    }

    pub fn list_guided_admin_commands(
        &self,
        tool_id: &str,
    ) -> Result<Vec<GuidedCommand>, CoreError> {
        self.with_tool(tool_id, |tool| Ok(tool.guided_admin_commands()))
    }

    fn with_tool<T>(
        &self,
        tool_id: &str,
        action: impl FnOnce(&dyn LinuxTool) -> Result<T, CoreError>,
    ) -> Result<T, CoreError> {
        self.with_tools(|tools| {
            let tool = tools
                .into_iter()
                .find(|tool| tool.definition().id == tool_id)
                .ok_or_else(|| CoreError::NotFound(format!("Tool not found: {tool_id}")))?;
            action(tool.as_ref())
        })
    }

    fn with_tools<T>(&self, action: impl FnOnce(Vec<Box<dyn LinuxTool + '_>>) -> T) -> T {
        action(vec![
            Box::new(LauncherRepairTool {
                library: &self.launcher_library,
            }),
            Box::new(PortableIntegratorTool {
                library: &self.launcher_library,
            }),
            Box::new(AutostartActionsTool {
                library: &self.launcher_library,
            }),
            Box::new(DefaultAppsMimeTool),
            Box::new(FlatpakPermissionsTool),
            Box::new(PermissionOwnershipTool),
            Box::new(ServiceActionsTool),
            Box::new(SystemProfileTool),
        ])
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use super::helpers;

    #[test]
    fn registry_exposes_action_first_suite_tools() {
        let registry = ToolRegistry::default();
        let tools = registry.list_tools();
        let ids = tools.iter().map(|tool| tool.id.as_str()).collect::<Vec<_>>();
        assert_eq!(
            ids,
            vec![
                helpers::TOOL_LAUNCHER_REPAIR,
                helpers::TOOL_PORTABLE_INTEGRATOR,
                helpers::TOOL_AUTOSTART,
                helpers::TOOL_DEFAULT_APPS,
                helpers::TOOL_FLATPAK,
                helpers::TOOL_PERMISSIONS,
                helpers::TOOL_SERVICES,
                helpers::TOOL_SYSTEM_PROFILE,
            ]
        );
        assert!(tools
            .iter()
            .any(|tool| !tool.primary_actions.is_empty() && tool.reversible));
    }

    #[test]
    fn each_tool_definition_has_input_labels() {
        let registry = ToolRegistry::default();
        for tool in registry.list_tools() {
            assert!(
                !tool.path_input_label.is_empty(),
                "Tool {} is missing path_input_label",
                tool.id
            );
            assert!(
                !tool.value_input_label.is_empty(),
                "Tool {} is missing value_input_label",
                tool.id
            );
        }
    }

    #[test]
    fn tool_not_found_returns_error() {
        let registry = ToolRegistry::default();
        let err = registry
            .run_tool_scan("nonexistent_tool", Default::default())
            .unwrap_err();
        assert!(err.to_string().contains("nonexistent_tool"));
    }
}
