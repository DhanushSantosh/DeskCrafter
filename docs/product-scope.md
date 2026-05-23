# DeskCrafter Product Scope

DeskCrafter v1 is a Linux launcher suite for creating, validating, installing, repairing, and launching user-owned application entries across common desktop environments.

## V1 Tools

- Desktop Entry Studio: create, edit, preview, validate, install, uninstall, and launch `.desktop` entries.
- AppImage Integrator: inspect an AppImage, suggest launcher metadata, optionally mark it executable, and create a managed launcher.
- Script Launcher Builder: create launchers for shell scripts, Python scripts, and executable files with interpreter and terminal-run handling.
- URL Launcher Builder: create browser URL launchers using FreeDesktop-compatible `.desktop` files.
- Icon & Category Manager: resolve icon paths or theme names, normalize categories, and flag missing icons.
- Launcher Doctor: scan user launchers for broken exec paths, missing icons, invalid categories, duplicate names, and malformed DeskCrafter-managed entries.

## Out Of Scope For V1

- Package management, service management, system cleanup, PATH editing, and distro-specific administration.
- Root-level installation by default.
- System-wide launcher edits unless a later advanced mode is explicitly added.

## Product Principles

- Local first: launcher data lives on the user's machine.
- Least privilege: write to user-owned XDG locations by default.
- Repairable: destructive actions create backups where practical.
- Distro aware: prefer FreeDesktop and XDG behavior over distro-specific assumptions.
