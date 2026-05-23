# Backend Contracts

All Tauri commands return a stable response envelope:

```ts
type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ErrorCode; message: string } };
```

## Error Codes

- `invalid_input`
- `not_found`
- `permission_denied`
- `io_error`
- `parse_error`
- `unsupported_target`

## Commands

## Suite Commands

- `list_tools()`
- `get_tool_status(tool_id)`
- `run_tool_scan(tool_id, input)`
- `validate_tool_action(tool_id, input)`
- `apply_tool_action(tool_id, input)`
- `list_guided_admin_commands(tool_id)`
- `get_system_profile()`

## Launcher Compatibility Commands

- `list_launchers()`
- `get_launcher(id)`
- `create_launcher(input)`
- `update_launcher(id, input)`
- `delete_launcher(id)`
- `launch_entry(id)`
- `inspect_target(path_or_url)`
- `validate_launcher(input)`
- `repair_launcher(id, repair_options)`
- `resolve_icon(input)`
- `scan_launcher_issues()`

## Shared Types

```ts
type ToolCategory =
  | "launchers"
  | "startup"
  | "apps"
  | "system"
  | "storage"
  | "permissions";

type RiskLevel = "read_only" | "user_write" | "guided_admin";

type ToolDefinition = {
  id: string;
  label: string;
  category: ToolCategory;
  description: string;
  riskLevel: RiskLevel;
  capabilities: string[];
  supportedDistros: string[];
};

type ToolScanInput = {
  query?: string | null;
  path?: string | null;
};

type ToolActionInput = ToolScanInput & {
  action?: string | null;
};

type GuidedCommand = {
  label: string;
  command: string;
  riskLevel: RiskLevel;
  explanation: string;
};

type ToolResult<T = unknown> = {
  toolId: string;
  summary: string;
  data: T;
  warnings: string[];
  repairSuggestions: string[];
  guidedCommands: GuidedCommand[];
};
```

## Stable Tool IDs

- `launcher_manager`
- `autostart_manager`
- `appimage_manager`
- `environment_path`
- `service_viewer`
- `disk_cache_inspector`
- `permissions_helper`
- `system_profile`

## Action Rules

Suite actions are read-first. `apply_tool_action()` is only for explicit user-owned operations supported by a tool. Unsupported, admin-level, or destructive actions return `unsupported_target`, `permission_denied`, or a guided command instead of attempting escalation.
