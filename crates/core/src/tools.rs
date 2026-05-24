use crate::error::CoreError;
use crate::launcher_library::LauncherLibrary;
use crate::platform;
use crate::types::{
    GuidedCommand, PrivilegeLevel, ToolActionDescriptor, ToolActionInput, ToolActionKind,
    ToolCategory, ToolDefinition, ToolResult, ToolScanInput, ToolStatus,
};
use serde::Serialize;
use serde_json::json;
use std::collections::BTreeMap;
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

const TOOL_LAUNCHER_REPAIR: &str = "launcher_repair_integrator";
const TOOL_PORTABLE_INTEGRATOR: &str = "portable_app_integrator";
const TOOL_AUTOSTART: &str = "autostart_actions";
const TOOL_DEFAULT_APPS: &str = "default_apps_mime_manager";
const TOOL_FLATPAK: &str = "flatpak_permissions_manager";
const TOOL_PERMISSIONS: &str = "permission_ownership_repair";
const TOOL_SERVICES: &str = "service_actions";
const TOOL_SYSTEM_PROFILE: &str = "system_profile";

const MANAGED_PORTABLE_DIR: &str = "portable-apps";
const MAX_DIRECTORY_DEPTH: usize = 3;
const MAX_SERVICE_ROWS: usize = 80;

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

fn definition(
    id: &str,
    label: &str,
    category: ToolCategory,
    description: &str,
    privilege_level: PrivilegeLevel,
    supported_distros: &[&str],
    desktop_targets: &[&str],
    reversible: bool,
    primary_actions: Vec<ToolActionDescriptor>,
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
    }
}

fn action(
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

fn result<T: Serialize>(
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

fn validate_only<T: Serialize>(
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

fn expect_action(input: &ToolActionInput) -> Result<&str, CoreError> {
    input
        .action
        .as_deref()
        .ok_or_else(|| CoreError::InvalidInput("An action id is required".to_string()))
}

struct LauncherRepairTool<'a> {
    library: &'a LauncherLibrary,
}

impl LinuxTool for LauncherRepairTool<'_> {
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
                action(
                    "repair_selected",
                    "Repair selected",
                    ToolActionKind::Repair,
                    false,
                    true,
                    false,
                ),
                action(
                    "remove_selected",
                    "Remove selected",
                    ToolActionKind::Remove,
                    false,
                    true,
                    false,
                ),
                action(
                    "install_global",
                    "Install globally",
                    ToolActionKind::ElevatedAction,
                    false,
                    true,
                    true,
                ),
            ],
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
                            explanation:
                                "Promotes a user launcher into the system applications directory."
                                    .to_string(),
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
                let repaired = self
                    .library
                    .repair_launcher(target_id, Default::default())?;
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
            command: "update-desktop-database ~/.local/share/applications && kbuildsycoca6"
                .to_string(),
            privilege_level: PrivilegeLevel::UserWrite,
            explanation: "Rebuilds the application caches after desktop entry changes."
                .to_string(),
        }]
    }
}

struct PortableIntegratorTool<'a> {
    library: &'a LauncherLibrary,
}

impl LinuxTool for PortableIntegratorTool<'_> {
    fn definition(&self) -> ToolDefinition {
        definition(
            TOOL_PORTABLE_INTEGRATOR,
            "Portable App Integrator",
            ToolCategory::Apps,
            "Integrate AppImages, binaries, and scripts into the desktop with real launchers.",
            PrivilegeLevel::UserWrite,
            &["linux"],
            &["KDE", "GNOME", "Xfce", "XDG"],
            true,
            vec![
                action("integrate_path", "Integrate path", ToolActionKind::Install, true, false, false),
                action("relink_target", "Re-link target", ToolActionKind::Repair, true, false, false),
                action(
                    "remove_integration",
                    "Remove integration",
                    ToolActionKind::Remove,
                    false,
                    true,
                    false,
                ),
            ],
        )
    }

    fn status(&self) -> ToolStatus {
        ToolStatus {
            tool_id: TOOL_PORTABLE_INTEGRATOR.to_string(),
            available: true,
            summary: managed_portable_dir().display().to_string(),
            warnings: Vec::new(),
        }
    }

    fn scan(&self, _input: ToolScanInput) -> Result<ToolResult, CoreError> {
        let roots = portable_roots();
        let appimages = find_portables(&roots, &["AppImage", "appimage"]);
        let scripts = find_portables(&roots, &["sh", "py", "bin"]);
        result(
            TOOL_PORTABLE_INTEGRATOR,
            format!(
                "{} AppImage(s), {} script/binary candidate(s)",
                appimages.len(),
                scripts.len()
            ),
            json!({ "roots": roots, "appimages": appimages, "scripts": scripts }),
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
            "integrate_path" | "relink_target" => {
                let path = required_path(&input)?;
                let inspection = self.library.inspect_target(&path)?;
                let warnings = inspection.warnings.clone();
                validate_only(
                    TOOL_PORTABLE_INTEGRATOR,
                    format!("Ready to {action_id} {}", inspection.suggested_name),
                    json!({ "path": path, "inspection": inspection }),
                    warnings,
                    Vec::new(),
                    Vec::new(),
                )
            }
            "remove_integration" => {
                let target_id = required_value(&input, "A launcher id is required")?;
                validate_only(
                    TOOL_PORTABLE_INTEGRATOR,
                    format!("Ready to remove integration for {target_id}"),
                    json!({ "targetId": target_id }),
                    Vec::new(),
                    Vec::new(),
                    Vec::new(),
                )
            }
            _ => Err(CoreError::UnsupportedTarget(format!(
                "Unsupported portable integration action: {action_id}"
            ))),
        }
    }

    fn apply_action(&self, input: ToolActionInput) -> Result<ToolResult, CoreError> {
        let action_id = expect_action(&input)?;
        match action_id {
            "integrate_path" => integrate_target(self.library, &required_path(&input)?),
            "relink_target" => integrate_target(self.library, &required_path(&input)?),
            "remove_integration" => {
                let target_id = required_value(&input, "A launcher id is required")?;
                let before = self.library.get_launcher(target_id)?;
                self.library.delete_launcher(target_id)?;
                result(
                    TOOL_PORTABLE_INTEGRATOR,
                    format!("Removed integration for {}", before.name),
                    json!({ "removed": before.id }),
                    Vec::new(),
                    Vec::new(),
                    vec!["portable integration removed".to_string()],
                    Some(json!({ "before": before, "after": null })),
                    Vec::new(),
                    Vec::new(),
                )
            }
            _ => Err(CoreError::UnsupportedTarget(format!(
                "Unsupported portable integration action: {action_id}"
            ))),
        }
    }

    fn guided_admin_commands(&self) -> Vec<GuidedCommand> {
        Vec::new()
    }
}

struct AutostartActionsTool<'a> {
    library: &'a LauncherLibrary,
}

impl LinuxTool for AutostartActionsTool<'_> {
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
                action(
                    "enable_launcher",
                    "Enable selected launcher",
                    ToolActionKind::Install,
                    false,
                    true,
                    false,
                ),
                action("disable_path", "Disable path", ToolActionKind::Remove, true, false, false),
                action("repair_path", "Repair path", ToolActionKind::Repair, true, false, false),
                action("duplicate_path", "Duplicate path", ToolActionKind::Update, true, true, false),
            ],
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
            explanation: "Lists distro-managed startup entries that DeskCrafter leaves alone."
                .to_string(),
        }]
    }
}

struct DefaultAppsMimeTool;

impl LinuxTool for DefaultAppsMimeTool {
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
                action(
                    "set_default_browser",
                    "Set default browser",
                    ToolActionKind::Update,
                    false,
                    true,
                    false,
                ),
                action(
                    "set_system_default_mime",
                    "Set system MIME default",
                    ToolActionKind::ElevatedAction,
                    true,
                    true,
                    true,
                ),
            ],
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

struct FlatpakPermissionsTool;

impl LinuxTool for FlatpakPermissionsTool {
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
                action(
                    "grant_system_path",
                    "Grant system path",
                    ToolActionKind::ElevatedAction,
                    true,
                    true,
                    true,
                ),
            ],
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
            explanation: "Shows the current Flatpak permissions and overrides for an app."
                .to_string(),
        }]
    }
}

struct PermissionOwnershipTool;

impl LinuxTool for PermissionOwnershipTool {
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
            explanation:
                "Restores ownership when launcher directories were accidentally written as root."
                    .to_string(),
        }]
    }
}

struct ServiceActionsTool;

impl LinuxTool for ServiceActionsTool {
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

struct SystemProfileTool;

impl LinuxTool for SystemProfileTool {
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

fn integrate_target(library: &LauncherLibrary, path: &str) -> Result<ToolResult, CoreError> {
    let source = PathBuf::from(path);
    if !source.is_file() {
        return Err(CoreError::NotFound(format!(
            "Portable target does not exist: {}",
            source.display()
        )));
    }
    let inspection = library.inspect_target(path)?;
    let managed_path = copy_portable_if_needed(&source)?;
    set_user_file_executable(&managed_path)?;
    let input = crate::types::LauncherInput {
        name: inspection.suggested_name.clone(),
        description: format!("Integrated by DeskCrafter from {}", source.display()),
        exec_path: managed_path.display().to_string(),
        icon_path: String::new(),
        categories: vec!["Utility".to_string()],
        terminal: inspection.terminal,
        kind: inspection.kind,
        url: None,
    };
    let launcher = library.create_launcher(input)?;
    result(
        TOOL_PORTABLE_INTEGRATOR,
        format!("Integrated {}", inspection.suggested_name),
        json!({ "launcher": launcher, "managedPath": managed_path }),
        inspection.warnings,
        Vec::new(),
        vec![
            "portable file integrated".to_string(),
            "launcher created".to_string(),
            "desktop caches refreshed".to_string(),
        ],
        None,
        Vec::new(),
        Vec::new(),
    )
}

fn portable_roots() -> Vec<PathBuf> {
    vec![
        platform::home_dir().join("Applications"),
        platform::home_dir().join("Downloads"),
        platform::home_dir().join(".local/bin"),
        managed_portable_dir(),
    ]
}

fn managed_portable_dir() -> PathBuf {
    platform::data_home().join("deskcrafter").join(MANAGED_PORTABLE_DIR)
}

fn copy_portable_if_needed(source: &Path) -> Result<PathBuf, CoreError> {
    let destination_root = managed_portable_dir();
    fs::create_dir_all(&destination_root)?;
    if source.starts_with(&destination_root) {
        return Ok(source.to_path_buf());
    }
    let destination = destination_root.join(
        source
            .file_name()
            .ok_or_else(|| CoreError::InvalidInput("Target has no file name".to_string()))?,
    );
    fs::copy(source, &destination)?;
    Ok(destination)
}

fn find_portables(roots: &[PathBuf], extensions: &[&str]) -> Vec<serde_json::Value> {
    let mut entries = Vec::new();
    for root in roots {
        if !root.exists() {
            continue;
        }
        visit_directory(root, 0, &mut |path| {
            let Some(extension) = path.extension().and_then(|value| value.to_str()) else {
                return;
            };
            if extensions.iter().any(|candidate| extension.eq_ignore_ascii_case(candidate)) {
                entries.push(json!({
                    "path": path,
                    "executable": is_executable(path),
                    "sizeBytes": fs::metadata(path).map(|meta| meta.len()).unwrap_or(0)
                }));
            }
        });
    }
    entries
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

fn visit_directory(root: &Path, depth: usize, visitor: &mut impl FnMut(&Path)) {
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

fn run_command(command: &str, args: &[&str]) -> Result<(), CoreError> {
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

fn run_elevated_shell(command: &str) -> Result<i32, CoreError> {
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

fn refresh_desktop_entry_cache(applications_dir: &Path) {
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

fn refresh_autostart_cache() {
    for command in ["kbuildsycoca6", "kbuildsycoca5", "kbuildsycoca"] {
        let Ok(status) = Command::new(command).arg("--noincremental").status() else {
            continue;
        };
        if status.success() {
            break;
        }
    }
}

fn set_desktop_entry_key(content: &str, key: &str, value: &str) -> String {
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

fn set_user_file_executable(path: &Path) -> Result<(), CoreError> {
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let metadata = fs::metadata(path)?;
        let mut permissions = metadata.permissions();
        permissions.set_mode(permissions.mode() | 0o100);
        fs::set_permissions(path, permissions)?;
    }
    Ok(())
}

fn is_executable(path: &Path) -> bool {
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

fn is_owned_by_user(path: &Path) -> bool {
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

fn read_optional(path: &Path) -> Option<String> {
    fs::read_to_string(path).ok()
}

fn required_path(input: &ToolActionInput) -> Result<String, CoreError> {
    input
        .path
        .clone()
        .or(input.query.clone())
        .ok_or_else(|| CoreError::InvalidInput("A path or query is required".to_string()))
}

fn required_value<'a>(input: &'a ToolActionInput, message: &str) -> Result<&'a str, CoreError> {
    input
        .value
        .as_deref()
        .ok_or_else(|| CoreError::InvalidInput(message.to_string()))
}

fn shell_escape(input: &str) -> String {
    input.replace('\'', "'\"'\"'")
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{LauncherInput, LauncherKind};
    use tempfile::tempdir;

    #[test]
    fn registry_exposes_action_first_suite_tools() {
        let registry = ToolRegistry::default();
        let tools = registry.list_tools();
        let ids = tools.iter().map(|tool| tool.id.as_str()).collect::<Vec<_>>();
        assert_eq!(
            ids,
            vec![
                TOOL_LAUNCHER_REPAIR,
                TOOL_PORTABLE_INTEGRATOR,
                TOOL_AUTOSTART,
                TOOL_DEFAULT_APPS,
                TOOL_FLATPAK,
                TOOL_PERMISSIONS,
                TOOL_SERVICES,
                TOOL_SYSTEM_PROFILE,
            ]
        );
        assert!(tools
            .iter()
            .any(|tool| !tool.primary_actions.is_empty() && tool.reversible));
    }

    #[test]
    fn portable_integration_copies_target_into_managed_dir() {
        let temp = tempdir().expect("tempdir should exist");
        let source = temp.path().join("sample.AppImage");
        fs::write(&source, "placeholder").expect("file should be written");
        let destination_root = managed_portable_dir();
        let copied = copy_portable_if_needed(&source).expect("copy should work");
        assert!(copied.starts_with(destination_root));
    }

    #[test]
    fn desktop_key_updates_are_reversible() {
        let original = "[Desktop Entry]\nName=Sample\nHidden=false\n";
        let updated = set_desktop_entry_key(original, "Hidden", "true");
        assert!(updated.contains("Hidden=true"));
    }

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
