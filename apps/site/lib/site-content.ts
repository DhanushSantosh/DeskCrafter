import {
  Activity,
  AppWindow,
  BadgeCheck,
  Boxes,
  DatabaseZap,
  FileCog,
  HardDrive,
  Package,
  Route,
  ShieldCheck,
  Stethoscope,
  Terminal,
} from "lucide-react";

export const siteConfig = {
  name: "DeskCrafter",
  tagline: "A Linux desktop tools suite for launchers, startup apps, PATH, services, cache, permissions, and system profile checks.",
  description:
    "DeskCrafter brings launcher management, autostart inspection, AppImage discovery, PATH diagnostics, service visibility, cache inspection, permissions checks, and system profiling into one local-first Linux workspace.",
  githubUrl: "https://github.com/DhanushSantosh/DeskCrafter",
};

export const toolDefinitions = [
  {
    id: "launcher_manager",
    title: "Launcher Manager",
    category: "Launchers",
    risk: "User write",
    description: "Create, inspect, repair, and launch user application entries.",
    icon: AppWindow,
  },
  {
    id: "autostart_manager",
    title: "Autostart Manager",
    category: "Startup",
    risk: "User write",
    description: "Inspect user and system autostart entries without touching root-owned files.",
    icon: Activity,
  },
  {
    id: "appimage_manager",
    title: "AppImage Manager",
    category: "Apps",
    risk: "Read first",
    description: "Discover AppImages and prepare safe launcher integration paths.",
    icon: Package,
  },
  {
    id: "environment_path",
    title: "Environment & PATH Viewer",
    category: "System",
    risk: "Read only",
    description: "Find duplicate PATH entries, missing directories, and shell profile hints.",
    icon: Route,
  },
  {
    id: "service_viewer",
    title: "Service Viewer",
    category: "System",
    risk: "Guided admin",
    description: "Read systemd service state and show copyable commands for privileged actions.",
    icon: FileCog,
  },
  {
    id: "disk_cache_inspector",
    title: "Disk & Cache Inspector",
    category: "Storage",
    risk: "Read only",
    description: "Inspect user-owned cache locations and suggest review commands before cleanup.",
    icon: HardDrive,
  },
  {
    id: "permissions_helper",
    title: "Permissions Helper",
    category: "Permissions",
    risk: "User write",
    description: "Check ownership and executability; only user-owned chmod actions are direct.",
    icon: ShieldCheck,
  },
  {
    id: "system_profile",
    title: "System Profile",
    category: "System",
    risk: "Read only",
    description: "Report distro, desktop session, XDG paths, package hints, Flatpak, and AppImage support.",
    icon: DatabaseZap,
  },
];

export const primaryFeatures = [
  {
    title: "Launcher Manager",
    description: "Build and repair desktop entries, AppImage launchers, scripts, URLs, icons, and categories from a user-owned XDG workspace.",
    icon: AppWindow,
  },
  {
    title: "System Profile & Autostart",
    description: "Map the Linux session, XDG paths, startup entries, package hints, and environment signals before changing anything.",
    icon: Boxes,
  },
];

export const bentoFeatures = toolDefinitions.filter((tool) =>
  [
    "environment_path",
    "service_viewer",
    "disk_cache_inspector",
    "permissions_helper",
    "appimage_manager",
    "autostart_manager",
  ].includes(tool.id)
);

export const proofPoints = [
  { label: "Default mode", value: "Read first" },
  { label: "Root required", value: "No" },
  { label: "Tool modules", value: "8" },
];

export const principles = [
  {
    title: "Local by default",
    description: "Scans and launcher data stay on your Linux machine. No account, service, or cloud dependency.",
    icon: ShieldCheck,
  },
  {
    title: "Guided admin boundaries",
    description: "Privileged service and system actions appear as explained commands, not automatic escalation.",
    icon: Terminal,
  },
  {
    title: "Repairable user changes",
    description: "Direct writes are reserved for explicit user-owned operations such as launcher metadata or executable bits.",
    icon: BadgeCheck,
  },
  {
    title: "Suite diagnostics",
    description: "Launcher, startup, PATH, services, cache, permissions, and profile checks share one registry model.",
    icon: Stethoscope,
  },
];
