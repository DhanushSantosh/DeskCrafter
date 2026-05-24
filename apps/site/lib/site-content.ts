import {
  Activity,
  AppWindow,
  BadgeCheck,
  Boxes,
  DatabaseZap,
  FileCog,
  Fingerprint,
  Package,
  Shield,
  ShieldCheck,
  Stethoscope,
  Terminal,
  Workflow,
} from "lucide-react";

export const siteConfig = {
  name: "DeskCrafter",
  tagline: "An action-first Linux desktop integration and repair suite for launchers, startup entries, defaults, sandboxes, permissions, and service fixes.",
  description:
    "DeskCrafter helps Linux apps actually show up, launch, open the right files, start at login, and survive sandbox or permission issues through explicit scans, repairs, and guided elevated actions.",
  githubUrl: "https://github.com/DhanushSantosh/DeskCrafter",
};

export const toolDefinitions = [
  {
    id: "launcher_repair_integrator",
    title: "Launcher Repair & Integrator",
    category: "Launchers",
    risk: "User write",
    description: "Create, refresh, repair, remove, and globally install launchers so apps actually appear and launch.",
    icon: AppWindow,
  },
  {
    id: "portable_app_integrator",
    title: "Portable App Integrator",
    category: "Apps",
    risk: "User write",
    description: "Integrate AppImages, scripts, and standalone binaries by relocating, relinking, and generating launchers.",
    icon: Package,
  },
  {
    id: "autostart_actions",
    title: "Autostart Actions",
    category: "Startup",
    risk: "User write",
    description: "Enable, disable, duplicate, and repair startup entries that should run on login.",
    icon: Activity,
  },
  {
    id: "default_apps_mime_manager",
    title: "Default Apps & MIME Manager",
    category: "Associations",
    risk: "Elevated write",
    description: "Inspect and repair file associations, URL scheme handlers, browser defaults, and open-with behavior.",
    icon: Workflow,
  },
  {
    id: "flatpak_permissions_manager",
    title: "Flatpak Permissions Manager",
    category: "Sandboxes",
    risk: "Elevated write",
    description: "Inspect overrides, grant targeted filesystem access, and reset Flatpak permissions when apps are blocked.",
    icon: Shield,
  },
  {
    id: "permission_ownership_repair",
    title: "Permission & Ownership Repair",
    category: "Permissions",
    risk: "Elevated write",
    description: "Repair executable bits, recreate XDG integration paths, and fix ownership drift that breaks desktop integration.",
    icon: Fingerprint,
  },
  {
    id: "service_actions",
    title: "Service Actions",
    category: "Advanced",
    risk: "System repair",
    description: "Start or enable user and system services when integrations depend on background daemons.",
    icon: FileCog,
  },
  {
    id: "system_profile",
    title: "System Profile",
    category: "Advanced",
    risk: "Read only",
    description: "Report distro, session, XDG paths, systemd, Flatpak, and integration capability signals behind the repair workflows.",
    icon: DatabaseZap,
  },
];

export const primaryFeatures = [
  {
    title: "Launcher Repair & Integrator",
    description: "Repair broken menu entries, refresh desktop caches, remove bad launchers, and install selected launchers globally when user scope is not enough.",
    icon: AppWindow,
  },
  {
    title: "Defaults, Startup & Sandboxes",
    description: "Fix login behavior, MIME defaults, browser handlers, and Flatpak permissions through explicit actions with before-and-after state.",
    icon: Boxes,
  },
];

export const bentoFeatures = toolDefinitions.filter((tool) =>
  [
    "portable_app_integrator",
    "autostart_actions",
    "default_apps_mime_manager",
    "flatpak_permissions_manager",
    "permission_ownership_repair",
    "service_actions",
  ].includes(tool.id)
);

export const proofPoints = [
  { label: "Default mode", value: "Action first" },
  { label: "Elevation", value: "Explicit" },
  { label: "Tool modules", value: "8" },
];

export const principles = [
  {
    title: "Local by default",
    description: "Launcher, autostart, association, and sandbox state stay on your Linux machine with no cloud dependency.",
    icon: ShieldCheck,
  },
  {
    title: "Action first",
    description: "Scans exist to support fixes, installs, removals, and elevated follow-through rather than stopping at diagnostics.",
    icon: Terminal,
  },
  {
    title: "Escalate explicitly",
    description: "System-level changes are visible, intentional, and tied to a concrete integration or repair outcome.",
    icon: Terminal,
  },
  {
    title: "Repairable user changes",
    description: "User-scope repairs should be reversible, and elevated actions should make before-and-after state clear.",
    icon: BadgeCheck,
  },
  {
    title: "Desktop focused",
    description: "The suite prioritizes app visibility, launchability, login behavior, MIME handling, and sandbox repair over generic housekeeping.",
    icon: Stethoscope,
  },
];
