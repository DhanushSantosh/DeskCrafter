# DeskCrafter Tool Specs

Every tool is exposed through the suite registry and returns `ToolResult`. Tools should scan safely even when the underlying subsystem is missing.

## Launcher Manager

Risk level: `user_write`

Required launcher fields are name and executable target. Optional fields are description, icon, categories, terminal flag, and URL. The module previews generated `.desktop` content before save, scans user launchers for issues, and keeps AppImage, script, URL, icon, category, and launcher doctor workflows under one tool.

## Autostart Manager

Risk level: `user_write`

Scans `${XDG_CONFIG_HOME:-~/.config}/autostart` and `/etc/xdg/autostart` for `.desktop` entries. User autostart writes should use the same validation and backup behavior as launcher writes. System autostart entries are read-only and may expose guided commands for inspection.

## AppImage Manager

Risk level: `read_only`

Finds `.AppImage` files in common user folders such as `~/Applications`, `~/Downloads`, and `~/Desktop`. It reports executable-bit state, missing folders as warnings, and integration hints that route launcher creation through Launcher Manager.

## Environment & PATH Viewer

Risk level: `read_only`

Reads the current PATH, reports duplicate entries, missing directories, common user bin folders, and detected shell profile files. This tool does not edit shell profiles in v1.

## Service Viewer

Risk level: `guided_admin`

Reads systemd availability and lists user/system service unit files where available. It does not start, stop, enable, or disable services directly. Privileged service actions are shown as guided commands.

## Disk & Cache Inspector

Risk level: `read_only`

Reads sizes for safe user-owned cache targets such as `~/.cache`, `~/.npm`, and Cargo caches. It does not delete files in the first backend pass. Cleanup appears only as suggestions or future guided flows.

## Permissions Helper

Risk level: `user_write`

Inspects a selected path for existence, ownership, file type, and executable-bit state. It may mark a user-owned file executable. Admin-owned paths and unsupported permission changes return guided commands or stable errors.

## System Profile

Risk level: `read_only`

Reports distro, desktop session, XDG data/config/cache paths, package-manager hints, systemd availability, Flatpak availability, and AppImage support. Missing detections should be represented as `null` values or warnings, not hard failures.
