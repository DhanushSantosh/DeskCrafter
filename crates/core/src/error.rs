use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ErrorCode {
    InvalidInput,
    NotFound,
    PermissionDenied,
    IoError,
    ParseError,
    UnsupportedTarget,
}

#[derive(Debug, Error)]
pub enum CoreError {
    #[error("{0}")]
    InvalidInput(String),
    #[error("{0}")]
    NotFound(String),
    #[error("{0}")]
    PermissionDenied(String),
    #[error("{0}")]
    Io(#[from] std::io::Error),
    #[error("{0}")]
    Parse(String),
    #[error("{0}")]
    UnsupportedTarget(String),
}

impl CoreError {
    pub fn code(&self) -> ErrorCode {
        match self {
            CoreError::InvalidInput(_) => ErrorCode::InvalidInput,
            CoreError::NotFound(_) => ErrorCode::NotFound,
            CoreError::PermissionDenied(_) => ErrorCode::PermissionDenied,
            CoreError::Io(_) => ErrorCode::IoError,
            CoreError::Parse(_) => ErrorCode::ParseError,
            CoreError::UnsupportedTarget(_) => ErrorCode::UnsupportedTarget,
        }
    }
}
