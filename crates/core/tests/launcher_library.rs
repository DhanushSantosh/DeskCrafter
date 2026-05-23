use deskcrafter_core::types::{LauncherInput, LauncherKind, RepairOptions};
use deskcrafter_core::LauncherLibrary;
use tempfile::tempdir;

fn launcher_input() -> LauncherInput {
    LauncherInput {
        name: "Desk Test".to_string(),
        description: "A test launcher".to_string(),
        exec_path: "/usr/bin/env true".to_string(),
        icon_path: "utilities-terminal".to_string(),
        categories: vec!["Utility".to_string()],
        terminal: false,
        kind: LauncherKind::Application,
        url: None,
    }
}

#[test]
fn create_list_update_delete_launcher() {
    let temp = tempdir().expect("tempdir should exist");
    let library = LauncherLibrary::new(temp.path().to_path_buf());

    let created = library
        .create_launcher(launcher_input())
        .expect("launcher should be created");
    assert_eq!(created.name, "Desk Test");
    assert_eq!(library.list_launchers().expect("list should work").len(), 1);

    let mut input = launcher_input();
    input.description = "Updated".to_string();
    let updated = library
        .update_launcher(&created.id, input)
        .expect("launcher should update");
    assert_eq!(updated.description, "Updated");

    let repaired = library
        .repair_launcher(&created.id, RepairOptions::default())
        .expect("launcher should repair");
    assert_eq!(repaired.name, "Desk Test");

    library
        .delete_launcher(&created.id)
        .expect("launcher should delete");
    assert!(library
        .list_launchers()
        .expect("list should work")
        .is_empty());
}

#[test]
fn validate_launcher_reports_errors() {
    let temp = tempdir().expect("tempdir should exist");
    let library = LauncherLibrary::new(temp.path().to_path_buf());
    let mut input = launcher_input();
    input.name.clear();

    let report = library.validate_launcher(&input);
    assert!(!report.valid);
    assert_eq!(report.errors.len(), 1);
}
