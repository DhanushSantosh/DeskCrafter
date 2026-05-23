use crate::error::CoreError;
use crate::safety::require_existing_file;
use crate::types::{InspectTargetResult, LauncherKind};
use std::path::Path;

pub fn inspect_target(path_or_url: &str) -> Result<InspectTargetResult, CoreError> {
    let trimmed = path_or_url.trim();
    if trimmed.starts_with("http://") || trimmed.starts_with("https://") {
        return Ok(InspectTargetResult {
            kind: LauncherKind::Url,
            suggested_name: host_label(trimmed),
            exec_path: String::new(),
            terminal: false,
            warnings: Vec::new(),
        });
    }

    let path = Path::new(trimmed);
    require_existing_file(path)?;
    let file_name = path
        .file_stem()
        .and_then(|value| value.to_str())
        .unwrap_or("Launcher")
        .replace(['_', '-'], " ");
    let extension = path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or_default();
    let kind = if extension.eq_ignore_ascii_case("AppImage") {
        LauncherKind::AppImage
    } else if matches!(extension, "sh" | "py") {
        LauncherKind::Script
    } else {
        LauncherKind::Application
    };
    let terminal = matches!(extension, "sh");
    let mut warnings = Vec::new();
    if kind == LauncherKind::AppImage {
        warnings.push("AppImage files may need executable permissions before launch".to_string());
    }

    Ok(InspectTargetResult {
        kind,
        suggested_name: title_case(&file_name),
        exec_path: trimmed.to_string(),
        terminal,
        warnings,
    })
}

fn host_label(url: &str) -> String {
    let without_scheme = url
        .trim_start_matches("https://")
        .trim_start_matches("http://");
    without_scheme
        .split('/')
        .next()
        .filter(|value| !value.is_empty())
        .unwrap_or("Web Launcher")
        .to_string()
}

fn title_case(value: &str) -> String {
    value
        .split_whitespace()
        .map(|word| {
            let mut chars = word.chars();
            match chars.next() {
                Some(first) => format!("{}{}", first.to_uppercase(), chars.as_str()),
                None => String::new(),
            }
        })
        .collect::<Vec<_>>()
        .join(" ")
}
