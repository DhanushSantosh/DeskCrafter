# DeskCrafter Product Scope

DeskCrafter v1 is a practical Linux tools suite for inspecting and managing everyday desktop integration tasks across common distributions. Launcher management remains a first-class module, but the product is no longer defined by `.desktop` files alone.

## V1 Tool Modules

- Launcher Manager: create, edit, validate, install, launch, repair, and inspect user-owned launchers, including AppImage, script, URL, icon, category, and launcher doctor workflows.
- Autostart Manager: list user and system autostart entries, with user-owned autostart changes planned behind the same reversible launcher model.
- AppImage Manager: find AppImages in common user folders, detect executable-bit state, and route integration through Launcher Manager.
- Environment & PATH Viewer: inspect PATH entries, duplicate directories, missing directories, common user bin folders, and shell profile files.
- Service Viewer: read user and system systemd service availability without admin writes and show guided commands for privileged service actions.
- Disk & Cache Inspector: inspect safe user-owned cache locations and report sizes without deleting data in the first backend pass.
- Permissions Helper: inspect file ownership and executability; allow clear user-owned chmod actions and show guided commands for admin-owned paths.
- System Profile: report distro, desktop session, XDG paths, package-manager hints, systemd availability, Flatpak availability, and AppImage support.

## Out Of Scope For V1

- Silent privilege escalation, root writes, and system-level mutation.
- Destructive cleanup or automatic deletion of caches.
- Package installation, package removal, and distro-specific admin dashboards.
- Global launcher or autostart installation as a default path.

## Product Principles

- Local first: launcher data lives on the user's machine.
- Read first: inspect and explain system state before offering any action.
- Least privilege: write only to user-owned locations by default.
- Repairable: destructive actions create backups where practical.
- Distro aware: prefer FreeDesktop and XDG behavior over distro-specific assumptions.
- Guided admin: privileged operations are copyable commands with explanations and risk labels, not automatic elevation.
