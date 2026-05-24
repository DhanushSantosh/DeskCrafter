# DeskCrafter Tool Specs

Every tool is exposed through the suite registry and returns `ToolResult`. Tools are action-first: scans provide context for repair, install, update, removal, or elevated actions.

## Launcher Repair & Integrator

Privilege level: `user_write`

Primary actions: refresh menu caches, repair a selected launcher, remove a selected launcher, install a selected launcher globally with elevation.

The tool owns launcher creation and editing through the dedicated launcher workflow, and it also handles post-write cache refresh so new or repaired entries appear in desktop menus.

## Portable App Integrator

Privilege level: `user_write`

Primary actions: integrate a path, re-link a portable target, remove an integration.

This tool accepts AppImages, scripts, and standalone binaries. It can move them into a managed location, mark them executable, generate a launcher, and refresh the desktop integration state.

## Autostart Actions

Privilege level: `user_write`

Primary actions: enable a selected launcher at login, disable an autostart entry, repair an autostart entry, duplicate an autostart entry.

It works on `${XDG_CONFIG_HOME:-~/.config}/autostart` directly and treats system autostart entries under `/etc/xdg/autostart` as informational unless a future elevated flow is added.

## Default Apps & MIME Manager

Privilege level: `elevated_write`

Primary actions: set a MIME default, set the default browser, set a system MIME default with elevation.

This tool uses XDG MIME behavior as the primary model. It should support file associations, URL schemes, and `mimeapps.list`-backed repair workflows.

## Flatpak Permissions Manager

Privilege level: `elevated_write`

Primary actions: grant home access, grant a targeted filesystem path, reset overrides, grant a system-scope path with elevation.

This tool is focused on effective overrides and restart-needed messaging rather than acting as a general Flatpak store.

## Permission & Ownership Repair

Privilege level: `elevated_write`

Primary actions: make a file executable, repair an XDG directory, fix ownership with elevation.

It is specifically for integration-critical paths such as user launcher directories, managed portable apps, and autostart locations.

## Service Actions

Privilege level: `system_repair`

Primary actions: start or enable user services directly, start or enable system services with elevation.

This tool is advanced/supporting. It exists to unblock desktop integrations that depend on background services rather than to become a full service manager.

## System Profile

Privilege level: `read_only`

Primary actions: refresh the current system profile.

This is a support module for distro, session, XDG, Flatpak, AppImage, and systemd capability detection. It informs other tools and should not be the main destination workflow.
