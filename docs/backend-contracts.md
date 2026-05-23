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

- `get_system_profile()`
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
