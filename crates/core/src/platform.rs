use serde::{Deserialize, Serialize};
use std::env;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SystemProfile {
    pub data_home: PathBuf,
    pub config_home: PathBuf,
    pub applications_dir: PathBuf,
    pub metadata_dir: PathBuf,
    pub desktop_session: Option<String>,
    pub distro: Option<String>,
    pub package_manager: Option<String>,
    pub has_systemd: bool,
    pub has_flatpak: bool,
    pub has_appimage_support: bool,
}

pub fn home_dir() -> PathBuf {
    env::var_os("HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("."))
}

pub fn data_home() -> PathBuf {
    env::var_os("XDG_DATA_HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|| home_dir().join(".local/share"))
}

pub fn config_home() -> PathBuf {
    env::var_os("XDG_CONFIG_HOME")
        .map(PathBuf::from)
        .unwrap_or_else(|| home_dir().join(".config"))
}

pub fn applications_dir() -> PathBuf {
    data_home().join("applications")
}

pub fn metadata_dir() -> PathBuf {
    data_home().join("deskcrafter")
}

pub fn system_profile() -> SystemProfile {
    SystemProfile {
        data_home: data_home(),
        config_home: config_home(),
        applications_dir: applications_dir(),
        metadata_dir: metadata_dir(),
        desktop_session: env::var("XDG_CURRENT_DESKTOP")
            .ok()
            .or_else(|| env::var("DESKTOP_SESSION").ok()),
        distro: read_os_release_name(),
        package_manager: detect_package_manager(),
        has_systemd: command_exists("systemctl"),
        has_flatpak: command_exists("flatpak"),
        has_appimage_support: true,
    }
}

fn read_os_release_name() -> Option<String> {
    let content = std::fs::read_to_string("/etc/os-release").ok()?;
    for line in content.lines() {
        if let Some(value) = line.strip_prefix("PRETTY_NAME=") {
            return Some(value.trim_matches('"').to_string());
        }
    }
    None
}

pub fn autostart_dir() -> PathBuf {
    config_home().join("autostart")
}

pub fn command_exists(command: &str) -> bool {
    env::var_os("PATH")
        .map(|paths| {
            env::split_paths(&paths).any(|dir| {
                let candidate = dir.join(command);
                candidate.is_file()
            })
        })
        .unwrap_or(false)
}

fn detect_package_manager() -> Option<String> {
    for command in ["dnf", "apt", "zypper", "pacman", "apk"] {
        if command_exists(command) {
            return Some(command.to_string());
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn applications_dir_uses_data_home() {
        let path = applications_dir();
        assert!(path.ends_with("applications"));
    }
}
