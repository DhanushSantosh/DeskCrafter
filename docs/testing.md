# Testing

## Rust

- Unit tests for desktop-entry parsing and generation.
- Unit tests for input validation and category normalization.
- Unit tests for tool registry routing and stable tool definitions.
- Unit tests for system profile, PATH analysis, AppImage discovery, permission inspection, cache sizing, and graceful subsystem warnings.
- Integration tests using temp directories for create, update, delete, import, and scan flows.
- Integration tests using temp XDG directories for launcher and autostart user-owned write flows.

## TypeScript

- UI tests for category navigation, tool result rendering, guided command display, validation display, preview generation, and command error rendering.
- Type checks for command request/response contracts.

## Manual Smoke

- Create a shell script launcher.
- Create a URL launcher.
- Inspect an AppImage path.
- Scan PATH, services, cache, permissions, and system profile tools without requiring root.
- Scan launchers and resolve a missing exec warning.
- Confirm admin service actions render guided commands instead of executing.
- Build the product site.
