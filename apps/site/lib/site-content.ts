import {
  AppWindow,
  BadgeCheck,
  FileCode2,
  Globe2,
  Image,
  Package,
  ShieldCheck,
  Stethoscope,
  Terminal,
} from "lucide-react";

export const siteConfig = {
  name: "DeskCrafter",
  tagline: "Craft Linux launchers without fighting desktop files.",
  description:
    "A native Linux launcher suite for creating, validating, repairing, and managing desktop entries, AppImages, scripts, URLs, icons, and categories.",
  githubUrl: "https://github.com/DhanushSantosh/DeskCrafter",
};

export const featureGroups = [
  {
    title: "Desktop Entry Studio",
    description: "Create and preview FreeDesktop-compatible launchers with safe user-owned installs.",
    icon: AppWindow,
  },
  {
    title: "AppImage Integrator",
    description: "Turn portable AppImages into polished app menu entries with icon and category metadata.",
    icon: Package,
  },
  {
    title: "Script Launcher",
    description: "Wrap shell, Python, and executable scripts with terminal-aware launch behavior.",
    icon: FileCode2,
  },
  {
    title: "URL Launcher",
    description: "Pin local dashboards, docs, and web tools into your Linux application menu.",
    icon: Globe2,
  },
  {
    title: "Icon Manager",
    description: "Resolve theme names and local icon paths before you save broken metadata.",
    icon: Image,
  },
  {
    title: "Launcher Doctor",
    description: "Scan for missing executables, missing icons, duplicate names, and malformed entries.",
    icon: Stethoscope,
  },
];

export const proofPoints = [
  { label: "Default writes", value: "User XDG" },
  { label: "Root required", value: "No" },
  { label: "Primary package", value: "AppImage" },
];

export const principles = [
  {
    title: "Local by default",
    description: "Launcher data stays on your Linux machine. No account, service, or cloud dependency.",
    icon: ShieldCheck,
  },
  {
    title: "Repairable changes",
    description: "Managed launcher updates are designed around validation, previews, and backups.",
    icon: BadgeCheck,
  },
  {
    title: "Made for daily tools",
    description: "Scripts, AppImages, URLs, and desktop entries live together in one practical workspace.",
    icon: Terminal,
  },
];
