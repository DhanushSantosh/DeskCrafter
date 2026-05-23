pub mod desktop_entry;
pub mod error;
pub mod icons;
pub mod inspectors;
pub mod launcher_library;
pub mod platform;
pub mod safety;
pub mod types;

pub use error::{CoreError, ErrorCode};
pub use launcher_library::LauncherLibrary;
pub use platform::SystemProfile;
pub use types::{
    ApiError, ApiResult, DesktopEntryContent, IconResolution, InspectTargetResult, Launcher,
    LauncherInput, LauncherIssue, LauncherKind, RepairOptions, ValidationReport,
};
