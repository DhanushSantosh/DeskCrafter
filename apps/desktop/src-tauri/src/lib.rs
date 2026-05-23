use deskcrafter_core::types::{
    ApiResult, IconResolution, InspectTargetResult, Launcher, LauncherInput, LauncherIssue,
    RepairOptions, ValidationReport,
};
use deskcrafter_core::{LauncherLibrary, SystemProfile};
use std::sync::Mutex;
use tauri::State;

struct AppState {
    library: Mutex<LauncherLibrary>,
}

fn with_library<T>(
    state: State<'_, AppState>,
    action: impl FnOnce(&LauncherLibrary) -> Result<T, deskcrafter_core::CoreError>,
) -> ApiResult<T> {
    match state.library.lock() {
        Ok(library) => match action(&library) {
            Ok(data) => ApiResult::ok(data),
            Err(error) => ApiResult::err(error),
        },
        Err(_) => ApiResult::err(deskcrafter_core::CoreError::Io(std::io::Error::other(
            "Launcher library lock is poisoned",
        ))),
    }
}

#[tauri::command]
fn get_system_profile() -> ApiResult<SystemProfile> {
    ApiResult::ok(deskcrafter_core::platform::system_profile())
}

#[tauri::command]
fn list_launchers(state: State<'_, AppState>) -> ApiResult<Vec<Launcher>> {
    with_library(state, LauncherLibrary::list_launchers)
}

#[tauri::command]
fn get_launcher(state: State<'_, AppState>, id: String) -> ApiResult<Launcher> {
    with_library(state, |library| library.get_launcher(&id))
}

#[tauri::command]
fn create_launcher(state: State<'_, AppState>, input: LauncherInput) -> ApiResult<Launcher> {
    with_library(state, |library| library.create_launcher(input))
}

#[tauri::command]
fn update_launcher(
    state: State<'_, AppState>,
    id: String,
    input: LauncherInput,
) -> ApiResult<Launcher> {
    with_library(state, |library| library.update_launcher(&id, input))
}

#[tauri::command]
fn delete_launcher(state: State<'_, AppState>, id: String) -> ApiResult<()> {
    with_library(state, |library| library.delete_launcher(&id))
}

#[tauri::command]
fn launch_entry(state: State<'_, AppState>, id: String) -> ApiResult<()> {
    with_library(state, |library| library.launch_entry(&id))
}

#[tauri::command]
fn inspect_target(
    state: State<'_, AppState>,
    path_or_url: String,
) -> ApiResult<InspectTargetResult> {
    with_library(state, |library| library.inspect_target(&path_or_url))
}

#[tauri::command]
fn validate_launcher(
    state: State<'_, AppState>,
    input: LauncherInput,
) -> ApiResult<ValidationReport> {
    with_library(state, |library| Ok(library.validate_launcher(&input)))
}

#[tauri::command]
fn repair_launcher(
    state: State<'_, AppState>,
    id: String,
    repair_options: RepairOptions,
) -> ApiResult<Launcher> {
    with_library(state, |library| {
        library.repair_launcher(&id, repair_options)
    })
}

#[tauri::command]
fn resolve_icon(state: State<'_, AppState>, input: String) -> ApiResult<IconResolution> {
    with_library(state, |library| Ok(library.resolve_icon(&input)))
}

#[tauri::command]
fn scan_launcher_issues(state: State<'_, AppState>) -> ApiResult<Vec<LauncherIssue>> {
    with_library(state, LauncherLibrary::scan_launcher_issues)
}

pub fn run() {
    tauri::Builder::default()
        .manage(AppState {
            library: Mutex::new(LauncherLibrary::default()),
        })
        .invoke_handler(tauri::generate_handler![
            get_system_profile,
            list_launchers,
            get_launcher,
            create_launcher,
            update_launcher,
            delete_launcher,
            launch_entry,
            inspect_target,
            validate_launcher,
            repair_launcher,
            resolve_icon,
            scan_launcher_issues
        ])
        .run(tauri::generate_context!())
        .expect("error while running DeskCrafter");
}
