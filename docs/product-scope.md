# DeskCrafter Product Scope

DeskCrafter v1 is an action-first Linux desktop integration and repair suite. Its job is to make apps appear, launch, open files correctly, integrate at login, and behave sanely across mixed desktop environments.

## V1 Tool Modules

- Launcher Repair & Integrator: create, edit, validate, refresh, repair, globally install, launch, and remove launchers so apps actually show up and run.
- Portable App Integrator: integrate AppImages, scripts, and standalone binaries into the desktop by moving them into a managed location, marking them executable, and creating launchers.
- Autostart Actions: enable, disable, duplicate, and repair user autostart entries under XDG autostart.
- Default Apps & MIME Manager: inspect and set file associations, browser defaults, and URL scheme handlers.
- Flatpak Permissions Manager: inspect Flatpak overrides, grant targeted filesystem access, reset overrides, and support system-scope permission changes where needed.
- Permission & Ownership Repair: repair executable bits, recreate user-owned XDG integration directories, and fix ownership drift.
- Service Actions: advanced user/system systemd actions for tools that depend on background services.
- System Profile: support-only module for distro, desktop session, XDG path, and runtime capability detection.

## Out Of Scope For V1

- Generic cache cleanup and broad Linux housekeeping tools.
- Package manager frontends and distro-specific administration dashboards.
- Silent privilege escalation. Elevated actions must be explicit and user-visible.
- Destructive system actions without a targeted repair or integration purpose.

## Product Principles

- Local first: launcher, autostart, and association state live on the user's machine.
- Action first: scans exist to support fixes, not as the product end state.
- Desktop focused: prioritize app visibility, launchability, startup behavior, MIME handling, and sandbox repair over generic system tooling.
- Escalate explicitly: use elevation only where it materially improves the workflow and the change is understandable.
- Repairable: user-scope actions should be reversible, and elevated actions should leave clear before/after state where possible.
- Distro aware: prefer FreeDesktop and XDG behavior, then add desktop-environment-specific refresh steps when required.
