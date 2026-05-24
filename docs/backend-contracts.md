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
  | "associations"
  | "sandboxes"
  | "permissions"
  | "advanced";

type PrivilegeLevel =
  | "read_only"
  | "user_write"
  | "elevated_write"
  | "system_repair";

type ToolActionKind =
  | "scan"
  | "repair"
  | "install"
  | "update"
  | "remove"
  | "elevated_action";

type ToolActionDescriptor = {
  id: string;
  label: string;
  kind: ToolActionKind;
  requiresPath: boolean;
  requiresValue: boolean;
  requiresElevation: boolean;
};

type ToolDefinition = {
  id: string;
  label: string;
  category: ToolCategory;
  description: string;
  privilegeLevel: PrivilegeLevel;
  elevationMode: string;
  reversible: boolean;
  desktopTargets: string[];
  supportedDistros: string[];
  primaryActions: ToolActionDescriptor[];
};

type ToolScanInput = {
  query?: string | null;
  path?: string | null;
  targetId?: string | null;
};

type ToolActionInput = {
  query?: string | null;
  path?: string | null;
  action?: string | null;
  targetId?: string | null;
  value?: string | null;
  secondaryValue?: string | null;
  allowElevation?: boolean | null;
};

type GuidedCommand = {
  label: string;
  command: string;
  privilegeLevel: PrivilegeLevel;
  explanation: string;
};

type ToolResult<T = unknown> = {
  toolId: string;
  summary: string;
  data: T;
  warnings: string[];
  blockingIssues: string[];
  performedActions: string[];
  beforeAfterState?: unknown;
  restartOrRefreshNeeded: string[];
  guidedCommands: GuidedCommand[];
};
```

## Stable Tool IDs

- `launcher_repair_integrator`
- `portable_app_integrator`
- `autostart_actions`
- `default_apps_mime_manager`
- `flatpak_permissions_manager`
- `permission_ownership_repair`
- `service_actions`
- `system_profile`

## Action Rules

Suite actions are workflow-oriented. `validate_tool_action()` previews the intended change, required inputs, and any blocking issues. `apply_tool_action()` performs user-scope changes directly and can run explicit elevated actions via a polkit-backed shell flow where supported. Tools must report follow-up refresh steps such as desktop cache rebuilds, MIME updates, service reloads, or Flatpak app restarts.
