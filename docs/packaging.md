# Packaging

## Primary Target

AppImage is the first packaging target because it is portable across many Linux distributions and fits DeskCrafter's launcher-management use case.

## Follow-Up Targets

- `.deb` for Debian and Ubuntu families.
- `.rpm` for Fedora, openSUSE, and related distributions.
- Flatpak later, after portal behavior and filesystem permissions are explicitly designed.

## Packaging Checks

- The app launches without root.
- Managed entries are written to the user applications directory.
- AppImage integration works from common user folders.
- Uninstalling the app does not remove user launchers unless the user explicitly chooses that.

## Native Build Prerequisites

Tauri AppImage packaging depends on distro-provided WebKitGTK and related development libraries. On Fedora-like systems, missing `javascriptcoregtk-4.1.pc` or `libsoup-3.0.pc` means the native prerequisite packages are not installed yet.
