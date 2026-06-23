use deskcrafter_core::tools::ToolRegistry;
use deskcrafter_core::types::ToolScanInput;

#[test]
fn list_tools_returns_eight_stable_ids() {
    let registry = ToolRegistry::default();
    let tools = registry.list_tools();
    let ids: Vec<&str> = tools.iter().map(|tool| tool.id.as_str()).collect();
    assert_eq!(
        ids,
        vec![
            "launcher_repair_integrator",
            "portable_app_integrator",
            "autostart_actions",
            "default_apps_mime_manager",
            "flatpak_permissions_manager",
            "permission_ownership_repair",
            "service_actions",
            "system_profile",
        ]
    );
}

#[test]
fn each_tool_definition_has_non_empty_input_labels() {
    let registry = ToolRegistry::default();
    for tool in registry.list_tools() {
        assert!(
            !tool.path_input_label.is_empty(),
            "Tool '{}' is missing path_input_label",
            tool.id
        );
        assert!(
            !tool.value_input_label.is_empty(),
            "Tool '{}' is missing value_input_label",
            tool.id
        );
    }
}

#[test]
fn tool_not_found_returns_error() {
    let registry = ToolRegistry::default();
    let err = registry
        .run_tool_scan("nonexistent_tool", ToolScanInput::default())
        .unwrap_err();
    assert!(err.to_string().contains("nonexistent_tool"));
}

#[test]
fn system_profile_scan_succeeds_on_host() {
    let registry = ToolRegistry::default();
    let result = registry
        .run_tool_scan("system_profile", ToolScanInput::default())
        .expect("system_profile scan should succeed");
    assert_eq!(result.tool_id, "system_profile");
    assert!(!result.summary.is_empty());
}

#[test]
fn guided_admin_commands_returns_vec_for_all_tools() {
    let registry = ToolRegistry::default();
    let tool_ids = [
        "launcher_repair_integrator",
        "portable_app_integrator",
        "autostart_actions",
        "default_apps_mime_manager",
        "flatpak_permissions_manager",
        "permission_ownership_repair",
        "service_actions",
        "system_profile",
    ];
    for tool_id in tool_ids {
        let commands = registry
            .list_guided_admin_commands(tool_id)
            .unwrap_or_else(|_| panic!("guided_admin_commands failed for {tool_id}"));
        // Just assert it returns without panic — some tools may return empty
        let _ = commands;
    }
}
