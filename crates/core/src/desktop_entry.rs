use crate::error::CoreError;
use crate::types::{Launcher, LauncherInput, LauncherKind};
use std::collections::BTreeMap;
use std::path::PathBuf;

const DESKTOP_ENTRY_HEADER: &str = "[Desktop Entry]";
const DESKCRAFTER_FLAG: &str = "X-DeskCrafter";
const DESKCRAFTER_FLAG_VALUE: &str = "true";
const DEFAULT_CATEGORY: &str = "Utility";
const STARTUP_WM_CLASS: &str = "DeskCrafter";

pub fn normalize_categories(categories: &[String]) -> Vec<String> {
    let mut normalized = Vec::new();
    for category in categories {
        let trimmed = category.trim();
        if !trimmed.is_empty() && !normalized.iter().any(|item| item == trimmed) {
            normalized.push(trimmed.to_string());
        }
    }
    if normalized.is_empty() {
        normalized.push(DEFAULT_CATEGORY.to_string());
    }
    normalized
}

pub fn sanitize_single_line(value: &str) -> String {
    value.split_whitespace().collect::<Vec<_>>().join(" ")
}

pub fn launcher_id_from_name(name: &str) -> String {
    let mut id = String::new();
    for character in name.trim().chars() {
        if character.is_ascii_alphanumeric() {
            id.push(character.to_ascii_lowercase());
        } else if matches!(character, ' ' | '-' | '_' | '.') && !id.ends_with('-') {
            id.push('-');
        }
    }
    let trimmed = id.trim_matches('-').to_string();
    if trimmed.is_empty() {
        "launcher".to_string()
    } else {
        trimmed
    }
}

pub fn desktop_filename(name: &str) -> String {
    format!("deskcrafter-{}.desktop", launcher_id_from_name(name))
}

pub fn validate_input(input: &LauncherInput) -> Result<Vec<String>, CoreError> {
    let mut warnings = Vec::new();
    if sanitize_single_line(&input.name).is_empty() {
        return Err(CoreError::InvalidInput(
            "Launcher name is required".to_string(),
        ));
    }
    match input.kind {
        LauncherKind::Url => {
            let url = input.url.as_deref().unwrap_or_default();
            if !(url.starts_with("http://") || url.starts_with("https://")) {
                return Err(CoreError::InvalidInput(
                    "URL launchers require an http:// or https:// URL".to_string(),
                ));
            }
        }
        _ => {
            if sanitize_single_line(&input.exec_path).is_empty() {
                return Err(CoreError::InvalidInput(
                    "Executable path is required".to_string(),
                ));
            }
        }
    }
    if input.icon_path.trim().is_empty() {
        warnings.push(
            "No icon is configured; the desktop environment may use a fallback icon".to_string(),
        );
    }
    if input.categories.is_empty() {
        warnings.push("No categories were selected; Utility will be used".to_string());
    }
    Ok(warnings)
}

pub fn generate(input: &LauncherInput) -> Result<String, CoreError> {
    validate_input(input)?;
    let name = sanitize_single_line(&input.name);
    let description = sanitize_single_line(&input.description);
    let icon_path = sanitize_single_line(&input.icon_path);
    let categories = normalize_categories(&input.categories);
    let terminal = if input.terminal { "true" } else { "false" };

    let mut lines = vec![
        DESKTOP_ENTRY_HEADER.to_string(),
        "Version=1.0".to_string(),
        format!(
            "Type={}",
            if input.kind == LauncherKind::Url {
                "Link"
            } else {
                "Application"
            }
        ),
        format!("Name={name}"),
    ];

    if !description.is_empty() {
        lines.push(format!("Comment={description}"));
    }

    if input.kind == LauncherKind::Url {
        lines.push(format!(
            "URL={}",
            sanitize_single_line(input.url.as_deref().unwrap_or_default())
        ));
    } else {
        let exec_path = sanitize_single_line(&input.exec_path);
        lines.push(format!("Exec={exec_path}"));
        if let Some(try_exec) = exec_path.split_whitespace().next() {
            lines.push(format!("TryExec={try_exec}"));
        }
    }

    if !icon_path.is_empty() {
        lines.push(format!("Icon={icon_path}"));
    }
    lines.push(format!("Categories={};", categories.join(";")));
    lines.push(format!("Terminal={terminal}"));
    lines.push(format!("{DESKCRAFTER_FLAG}={DESKCRAFTER_FLAG_VALUE}"));
    lines.push(format!("StartupWMClass={STARTUP_WM_CLASS}"));
    lines.push(String::new());
    Ok(lines.join("\n"))
}

pub fn parse(content: &str, path: PathBuf) -> Result<Launcher, CoreError> {
    let mut data = BTreeMap::new();
    let first_non_empty = content.lines().find(|line| !line.trim().is_empty());
    if first_non_empty != Some(DESKTOP_ENTRY_HEADER) {
        return Err(CoreError::Parse(
            "Desktop entry header is missing".to_string(),
        ));
    }
    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') || !trimmed.contains('=') {
            continue;
        }
        let Some((key, value)) = trimmed.split_once('=') else {
            continue;
        };
        if !key.trim().is_empty() {
            data.insert(key.trim().to_string(), value.trim().to_string());
        }
    }

    let name = data.get("Name").cloned().unwrap_or_default();
    if name.is_empty() {
        return Err(CoreError::Parse(
            "Desktop entry name is missing".to_string(),
        ));
    }

    let kind = if data.get("Type").map(String::as_str) == Some("Link") {
        LauncherKind::Url
    } else {
        LauncherKind::Application
    };
    let categories = data
        .get("Categories")
        .map(|raw| raw.split(';').map(str::to_string).collect::<Vec<_>>())
        .unwrap_or_default();
    let id = launcher_id_from_name(&name);

    Ok(Launcher {
        id,
        name,
        description: data.get("Comment").cloned().unwrap_or_default(),
        exec_path: data.get("Exec").cloned().unwrap_or_default(),
        icon_path: data.get("Icon").cloned().unwrap_or_default(),
        categories: normalize_categories(&categories),
        terminal: data
            .get("Terminal")
            .map(|value| value.eq_ignore_ascii_case("true"))
            .unwrap_or(false),
        kind,
        url: data.get("URL").cloned(),
        desktop_file_path: path,
        managed: data.get(DESKCRAFTER_FLAG).map(String::as_str) == Some(DESKCRAFTER_FLAG_VALUE),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_input() -> LauncherInput {
        LauncherInput {
            name: "Sample App".to_string(),
            description: "A sample launcher".to_string(),
            exec_path: "/usr/bin/sample --flag".to_string(),
            icon_path: "sample".to_string(),
            categories: vec!["Utility".to_string(), "Development".to_string()],
            terminal: false,
            kind: LauncherKind::Application,
            url: None,
        }
    }

    #[test]
    fn generates_managed_desktop_entry() {
        let content = generate(&sample_input()).expect("entry should generate");
        assert!(content.contains("[Desktop Entry]"));
        assert!(content.contains("Exec=/usr/bin/sample --flag"));
        assert!(content.contains("TryExec=/usr/bin/sample"));
        assert!(content.contains("X-DeskCrafter=true"));
        assert!(content.ends_with('\n'));
    }

    #[test]
    fn defaults_empty_categories_to_utility() {
        let categories = normalize_categories(&[]);
        assert_eq!(categories, vec!["Utility"]);
    }

    #[test]
    fn parses_generated_entry() {
        let input = sample_input();
        let content = generate(&input).expect("entry should generate");
        let parsed = parse(&content, PathBuf::from("sample.desktop")).expect("entry should parse");
        assert_eq!(parsed.name, input.name);
        assert_eq!(parsed.categories, vec!["Utility", "Development"]);
        assert!(parsed.managed);
    }

    #[test]
    fn generates_url_launcher() {
        let mut input = sample_input();
        input.kind = LauncherKind::Url;
        input.exec_path.clear();
        input.url = Some("https://example.com".to_string());
        let content = generate(&input).expect("url entry should generate");
        assert!(content.contains("Type=Link"));
        assert!(content.contains("URL=https://example.com"));
        assert!(!content.contains("Exec="));
    }
}
