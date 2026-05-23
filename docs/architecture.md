# DeskCrafter Architecture

DeskCrafter is organized as a native desktop product with a web-powered interface and a Rust backend. The app is tool-registry based: each Linux tool exposes a stable definition, scan behavior, validation behavior, and optional user-owned action handling.

## Repository Layout

- `apps/desktop`: Tauri + Vite + React desktop app.
- `apps/site`: Next.js product website adapted from the CherryIDE visual system.
- `crates/core`: Rust domain logic shared by the Tauri command layer, including the suite registry, system profile detection, launcher internals, and safe filesystem operations.
- `docs`: implementation and product documentation.
- `apps/web` and `cli`: legacy migration references until equivalent Tauri flows are complete.

## Runtime Boundary

React renders the interface and calls Tauri commands. Rust owns all filesystem, process, XDG, launcher, permission, service, cache, PATH, and profile inspection. The frontend never writes local files directly.

## Suite Model

- `ToolDefinition`: stable id, label, category, description, risk level, capabilities, and supported distros.
- `ToolResult<T>`: scan or action output with data, warnings, suggestions, and guided commands.
- `ToolStatus`: current availability and warnings for a tool.
- `GuidedCommand`: copyable command text with explanation and risk label for actions DeskCrafter will not perform directly.

Core tool modules live behind a shared Rust trait with `scan`, `validate`, and `apply_user_action` behavior. Tauri calls tools by stable IDs instead of hardcoding every module into the UI.

## Default Storage

- Managed launchers: `${XDG_DATA_HOME:-~/.local/share}/applications`
- User autostart entries: `${XDG_CONFIG_HOME:-~/.config}/autostart`
- DeskCrafter metadata/cache: `${XDG_DATA_HOME:-~/.local/share}/deskcrafter`
- Config: `${XDG_CONFIG_HOME:-~/.config}/deskcrafter/config.json`

## Data Flow

1. The UI lists tools through `list_tools()`.
2. The user selects a tool and the UI calls `run_tool_scan(tool_id, input)`.
3. The Tauri command validates the envelope and delegates to `crates/core::tools::ToolRegistry`.
4. Core performs read-first inspection and returns structured warnings, suggestions, and guided commands.
5. User-owned changes go through `validate_tool_action()` and `apply_tool_action()`.
6. System-level changes are returned as guided commands rather than executed.

## Privilege Policy

- No root writes in the default app flow.
- No destructive cleanup in the first backend pass.
- User-owned writes are allowed only when the action is clear and reversible, such as launcher updates, autostart updates, or marking a user-owned file executable.
- Admin-owned service, package, and permission operations are represented as guided commands with risk labels.
- Missing subsystems such as systemd, Flatpak, or package-manager detection produce warnings instead of command failures.
