use crate::error::CoreError;
use crate::platform;
use crate::types::{
    GuidedCommand, PrivilegeLevel, ToolActionDescriptor, ToolActionInput, ToolActionKind,
    ToolCategory, ToolDefinition, ToolResult,
};
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

pub const TOOL_LAUNCHER_REPAIR: &str = "launcher_repair_integrator";
pub const TOOL_PORTABLE_INTEGRATOR: &str = "portable_app_integrator";
pub const TOOL_AUTOSTART: &str = "autostart_actions";
pub const TOOL_DEFAULT_APPS: &str = "default_apps_mime_manager";
pub const TOOL_FLATPAK: &str = "flatpak_permissions_manager";
pub const TOOL_PERMISSIONS: &str = "permission_ownership_repair";
pub const TOOL_SERVICES: &str = "service_actions";
pub const TOOL_SYSTEM_PROFILE: &str = "system_profile";

pub const MAX_DIRECTORY_DEPTH: usize = 3;

pub fn definition(
    id: &str,
    label: &str,
    category: ToolCategory,
    description: &str,
    privilege_level: PrivilegeLevel,
    supported_distros: &[&str],
    desktop_targets: &[&str],
    reversible: bool,
    primary_actions: Vec<ToolActionDescriptor>,
    path_input_label: &str,
    path_input_placeholder: &str,
    value_input_label: &str,
    value_input_placeholder: &str,
) -> ToolDefinition {
    ToolDefinition {
        id: id.to_string(),
        label: label.to_string(),
        category,
        description: description.to_string(),
        privilege_level: privilege_level.clone(),
        elevation_mode: match privilege_level {
            PrivilegeLevel::ReadOnly => "none".to_string(),
            PrivilegeLevel::UserWrite => "optional".to_string(),
            PrivilegeLevel::ElevatedWrite | PrivilegeLevel::SystemRepair => "required".to_string(),
        },
        reversible,
        desktop_targets: desktop_targets.iter().map(|value| (*value).to_string()).collect(),
        supported_distros: supported_distros.iter().map(|value| (*value).to_string()).collect(),
        primary_actions,
        path_input_label: path_input_label.to_string(),
        path_input_placeholder: path_input_placeholder.to_string(),
        value_input_label: value_input_label.to_string(),
        value_input_placeholder: value_input_placeholder.to_string(),
    }
}

pub fn action(
    id: &str,
    label: &str,
    kind: ToolActionKind,
    requires_path: bool,
    requires_value: bool,
    requires_elevation: bool,
) -> ToolActionDescriptor {
    ToolActionDescriptor {
        id: id.to_string(),
        label: label.to_string(),
        kind,
        requires_path,
        requires_value,
        requires_elevation,
    }
}

pub fn result<T: Serialize>(
    tool_id: &str,
    summary: impl Into<String>,
    data: T,
    warnings: Vec<String>,
    blocking_issues: Vec<String>,
    performed_actions: Vec<String>,
    before_after_state: Option<serde_json::Value>,
    restart_or_refresh_needed: Vec<String>,
    guided_commands: Vec<GuidedCommand>,
) -> Result<ToolResult, CoreError> {
    Ok(ToolResult {
        tool_id: tool_id.to_string(),
        summary: summary.into(),
        data: serde_json::to_value(data)
            .map_err(|error| CoreError::Parse(format!("Failed to serialize tool data: {error}")))?,
        warnings,
        blocking_issues,
        performed_actions,
        before_after_state,
        restart_or_refresh_needed,
        guided_commands,
    })
}

pub fn validate_only<T: Serialize>(
    tool_id: &str,
    summary: impl Into<String>,
    data: T,
    warnings: Vec<String>,
    blocking_issues: Vec<String>,
    guided_commands: Vec<GuidedCommand>,
) -> Result<ToolResult, CoreError> {
    result(
        tool_id,
        summary,
        data,
        warnings,
        blocking_issues,
        Vec::new(),
        None,
        Vec::new(),
        guided_commands,
    )
}

pub fn expect_action(input: &ToolActionInput) -> Result<&str, CoreError> {
    input
        .action
        .as_deref()
        .ok_or_else(|| CoreError::InvalidInput("An action id is required".to_string()))
}

pub fn required_path(input: &ToolActionInput) -> Result<String, CoreError> {
    input
        .path
        .clone()
        .or(input.query.clone())
        .ok_or_else(|| CoreError::InvalidInput("A path or query is required".to_string()))
}

pub fn required_value<'a>(input: &'a ToolActionInput, message: &str) -> Result<&'a str, CoreError> {
    input
        .value
        .as_deref()
        .ok_or_else(|| CoreError::InvalidInput(message.to_string()))
}

pub fn read_optional(path: &Path) -> Option<String> {
    fs::read_to_string(path).ok()
}

pub fn shell_escape(input: &str) -> String {
    input.replace('\'', "'\"'\"'")
}

pub fn run_command(command: &str, args: &[&str]) -> Result<(), CoreError> {
    let status = Command::new(command)
        .args(args)
        .status()
        .map_err(CoreError::Io)?;
    if status.success() {
        Ok(())
    } else {
        Err(CoreError::UnsupportedTarget(format!(
            "{} failed with status {}",
            command,
            status.code().unwrap_or_default()
        )))
    }
}

pub fn run_elevated_shell(command: &str) -> Result<i32, CoreError> {
    let status = Command::new("pkexec")
        .args(["sh", "-lc", command])
        .status()
        .map_err(CoreError::Io)?;
    if status.success() {
        Ok(status.code().unwrap_or_default())
    } else {
        Err(CoreError::PermissionDenied(format!(
            "Elevated command failed: {command}"
        )))
    }
}

pub fn refresh_desktop_entry_cache(applications_dir: &Path) {
    let _ = Command::new("update-desktop-database")
        .arg(applications_dir)
        .output();
    for command in ["kbuildsycoca6", "kbuildsycoca5", "kbuildsycoca"] {
        let Ok(status) = Command::new(command).arg("--noincremental").status() else {
            continue;
        };
        if status.success() {
            break;
        }
    }
}

pub fn refresh_autostart_cache() {
    for command in ["kbuildsycoca6", "kbuildsycoca5", "kbuildsycoca"] {
        let Ok(status) = Command::new(command).arg("--noincremental").status() else {
            continue;
        };
        if status.success() {
            break;
        }
    }
}

pub fn set_desktop_entry_key(content: &str, key: &str, value: &str) -> String {
    let mut found = false;
    let mut lines = Vec::new();
    for line in content.lines() {
        if line.trim_start().starts_with(&format!("{key}=")) {
            lines.push(format!("{key}={value}"));
            found = true;
        } else {
            lines.push(line.to_string());
        }
    }
    if !found {
        lines.push(format!("{key}={value}"));
    }
    format!("{}\n", lines.join("\n"))
}

pub fn set_user_file_executable(_path: &Path) -> Result<(), CoreError> {
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let metadata = fs::metadata(_path)?;
        let mut permissions = metadata.permissions();
        permissions.set_mode(permissions.mode() | 0o100);
        fs::set_permissions(_path, permissions)?;
    }
    Ok(())
}

pub fn is_executable(path: &Path) -> bool {
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        fs::metadata(path)
            .map(|meta| meta.permissions().mode() & 0o111 != 0)
            .unwrap_or(false)
    }
    #[cfg(not(unix))]
    {
        path.is_file()
    }
}

pub fn is_owned_by_user(path: &Path) -> bool {
    #[cfg(unix)]
    {
        use std::os::unix::fs::MetadataExt;
        let Ok(metadata) = fs::metadata(path) else {
            return false;
        };
        let Ok(user_output) = Command::new("id").arg("-u").output() else {
            return false;
        };
        let Ok(uid) = String::from_utf8_lossy(&user_output.stdout)
            .trim()
            .parse::<u32>()
        else {
            return false;
        };
        metadata.uid() == uid
    }
    #[cfg(not(unix))]
    {
        path.exists()
    }
}

pub fn managed_portable_dir() -> PathBuf {
    platform::data_home().join("deskcrafter").join("portable-apps")
}

pub fn visit_directory(root: &Path, depth: usize, visitor: &mut impl FnMut(&Path)) {
    if depth > MAX_DIRECTORY_DEPTH {
        return;
    }
    let Ok(entries) = fs::read_dir(root) else {
        return;
    };
    for entry in entries.filter_map(Result::ok) {
        let path = entry.path();
        if path.is_dir() {
            visit_directory(&path, depth + 1, visitor);
        } else {
            visitor(&path);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn desktop_key_updates_are_reversible() {
        let original = "[Desktop Entry]\nName=Sample\nHidden=false\n";
        let updated = set_desktop_entry_key(original, "Hidden", "true");
        assert!(updated.contains("Hidden=true"));
    }
}
