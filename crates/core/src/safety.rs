use crate::error::CoreError;
use std::fs;
use std::path::{Path, PathBuf};

pub fn ensure_parent_dir(path: &Path) -> Result<(), CoreError> {
    let Some(parent) = path.parent() else {
        return Err(CoreError::InvalidInput(
            "Path has no parent directory".to_string(),
        ));
    };
    fs::create_dir_all(parent)?;
    Ok(())
}

pub fn ensure_directory(path: &Path) -> Result<(), CoreError> {
    fs::create_dir_all(path)?;
    Ok(())
}

pub fn backup_if_exists(path: &Path) -> Result<Option<PathBuf>, CoreError> {
    if !path.exists() {
        return Ok(None);
    }
    let backup_path = path.with_extension("desktop.bak");
    fs::copy(path, &backup_path)?;
    Ok(Some(backup_path))
}

pub fn require_existing_file(path: &Path) -> Result<(), CoreError> {
    if path.is_file() {
        Ok(())
    } else {
        Err(CoreError::NotFound(format!(
            "File does not exist: {}",
            path.display()
        )))
    }
}

pub fn is_probably_safe_launcher_path(path: &Path) -> bool {
    path.extension().and_then(|ext| ext.to_str()) == Some("desktop")
}
