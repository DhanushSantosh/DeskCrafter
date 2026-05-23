import type { LauncherInput, LauncherKind } from "./types";

export const defaultLauncherInput: LauncherInput = {
  name: "Untitled Launcher",
  description: "",
  execPath: "",
  iconPath: "",
  categories: ["Utility"],
  terminal: false,
  kind: "application",
  url: null,
};

export const toolCatalog: Array<{
  id: LauncherKind | "doctor" | "icons";
  label: string;
  description: string;
}> = [
  {
    id: "application",
    label: "Desktop Entry Studio",
    description: "Create and edit FreeDesktop launchers.",
  },
  {
    id: "app_image",
    label: "AppImage Integrator",
    description: "Turn AppImages into first-class app menu entries.",
  },
  {
    id: "script",
    label: "Script Launcher",
    description: "Wrap shell, Python, and executable scripts.",
  },
  {
    id: "url",
    label: "URL Launcher",
    description: "Pin web tools to your Linux app menu.",
  },
  {
    id: "icons",
    label: "Icon Manager",
    description: "Resolve icon paths and theme names.",
  },
  {
    id: "doctor",
    label: "Launcher Doctor",
    description: "Find broken launchers and repair metadata.",
  },
];

export function normalizeCategoryInput(value: string): string[] {
  const categories = value
    .split(",")
    .map((category) => category.trim())
    .filter(Boolean);
  return categories.length > 0 ? Array.from(new Set(categories)) : ["Utility"];
}

export function categoriesToInput(categories: string[]): string {
  return categories.join(", ");
}

export function buildLauncherInput(
  base: LauncherInput,
  patch: Partial<LauncherInput>
): LauncherInput {
  return {
    ...base,
    ...patch,
    categories: patch.categories ?? base.categories,
    url: patch.url === undefined ? base.url : patch.url,
  };
}

export function previewFallback(input: LauncherInput): string {
  const lines = [
    "[Desktop Entry]",
    "Version=1.0",
    `Type=${input.kind === "url" ? "Link" : "Application"}`,
    `Name=${input.name.trim() || "Untitled Launcher"}`,
  ];
  if (input.description.trim()) {
    lines.push(`Comment=${input.description.trim()}`);
  }
  if (input.kind === "url") {
    lines.push(`URL=${input.url ?? ""}`);
  } else {
    lines.push(`Exec=${input.execPath.trim()}`);
  }
  if (input.iconPath.trim()) {
    lines.push(`Icon=${input.iconPath.trim()}`);
  }
  lines.push(`Categories=${input.categories.join(";")};`);
  lines.push(`Terminal=${input.terminal ? "true" : "false"}`);
  lines.push("X-DeskCrafter=true");
  lines.push("StartupWMClass=DeskCrafter");
  lines.push("");
  return lines.join("\n");
}
