use crate::desktop_entry;
use crate::error::CoreError;
use crate::launcher_library::LauncherLibrary;
use crate::platform;
use crate::types::{
    GuidedCommand, RiskLevel, ToolActionInput, ToolCategory, ToolDefinition, ToolResult,
    ToolScanInput, ToolStatus,
};
use serde::Serialize;
use serde_json::json;
use std::collections::{BTreeMap, BTreeSet};
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

const TOOL_LAUNCHERS: &str = "launcher_manager";
const TOOL_AUTOSTART: &str = "autostart_manager";
const TOOL_APPIMAGES: &str = "appimage_manager";
const TOOL_ENV_PATH: &str = "environment_path";
const TOOL_SERVICES: &str = "service_viewer";
const TOOL_DISK_CACHE: &str = "disk_cache_inspector";
const TOOL_PERMISSIONS: &str = "permissions_helper";
const TOOL_SYSTEM_PROFILE: &str = "system_profile";
const MAX_DIRECTORY_DEPTH: usize = 3;
const MAX_SERVICE_ROWS: usize = 80;

pub trait LinuxTool {
    fn definition(&self) -> ToolDefinition;
    fn status(&self) -> ToolStatus;
    fn scan(&self, input: ToolScanInput) -> Result<ToolResult, CoreError>;
    fn validate_action(&self, input: ToolActionInput) -> Result<ToolResult, CoreError>;
    fn apply_user_action(&self, input: ToolActionInput) -> Result<ToolResult, CoreError>;
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
        self.with_tool(tool_id, |tool| tool.apply_user_action(input))
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
            Box::new(LauncherManagerTool {
                library: &self.launcher_library,
            }),
            Box::new(AutostartManagerTool),
            Box::new(AppImageManagerTool),
            Box::new(EnvironmentPathTool),
            Box::new(ServiceViewerTool),
            Box::new(DiskCacheInspectorTool),
            Box::new(PermissionsHelperTool),
            Box::new(SystemProfileTool),
        ])
    }
}

fn definition(
    id: &str,
    label: &str,
    category: ToolCategory,
    description: &str,
    risk_level: RiskLevel,
    capabilities: &[&str],
) -> ToolDefinition {
    ToolDefinition {
        id: id.to_string(),
        label: label.to_string(),
        category,
        description: description.to_string(),
        risk_level,
        capabilities: capabilities
            .iter()
            .map(|value| (*value).to_string())
            .collect(),
        supported_distros: vec!["linux".to_string()],
    }
}

fn result<T: Serialize>(
    tool_id: &str,
    summary: impl Into<String>,
    data: T,
    warnings: Vec<String>,
    repair_suggestions: Vec<String>,
    guided_commands: Vec<GuidedCommand>,
) -> Result<ToolResult, CoreError> {
    Ok(ToolResult {
        tool_id: tool_id.to_string(),
        summary: summary.into(),
        data: serde_json::to_value(data)
            .map_err(|error| CoreError::Parse(format!("Failed to serialize tool data: {error}")))?,
        warnings,
        repair_suggestions,
        guided_commands,
    })
}

fn unsupported_action(tool_id: &str) -> Result<ToolResult, CoreError> {
    Err(CoreError::UnsupportedTarget(format!(
        "{tool_id} has no direct user-owned write action yet"
    )))
}

struct LauncherManagerTool<'a> {
    library: &'a LauncherLibrary,
}

impl LinuxTool for LauncherManagerTool<'_> {
    fn definition(&self) -> ToolDefinition {
        definition(
            TOOL_LAUNCHERS,
            "Launcher Manager",
            ToolCategory::Launchers,
            "Create, inspect, repair, and launch user application entries.",
            RiskLevel::UserWrite,
            &["desktop entries", "AppImages", "scripts", "URLs", "icons"],
        )
    }

    fn status(&self) -> ToolStatus {
        ToolStatus {
            tool_id: TOOL_LAUNCHERS.to_string(),
            available: true,
            summary: self.library.applications_dir().display().to_string(),
            warnings: Vec::new(),
        }
    }

    fn scan(&self, _input: ToolScanInput) -> Result<ToolResult, CoreError> {
        let launchers = self.library.list_launchers()?;
        let issues = self.library.scan_launcher_issues()?;
        result(
            TOOL_LAUNCHERS,
            format!("{} launcher(s), {} issue(s)", launchers.len(), issues.len()),
            json!({ "launchers": launchers, "issues": issues }),
            Vec::new(),
            if issues.is_empty() {
                Vec::new()
            } else {
                vec!["Open Launcher Doctor to repair broken metadata.".to_string()]
            },
            Vec::new(),
        )
    }

    fn validate_action(&self, _input: ToolActionInput) -> Result<ToolResult, CoreError> {
        unsupported_action(TOOL_LAUNCHERS)
    }

    fn apply_user_action(&self, _input: ToolActionInput) -> Result<ToolResult, CoreError> {
        unsupported_action(TOOL_LAUNCHERS)
    }

    fn guided_admin_commands(&self) -> Vec<GuidedCommand> {
        Vec::new()
    }
}

struct AutostartManagerTool;

impl LinuxTool for AutostartManagerTool {
    fn definition(&self) -> ToolDefinition {
        definition(
            TOOL_AUTOSTART,
            "Autostart Manager",
            ToolCategory::Startup,
            "Inspect user and system autostart entries.",
            RiskLevel::UserWrite,
            &["XDG autostart", "startup visibility", "user-owned entries"],
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
        let user_entries = list_desktop_files(&user_dir);
        let system_entries = list_desktop_files(&system_dir);
        result(
            TOOL_AUTOSTART,
            format!(
                "{} user autostart entry(s), {} system entry(s)",
                user_entries.len(),
                system_entries.len()
            ),
            json!({
                "userDir": user_dir,
                "systemDir": system_dir,
                "userEntries": user_entries,
                "systemEntries": system_entries
            }),
            missing_dir_warning(
                &platform::autostart_dir(),
                "User autostart directory does not exist yet",
            ),
            Vec::new(),
            vec![GuidedCommand {
                label: "Open system autostart directory".to_string(),
                command: "ls /etc/xdg/autostart".to_string(),
                risk_level: RiskLevel::ReadOnly,
                explanation: "Lists distro-provided startup entries without modifying them."
                    .to_string(),
            }],
        )
    }

    fn validate_action(&self, _input: ToolActionInput) -> Result<ToolResult, CoreError> {
        unsupported_action(TOOL_AUTOSTART)
    }

    fn apply_user_action(&self, _input: ToolActionInput) -> Result<ToolResult, CoreError> {
        unsupported_action(TOOL_AUTOSTART)
    }

    fn guided_admin_commands(&self) -> Vec<GuidedCommand> {
        Vec::new()
    }
}

struct AppImageManagerTool;

impl LinuxTool for AppImageManagerTool {
    fn definition(&self) -> ToolDefinition {
        definition(
            TOOL_APPIMAGES,
            "AppImage Manager",
            ToolCategory::Apps,
            "Find AppImages and report integration readiness.",
            RiskLevel::ReadOnly,
            &[
                "AppImage discovery",
                "executable bit",
                "launcher integration hints",
            ],
        )
    }

    fn status(&self) -> ToolStatus {
        ToolStatus {
            tool_id: TOOL_APPIMAGES.to_string(),
            available: true,
            summary: "Searches common user app folders".to_string(),
            warnings: Vec::new(),
        }
    }

    fn scan(&self, _input: ToolScanInput) -> Result<ToolResult, CoreError> {
        let roots = appimage_roots();
        let appimages = find_appimages(&roots);
        let suggestions = if appimages.is_empty() {
            vec![
                "Place AppImages in ~/Applications or ~/Downloads to make discovery easier."
                    .to_string(),
            ]
        } else {
            vec!["Use Launcher Manager to integrate discovered AppImages.".to_string()]
        };
        result(
            TOOL_APPIMAGES,
            format!("{} AppImage file(s) found", appimages.len()),
            json!({ "roots": roots, "appimages": appimages }),
            Vec::new(),
            suggestions,
            Vec::new(),
        )
    }

    fn validate_action(&self, _input: ToolActionInput) -> Result<ToolResult, CoreError> {
        unsupported_action(TOOL_APPIMAGES)
    }

    fn apply_user_action(&self, _input: ToolActionInput) -> Result<ToolResult, CoreError> {
        unsupported_action(TOOL_APPIMAGES)
    }

    fn guided_admin_commands(&self) -> Vec<GuidedCommand> {
        Vec::new()
    }
}

struct EnvironmentPathTool;

impl LinuxTool for EnvironmentPathTool {
    fn definition(&self) -> ToolDefinition {
        definition(
            TOOL_ENV_PATH,
            "Environment & PATH Viewer",
            ToolCategory::System,
            "Inspect PATH entries, duplicates, missing directories, and shell profile files.",
            RiskLevel::ReadOnly,
            &["PATH", "shell profiles", "user bin directories"],
        )
    }

    fn status(&self) -> ToolStatus {
        ToolStatus {
            tool_id: TOOL_ENV_PATH.to_string(),
            available: true,
            summary: "Reads process environment only".to_string(),
            warnings: Vec::new(),
        }
    }

    fn scan(&self, _input: ToolScanInput) -> Result<ToolResult, CoreError> {
        let path_value = env::var("PATH").unwrap_or_default();
        let entries: Vec<PathBuf> = env::split_paths(&path_value).collect();
        let mut seen = BTreeSet::new();
        let mut duplicates = Vec::new();
        let mut missing = Vec::new();
        for entry in &entries {
            let rendered = entry.display().to_string();
            if !seen.insert(rendered.clone()) {
                duplicates.push(rendered);
            }
            if !entry.is_dir() {
                missing.push(entry.display().to_string());
            }
        }
        let shell_profiles = shell_profiles();
        result(
            TOOL_ENV_PATH,
            format!(
                "{} PATH entrie(s), {} duplicate(s), {} missing",
                entries.len(),
                duplicates.len(),
                missing.len()
            ),
            json!({
                "entries": entries,
                "duplicates": duplicates,
                "missing": missing,
                "shellProfiles": shell_profiles
            }),
            Vec::new(),
            vec![
                "Keep PATH edits in shell profile files and avoid duplicate directories."
                    .to_string(),
            ],
            Vec::new(),
        )
    }

    fn validate_action(&self, _input: ToolActionInput) -> Result<ToolResult, CoreError> {
        unsupported_action(TOOL_ENV_PATH)
    }

    fn apply_user_action(&self, _input: ToolActionInput) -> Result<ToolResult, CoreError> {
        unsupported_action(TOOL_ENV_PATH)
    }

    fn guided_admin_commands(&self) -> Vec<GuidedCommand> {
        Vec::new()
    }
}

struct ServiceViewerTool;

impl LinuxTool for ServiceViewerTool {
    fn definition(&self) -> ToolDefinition {
        definition(
            TOOL_SERVICES,
            "Service Viewer",
            ToolCategory::System,
            "Read user and system systemd service state without making admin writes.",
            RiskLevel::GuidedAdmin,
            &["systemd", "user services", "guided admin commands"],
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
                vec!["This system may not use systemd.".to_string()]
            },
        }
    }

    fn scan(&self, _input: ToolScanInput) -> Result<ToolResult, CoreError> {
        if !platform::command_exists("systemctl") {
            return result(
                TOOL_SERVICES,
                "systemctl is not available",
                json!({ "userServices": [], "systemServices": [] }),
                vec!["Service Viewer is read-only and requires systemctl for scans.".to_string()],
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
            self.guided_admin_commands(),
        )
    }

    fn validate_action(&self, _input: ToolActionInput) -> Result<ToolResult, CoreError> {
        unsupported_action(TOOL_SERVICES)
    }

    fn apply_user_action(&self, _input: ToolActionInput) -> Result<ToolResult, CoreError> {
        unsupported_action(TOOL_SERVICES)
    }

    fn guided_admin_commands(&self) -> Vec<GuidedCommand> {
        vec![
            GuidedCommand {
                label: "Check a service".to_string(),
                command: "systemctl status <service-name>".to_string(),
                risk_level: RiskLevel::ReadOnly,
                explanation: "Shows status for a system service without changing it.".to_string(),
            },
            GuidedCommand {
                label: "Enable a user service".to_string(),
                command: "systemctl --user enable --now <service-name>".to_string(),
                risk_level: RiskLevel::UserWrite,
                explanation: "Starts and enables a user-owned systemd service.".to_string(),
            },
            GuidedCommand {
                label: "Enable a system service".to_string(),
                command: "sudo systemctl enable --now <service-name>".to_string(),
                risk_level: RiskLevel::GuidedAdmin,
                explanation:
                    "Requires admin privileges and is intentionally shown as a guided command."
                        .to_string(),
            },
        ]
    }
}

struct DiskCacheInspectorTool;

impl LinuxTool for DiskCacheInspectorTool {
    fn definition(&self) -> ToolDefinition {
        definition(
            TOOL_DISK_CACHE,
            "Disk & Cache Inspector",
            ToolCategory::Storage,
            "Read safe user-owned cache sizes and suggest cleanup commands.",
            RiskLevel::ReadOnly,
            &["cache sizes", "trash visibility", "safe cleanup planning"],
        )
    }

    fn status(&self) -> ToolStatus {
        ToolStatus {
            tool_id: TOOL_DISK_CACHE.to_string(),
            available: true,
            summary: "Read-only size scan".to_string(),
            warnings: Vec::new(),
        }
    }

    fn scan(&self, _input: ToolScanInput) -> Result<ToolResult, CoreError> {
        let targets = cache_targets();
        let sizes: Vec<_> = targets
            .iter()
            .map(|path| {
                json!({
                    "path": path,
                    "exists": path.exists(),
                    "bytes": directory_size(path)
                })
            })
            .collect();
        result(
            TOOL_DISK_CACHE,
            format!("{} safe cache location(s) inspected", targets.len()),
            json!({ "targets": sizes }),
            Vec::new(),
            vec!["Review cache locations before deleting anything outside the app.".to_string()],
            vec![GuidedCommand {
                label: "Check user cache size".to_string(),
                command: "du -sh ~/.cache ~/.npm ~/.local/share/Trash 2>/dev/null".to_string(),
                risk_level: RiskLevel::ReadOnly,
                explanation: "Summarizes common user-owned cache and trash locations.".to_string(),
            }],
        )
    }

    fn validate_action(&self, _input: ToolActionInput) -> Result<ToolResult, CoreError> {
        unsupported_action(TOOL_DISK_CACHE)
    }

    fn apply_user_action(&self, _input: ToolActionInput) -> Result<ToolResult, CoreError> {
        unsupported_action(TOOL_DISK_CACHE)
    }

    fn guided_admin_commands(&self) -> Vec<GuidedCommand> {
        Vec::new()
    }
}

struct PermissionsHelperTool;

impl LinuxTool for PermissionsHelperTool {
    fn definition(&self) -> ToolDefinition {
        definition(
            TOOL_PERMISSIONS,
            "Permissions Helper",
            ToolCategory::Permissions,
            "Inspect file executability and offer safe user-owned chmod actions.",
            RiskLevel::UserWrite,
            &["file permissions", "executable bit", "ownership hints"],
        )
    }

    fn status(&self) -> ToolStatus {
        ToolStatus {
            tool_id: TOOL_PERMISSIONS.to_string(),
            available: true,
            summary: "Requires a selected path for detailed inspection".to_string(),
            warnings: Vec::new(),
        }
    }

    fn scan(&self, input: ToolScanInput) -> Result<ToolResult, CoreError> {
        let Some(path) = input.path.or(input.query) else {
            return result(
                TOOL_PERMISSIONS,
                "Provide a path to inspect permissions",
                json!({ "pathRequired": true }),
                vec!["No path was provided.".to_string()],
                Vec::new(),
                Vec::new(),
            );
        };
        let path = PathBuf::from(path);
        let metadata = fs::metadata(&path).map_err(CoreError::Io)?;
        let executable = is_executable(&metadata);
        result(
            TOOL_PERMISSIONS,
            format!(
                "{} is {}",
                path.display(),
                if executable {
                    "executable"
                } else {
                    "not executable"
                }
            ),
            json!({
                "path": path,
                "isFile": metadata.is_file(),
                "isDir": metadata.is_dir(),
                "executable": executable,
                "readonly": metadata.permissions().readonly()
            }),
            Vec::new(),
            if executable {
                Vec::new()
            } else {
                vec![
                    "If this is a script or AppImage you own, mark it executable before launching."
                        .to_string(),
                ]
            },
            vec![GuidedCommand {
                label: "Mark user file executable".to_string(),
                command: "chmod u+x <path>".to_string(),
                risk_level: RiskLevel::UserWrite,
                explanation: "Only use this for files you own and intend to run.".to_string(),
            }],
        )
    }

    fn validate_action(&self, input: ToolActionInput) -> Result<ToolResult, CoreError> {
        let path = input
            .path
            .ok_or_else(|| CoreError::InvalidInput("A path is required".to_string()))?;
        result(
            TOOL_PERMISSIONS,
            "Executable-bit action is valid for user-owned files only",
            json!({ "path": path, "action": input.action }),
            Vec::new(),
            Vec::new(),
            vec![GuidedCommand {
                label: "Manual chmod".to_string(),
                command: "chmod u+x <path>".to_string(),
                risk_level: RiskLevel::UserWrite,
                explanation: "Use when the app cannot safely confirm ownership.".to_string(),
            }],
        )
    }

    fn apply_user_action(&self, input: ToolActionInput) -> Result<ToolResult, CoreError> {
        let path = input
            .path
            .ok_or_else(|| CoreError::InvalidInput("A path is required".to_string()))?;
        let action = input
            .action
            .unwrap_or_else(|| "make_executable".to_string());
        if action != "make_executable" {
            return Err(CoreError::UnsupportedTarget(format!(
                "Unsupported permission action: {action}"
            )));
        }
        let path = PathBuf::from(path);
        mark_user_file_executable(&path)?;
        result(
            TOOL_PERMISSIONS,
            format!("Marked {} executable", path.display()),
            json!({ "path": path, "action": action }),
            Vec::new(),
            Vec::new(),
            Vec::new(),
        )
    }

    fn guided_admin_commands(&self) -> Vec<GuidedCommand> {
        vec![GuidedCommand {
            label: "Inspect ownership".to_string(),
            command: "ls -l <path>".to_string(),
            risk_level: RiskLevel::ReadOnly,
            explanation: "Shows owner and permissions before changing anything.".to_string(),
        }]
    }
}

struct SystemProfileTool;

impl LinuxTool for SystemProfileTool {
    fn definition(&self) -> ToolDefinition {
        definition(
            TOOL_SYSTEM_PROFILE,
            "System Profile",
            ToolCategory::System,
            "Show distro, session, XDG paths, and integration capabilities.",
            RiskLevel::ReadOnly,
            &["distro", "XDG", "systemd", "Flatpak", "package manager"],
        )
    }

    fn status(&self) -> ToolStatus {
        ToolStatus {
            tool_id: TOOL_SYSTEM_PROFILE.to_string(),
            available: true,
            summary: platform::system_profile()
                .distro
                .unwrap_or_else(|| "Linux".to_string()),
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
        )
    }

    fn validate_action(&self, _input: ToolActionInput) -> Result<ToolResult, CoreError> {
        unsupported_action(TOOL_SYSTEM_PROFILE)
    }

    fn apply_user_action(&self, _input: ToolActionInput) -> Result<ToolResult, CoreError> {
        unsupported_action(TOOL_SYSTEM_PROFILE)
    }

    fn guided_admin_commands(&self) -> Vec<GuidedCommand> {
        Vec::new()
    }
}

fn list_desktop_files(dir: &Path) -> Vec<BTreeMap<String, String>> {
    let Ok(entries) = fs::read_dir(dir) else {
        return Vec::new();
    };
    entries
        .filter_map(Result::ok)
        .filter_map(|entry| {
            let path = entry.path();
            if path.extension().and_then(|value| value.to_str()) != Some("desktop") {
                return None;
            }
            let content = fs::read_to_string(&path).ok()?;
            let parsed = desktop_entry::parse(&content, path.clone()).ok();
            let mut data = BTreeMap::new();
            data.insert("path".to_string(), path.display().to_string());
            data.insert(
                "name".to_string(),
                parsed
                    .map(|launcher| launcher.name)
                    .unwrap_or_else(|| entry.file_name().to_string_lossy().to_string()),
            );
            Some(data)
        })
        .collect()
}

fn missing_dir_warning(path: &Path, message: &str) -> Vec<String> {
    if path.exists() {
        Vec::new()
    } else {
        vec![message.to_string()]
    }
}

fn appimage_roots() -> Vec<PathBuf> {
    let home = platform::home_dir();
    vec![
        home.join("Applications"),
        home.join("Downloads"),
        home.join(".local/bin"),
        home.join("bin"),
    ]
}

fn find_appimages(roots: &[PathBuf]) -> Vec<serde_json::Value> {
    let mut found = Vec::new();
    for root in roots {
        visit_limited(root, 0, &mut |path| {
            if path
                .extension()
                .and_then(|value| value.to_str())
                .map(|value| value.eq_ignore_ascii_case("AppImage"))
                .unwrap_or(false)
            {
                found.push(json!({
                    "path": path,
                    "executable": fs::metadata(path).map(|metadata| is_executable(&metadata)).unwrap_or(false)
                }));
            }
        });
    }
    found
}

fn visit_limited(path: &Path, depth: usize, callback: &mut impl FnMut(&Path)) {
    if depth > MAX_DIRECTORY_DEPTH || !path.exists() {
        return;
    }
    let Ok(entries) = fs::read_dir(path) else {
        return;
    };
    for entry in entries.filter_map(Result::ok) {
        let path = entry.path();
        if path.is_dir() {
            visit_limited(&path, depth + 1, callback);
        } else {
            callback(&path);
        }
    }
}

fn shell_profiles() -> Vec<serde_json::Value> {
    let home = platform::home_dir();
    [
        ".profile",
        ".bashrc",
        ".bash_profile",
        ".zshrc",
        ".config/fish/config.fish",
    ]
    .iter()
    .map(|relative| {
        let path = home.join(relative);
        json!({ "path": path, "exists": path.exists() })
    })
    .collect()
}

fn service_rows(args: &[&str]) -> Vec<serde_json::Value> {
    let Ok(output) = Command::new("systemctl").args(args).output() else {
        return Vec::new();
    };
    String::from_utf8_lossy(&output.stdout)
        .lines()
        .take(MAX_SERVICE_ROWS)
        .map(|line| {
            let mut parts = line.split_whitespace();
            json!({
                "name": parts.next().unwrap_or_default(),
                "state": parts.next().unwrap_or_default(),
                "preset": parts.next().unwrap_or_default()
            })
        })
        .collect()
}

fn cache_targets() -> Vec<PathBuf> {
    let home = platform::home_dir();
    vec![
        home.join(".cache"),
        home.join(".npm"),
        home.join(".local/share/Trash"),
        home.join(".var/app"),
    ]
}

fn directory_size(path: &Path) -> u64 {
    if !path.exists() {
        return 0;
    }
    if path.is_file() {
        return path.metadata().map(|metadata| metadata.len()).unwrap_or(0);
    }
    let Ok(entries) = fs::read_dir(path) else {
        return 0;
    };
    entries
        .filter_map(Result::ok)
        .map(|entry| directory_size(&entry.path()))
        .sum()
}

#[cfg(unix)]
fn is_executable(metadata: &fs::Metadata) -> bool {
    use std::os::unix::fs::PermissionsExt;
    metadata.permissions().mode() & 0o111 != 0
}

#[cfg(not(unix))]
fn is_executable(_metadata: &fs::Metadata) -> bool {
    false
}

#[cfg(unix)]
fn mark_user_file_executable(path: &Path) -> Result<(), CoreError> {
    use std::os::unix::fs::{MetadataExt, PermissionsExt};
    let metadata = fs::metadata(path)?;
    let current_uid = current_uid();
    if metadata.uid() != current_uid {
        return Err(CoreError::PermissionDenied(
            "Refusing to chmod a file not owned by the current user".to_string(),
        ));
    }
    let mut permissions = metadata.permissions();
    permissions.set_mode(permissions.mode() | 0o100);
    fs::set_permissions(path, permissions)?;
    Ok(())
}

#[cfg(unix)]
fn current_uid() -> u32 {
    env::var("UID")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or_else(|| {
            Command::new("id")
                .arg("-u")
                .output()
                .ok()
                .and_then(|output| String::from_utf8(output.stdout).ok())
                .and_then(|value| value.trim().parse().ok())
                .unwrap_or(u32::MAX)
        })
}

#[cfg(not(unix))]
fn mark_user_file_executable(_path: &Path) -> Result<(), CoreError> {
    Err(CoreError::UnsupportedTarget(
        "Permission changes are only implemented on Unix-like systems".to_string(),
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn registry_exposes_practical_suite_tools() {
        let tools = ToolRegistry::default().list_tools();
        assert!(tools.iter().any(|tool| tool.id == TOOL_LAUNCHERS));
        assert!(tools.iter().any(|tool| tool.id == TOOL_AUTOSTART));
        assert!(tools.iter().any(|tool| tool.id == TOOL_SYSTEM_PROFILE));
        assert_eq!(tools.len(), 8);
    }

    #[test]
    fn path_tool_scan_reports_path_data() {
        let registry = ToolRegistry::default();
        let result = registry
            .run_tool_scan(TOOL_ENV_PATH, ToolScanInput::default())
            .expect("path scan should work");
        assert_eq!(result.tool_id, TOOL_ENV_PATH);
        assert!(result.data.get("entries").is_some());
    }
}
