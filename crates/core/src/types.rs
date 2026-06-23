use crate::error::{CoreError, ErrorCode};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum LauncherKind {
    Application,
    AppImage,
    Script,
    Url,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct LauncherInput {
    pub name: String,
    pub description: String,
    pub exec_path: String,
    pub icon_path: String,
    pub categories: Vec<String>,
    pub terminal: bool,
    pub kind: LauncherKind,
    pub url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Launcher {
    pub id: String,
    pub name: String,
    pub description: String,
    pub exec_path: String,
    pub icon_path: String,
    pub categories: Vec<String>,
    pub terminal: bool,
    pub kind: LauncherKind,
    pub url: Option<String>,
    pub desktop_file_path: PathBuf,
    pub managed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct DesktopEntryContent {
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ValidationReport {
    pub valid: bool,
    pub warnings: Vec<String>,
    pub errors: Vec<String>,
    pub preview: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct InspectTargetResult {
    pub kind: LauncherKind,
    pub suggested_name: String,
    pub exec_path: String,
    pub terminal: bool,
    pub warnings: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct IconResolution {
    pub input: String,
    pub resolved_path: Option<PathBuf>,
    pub theme_name: Option<String>,
    pub exists: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct LauncherIssue {
    pub launcher_id: Option<String>,
    pub path: PathBuf,
    pub severity: IssueSeverity,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum IssueSeverity {
    Info,
    Warning,
    Error,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct RepairOptions {
    pub normalize_categories: bool,
    pub refresh_icon: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ApiError {
    pub code: ErrorCode,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ApiResult<T> {
    pub ok: bool,
    pub data: Option<T>,
    pub error: Option<ApiError>,
}

impl<T> ApiResult<T> {
    pub fn ok(data: T) -> Self {
        Self {
            ok: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn err(error: CoreError) -> Self {
        Self {
            ok: false,
            data: None,
            error: Some(ApiError {
                code: error.code(),
                message: error.to_string(),
            }),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ToolCategory {
    Launchers,
    Startup,
    Apps,
    Associations,
    Sandboxes,
    Permissions,
    Advanced,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum PrivilegeLevel {
    ReadOnly,
    UserWrite,
    ElevatedWrite,
    SystemRepair,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ToolActionKind {
    Scan,
    Repair,
    Install,
    Update,
    Remove,
    ElevatedAction,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ToolActionDescriptor {
    pub id: String,
    pub label: String,
    pub kind: ToolActionKind,
    pub requires_path: bool,
    pub requires_value: bool,
    pub requires_elevation: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ToolDefinition {
    pub id: String,
    pub label: String,
    pub category: ToolCategory,
    pub description: String,
    pub privilege_level: PrivilegeLevel,
    pub elevation_mode: String,
    pub reversible: bool,
    pub desktop_targets: Vec<String>,
    pub supported_distros: Vec<String>,
    pub primary_actions: Vec<ToolActionDescriptor>,
    pub path_input_label: String,
    pub path_input_placeholder: String,
    pub value_input_label: String,
    pub value_input_placeholder: String,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ToolScanInput {
    pub query: Option<String>,
    pub path: Option<String>,
    pub target_id: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ToolActionInput {
    pub query: Option<String>,
    pub path: Option<String>,
    pub action: Option<String>,
    pub target_id: Option<String>,
    pub value: Option<String>,
    pub secondary_value: Option<String>,
    pub allow_elevation: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct GuidedCommand {
    pub label: String,
    pub command: String,
    pub privilege_level: PrivilegeLevel,
    pub explanation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ToolResult {
    pub tool_id: String,
    pub summary: String,
    pub data: serde_json::Value,
    pub warnings: Vec<String>,
    pub blocking_issues: Vec<String>,
    pub performed_actions: Vec<String>,
    pub before_after_state: Option<serde_json::Value>,
    pub restart_or_refresh_needed: Vec<String>,
    pub guided_commands: Vec<GuidedCommand>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ToolStatus {
    pub tool_id: String,
    pub available: bool,
    pub summary: String,
    pub warnings: Vec<String>,
}
