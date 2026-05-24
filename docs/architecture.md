# DeskCrafter Architecture

DeskCrafter is organized as a native desktop product with a web-powered interface and a Rust backend. The app is tool-registry based: each Linux tool exposes a stable definition, scan behavior, validation behavior, and explicit action handling for repair, install, update, remove, or elevated system actions.

## Repository Layout

- `apps/desktop`: Tauri + Vite + React desktop app.
- `apps/site`: Next.js product website adapted from the CherryIDE visual system.
- `crates/core`: Rust domain logic shared by the Tauri command layer, including the suite registry, system profile detection, launcher internals, and safe filesystem operations.
- `docs`: implementation and product documentation.
- `apps/web` and `cli`: legacy migration references until equivalent Tauri flows are complete.

## Runtime Boundary

React renders the interface and calls Tauri commands. Rust owns all filesystem, process, XDG, launcher, permission, service, cache, PATH, and profile inspection. The frontend never writes local files directly.

## Suite Model

- `ToolDefinition`: stable id, label, category, privilege level, elevation mode, reversibility, desktop targets, and primary actions.
- `ToolResult<T>`: scan or action output with data, warnings, blocking issues, performed actions, before/after state, refresh requirements, and guided commands.
- `ToolStatus`: current availability and warnings for a tool.
- `GuidedCommand`: copyable command text with explanation and risk label for actions DeskCrafter will not perform directly.

Core tool modules live behind a shared Rust trait with `scan`, `validate_action`, and `apply_action` behavior. Tauri calls tools by stable IDs instead of hardcoding every module into the UI.

## Default Storage

- Managed launchers: `${XDG_DATA_HOME:-~/.local/share}/applications`
- User autostart entries: `${XDG_CONFIG_HOME:-~/.config}/autostart`
- DeskCrafter metadata/cache: `${XDG_DATA_HOME:-~/.local/share}/deskcrafter`
- Config: `${XDG_CONFIG_HOME:-~/.config}/deskcrafter/config.json`

## Data Flow

1. The UI lists tools through `list_tools()`.
2. The user selects a tool and the UI calls `run_tool_scan(tool_id, input)`.
3. The Tauri command validates the envelope and delegates to `crates/core::tools::ToolRegistry`.
4. Core performs action-oriented inspection and returns structured warnings, blocking issues, and guided commands.
5. User-owned changes go through `validate_tool_action()` and `apply_tool_action()`.
6. Elevated system changes run through an explicit polkit-backed shell flow where supported.
7. Post-mutation refresh steps rebuild menu, MIME, service, or Flatpak state as needed.

## Privilege Policy

- User-owned writes are the default path whenever they are sufficient to solve the problem.
- Elevated writes are allowed when they materially improve integration workflows such as global launcher install, system MIME defaults, system Flatpak overrides, or ownership repair.
- Elevated actions must be explicit, user-visible, and scoped to a concrete operation.
- Generic cleanup and destructive housekeeping remain out of scope for the core product.
- Missing subsystems such as systemd, Flatpak, or package-manager detection produce warnings instead of command failures.
