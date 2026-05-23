use crate::desktop_entry::{desktop_filename, generate, parse, validate_input};
use crate::error::CoreError;
use crate::icons;
use crate::inspectors;
use crate::platform;
use crate::safety;
use crate::types::{
    DesktopEntryContent, IconResolution, InspectTargetResult, IssueSeverity, Launcher,
    LauncherInput, LauncherIssue, RepairOptions, ValidationReport,
};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

#[derive(Debug, Clone)]
pub struct LauncherLibrary {
    applications_dir: PathBuf,
}

impl Default for LauncherLibrary {
    fn default() -> Self {
        Self::new(platform::applications_dir())
    }
}

impl LauncherLibrary {
    pub fn new(applications_dir: PathBuf) -> Self {
        Self { applications_dir }
    }

    pub fn applications_dir(&self) -> &Path {
        &self.applications_dir
    }

    pub fn list_launchers(&self) -> Result<Vec<Launcher>, CoreError> {
        if !self.applications_dir.exists() {
            return Ok(Vec::new());
        }
        let mut launchers = Vec::new();
        for entry in fs::read_dir(&self.applications_dir)? {
            let entry = entry?;
            let path = entry.path();
            if path.extension().and_then(|value| value.to_str()) != Some("desktop") {
                continue;
            }
            let Ok(content) = fs::read_to_string(&path) else {
                continue;
            };
            if let Ok(launcher) = parse(&content, path) {
                launchers.push(launcher);
            }
        }
        launchers.sort_by(|left, right| left.name.to_lowercase().cmp(&right.name.to_lowercase()));
        Ok(launchers)
    }

    pub fn get_launcher(&self, id: &str) -> Result<Launcher, CoreError> {
        self.list_launchers()?
            .into_iter()
            .find(|launcher| launcher.id == id)
            .ok_or_else(|| CoreError::NotFound(format!("Launcher not found: {id}")))
    }

    pub fn create_launcher(&self, input: LauncherInput) -> Result<Launcher, CoreError> {
        let content = generate(&input)?;
        safety::ensure_directory(&self.applications_dir)?;
        let path = self.applications_dir.join(desktop_filename(&input.name));
        safety::backup_if_exists(&path)?;
        fs::write(&path, content)?;
        set_executable_bit(&path)?;
        refresh_desktop_entry_cache(&self.applications_dir);
        self.get_launcher_from_path(path)
    }

    pub fn update_launcher(&self, id: &str, input: LauncherInput) -> Result<Launcher, CoreError> {
        let existing = self.get_launcher(id)?;
        let content = generate(&input)?;
        safety::backup_if_exists(&existing.desktop_file_path)?;
        fs::write(&existing.desktop_file_path, content)?;
        set_executable_bit(&existing.desktop_file_path)?;
        refresh_desktop_entry_cache(&self.applications_dir);
        self.get_launcher_from_path(existing.desktop_file_path)
    }

    pub fn delete_launcher(&self, id: &str) -> Result<(), CoreError> {
        let launcher = self.get_launcher(id)?;
        if !safety::is_probably_safe_launcher_path(&launcher.desktop_file_path) {
            return Err(CoreError::PermissionDenied(
                "Refusing to delete a non-desktop launcher path".to_string(),
            ));
        }
        safety::backup_if_exists(&launcher.desktop_file_path)?;
        fs::remove_file(&launcher.desktop_file_path)?;
        refresh_desktop_entry_cache(&self.applications_dir);
        Ok(())
    }

    pub fn launch_entry(&self, id: &str) -> Result<(), CoreError> {
        let launcher = self.get_launcher(id)?;
        Command::new("gtk-launch")
            .arg(
                launcher
                    .desktop_file_path
                    .file_stem()
                    .and_then(|value| value.to_str())
                    .unwrap_or(&launcher.id),
            )
            .spawn()
            .map(|_| ())
            .map_err(CoreError::Io)
    }

    pub fn inspect_target(&self, path_or_url: &str) -> Result<InspectTargetResult, CoreError> {
        inspectors::inspect_target(path_or_url)
    }

    pub fn validate_launcher(&self, input: &LauncherInput) -> ValidationReport {
        match validate_input(input) {
            Ok(warnings) => ValidationReport {
                valid: true,
                warnings,
                errors: Vec::new(),
                preview: generate(input).unwrap_or_default(),
            },
            Err(error) => ValidationReport {
                valid: false,
                warnings: Vec::new(),
                errors: vec![error.to_string()],
                preview: String::new(),
            },
        }
    }

    pub fn repair_launcher(
        &self,
        id: &str,
        _repair_options: RepairOptions,
    ) -> Result<Launcher, CoreError> {
        let launcher = self.get_launcher(id)?;
        let input = LauncherInput {
            name: launcher.name,
            description: launcher.description,
            exec_path: launcher.exec_path,
            icon_path: launcher.icon_path,
            categories: launcher.categories,
            terminal: launcher.terminal,
            kind: launcher.kind,
            url: launcher.url,
        };
        self.update_launcher(id, input)
    }

    pub fn resolve_icon(&self, input: &str) -> IconResolution {
        icons::resolve_icon(input)
    }

    pub fn scan_launcher_issues(&self) -> Result<Vec<LauncherIssue>, CoreError> {
        let mut issues = Vec::new();
        for launcher in self.list_launchers()? {
            if !launcher.exec_path.is_empty() {
                let exec_target = launcher
                    .exec_path
                    .split_whitespace()
                    .next()
                    .unwrap_or_default();
                if exec_target.starts_with('/') && !Path::new(exec_target).exists() {
                    issues.push(LauncherIssue {
                        launcher_id: Some(launcher.id.clone()),
                        path: launcher.desktop_file_path.clone(),
                        severity: IssueSeverity::Error,
                        message: format!("Missing executable: {exec_target}"),
                    });
                }
            }
            if !launcher.icon_path.is_empty() {
                let resolution = icons::resolve_icon(&launcher.icon_path);
                if !resolution.exists && resolution.theme_name.is_none() {
                    issues.push(LauncherIssue {
                        launcher_id: Some(launcher.id.clone()),
                        path: launcher.desktop_file_path.clone(),
                        severity: IssueSeverity::Warning,
                        message: format!("Missing icon: {}", launcher.icon_path),
                    });
                }
            }
        }
        Ok(issues)
    }

    pub fn preview(&self, input: &LauncherInput) -> Result<DesktopEntryContent, CoreError> {
        Ok(DesktopEntryContent {
            content: generate(input)?,
        })
    }

    fn get_launcher_from_path(&self, path: PathBuf) -> Result<Launcher, CoreError> {
        let content = fs::read_to_string(&path)?;
        parse(&content, path)
    }
}

#[cfg(unix)]
fn set_executable_bit(path: &Path) -> Result<(), CoreError> {
    use std::os::unix::fs::PermissionsExt;
    let metadata = fs::metadata(path)?;
    let mut permissions = metadata.permissions();
    permissions.set_mode(0o755);
    fs::set_permissions(path, permissions)?;
    Ok(())
}

#[cfg(not(unix))]
fn set_executable_bit(_path: &Path) -> Result<(), CoreError> {
    Ok(())
}

fn refresh_desktop_entry_cache(applications_dir: &Path) {
    if applications_dir != platform::applications_dir() {
        return;
    }

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
