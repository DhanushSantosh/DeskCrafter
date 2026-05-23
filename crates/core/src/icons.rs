use crate::types::IconResolution;
use std::path::{Path, PathBuf};

const ICON_EXTENSIONS: &[&str] = &["png", "svg", "xpm", "jpg", "jpeg"];

pub fn resolve_icon(input: &str) -> IconResolution {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return IconResolution {
            input: input.to_string(),
            resolved_path: None,
            theme_name: None,
            exists: false,
        };
    }

    let candidate = PathBuf::from(trimmed);
    if candidate.is_absolute() && candidate.is_file() {
        return found_path(input, candidate);
    }

    if let Some(path) = resolve_with_extension(Path::new(trimmed)) {
        return found_path(input, path);
    }

    for dir in icon_search_dirs() {
        let base = dir.join(trimmed);
        if base.is_file() {
            return found_path(input, base);
        }
        if let Some(path) = resolve_with_extension(&base) {
            return found_path(input, path);
        }
    }

    IconResolution {
        input: input.to_string(),
        resolved_path: None,
        theme_name: Some(trimmed.to_string()),
        exists: false,
    }
}

fn found_path(input: &str, path: PathBuf) -> IconResolution {
    IconResolution {
        input: input.to_string(),
        resolved_path: Some(path),
        theme_name: None,
        exists: true,
    }
}

fn resolve_with_extension(base: &Path) -> Option<PathBuf> {
    for extension in ICON_EXTENSIONS {
        let candidate = base.with_extension(extension);
        if candidate.is_file() {
            return Some(candidate);
        }
    }
    None
}

fn icon_search_dirs() -> Vec<PathBuf> {
    let mut dirs = Vec::new();
    if let Some(home) = std::env::var_os("HOME") {
        let home = PathBuf::from(home);
        dirs.push(home.join(".local/share/icons/hicolor/48x48/apps"));
        dirs.push(home.join(".local/share/icons/hicolor/256x256/apps"));
        dirs.push(home.join(".local/share/icons/hicolor/512x512/apps"));
        dirs.push(home.join(".local/share/pixmaps"));
    }
    dirs.push(PathBuf::from("/usr/share/icons/hicolor/48x48/apps"));
    dirs.push(PathBuf::from("/usr/share/icons/hicolor/256x256/apps"));
    dirs.push(PathBuf::from("/usr/share/icons/hicolor/512x512/apps"));
    dirs.push(PathBuf::from("/usr/share/pixmaps"));
    dirs
}
