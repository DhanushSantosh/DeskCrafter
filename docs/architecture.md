# DeskCrafter Architecture

DeskCrafter is organized as a native desktop product with a web-powered interface and a Rust backend.

## Repository Layout

- `apps/desktop`: Tauri + Vite + React desktop app.
- `apps/site`: Next.js product website adapted from the CherryIDE visual system.
- `crates/core`: Rust domain logic shared by the Tauri command layer.
- `docs`: implementation and product documentation.
- `apps/web` and `cli`: legacy migration references until equivalent Tauri flows are complete.

## Runtime Boundary

React renders the interface and calls Tauri commands. Rust owns all filesystem, process, XDG, and launcher operations. The frontend never writes launcher files directly.

## Default Storage

- Managed launchers: `${XDG_DATA_HOME:-~/.local/share}/applications`
- DeskCrafter metadata/cache: `${XDG_DATA_HOME:-~/.local/share}/deskcrafter`
- Config: `${XDG_CONFIG_HOME:-~/.config}/deskcrafter/config.json`

## Data Flow

1. The UI collects launcher input.
2. The typed Tauri client calls a command.
3. The command validates input and delegates to `crates/core`.
4. Core reads/writes user-owned XDG locations.
5. The command returns a typed response envelope to React.
