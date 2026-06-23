import { previewFallback } from "./launcher";
import type {
  ApiResult,
  GuidedCommand,
  IconResolution,
  InspectTargetResult,
  Launcher,
  LauncherInput,
  LauncherIssue,
  RepairOptions,
  SystemProfile,
  ToolActionInput,
  ToolDefinition,
  ToolResult,
  ToolScanInput,
  ToolStatus,
  ValidationReport,
} from "./types";

type CommandArgs = Record<string, unknown>;

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

async function invokeCommand<T>(command: string, args?: CommandArgs): Promise<ApiResult<T>> {
  if (typeof window !== "undefined" && window.__TAURI_INTERNALS__) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<ApiResult<T>>(command, args);
  }
  return mockCommand<T>(command, args);
}

function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

function mockCommand<T>(command: string, args?: CommandArgs): ApiResult<T> {
  const input = args?.input as LauncherInput | undefined;
  switch (command) {
    case "get_system_profile":
      return ok({
        dataHome: "~/.local/share",
        configHome: "~/.config",
        applicationsDir: "~/.local/share/applications",
        metadataDir: "~/.local/share/deskcrafter",
        desktopSession: "Preview",
        distro: "Linux",
        packageManager: "mock",
        hasSystemd: true,
        hasFlatpak: false,
        hasAppimageSupport: true,
      } as T);
    case "list_launchers":
      return ok([] as T);
    case "list_tools":
      return ok(mockTools() as T);
    case "get_tool_status":
      return ok({
        toolId: String(args?.toolId ?? "system_profile"),
        available: true,
        summary: "Browser preview mode",
        warnings: [],
      } as T);
    case "run_tool_scan":
      return ok({
        toolId: String(args?.toolId ?? "launcher_repair_integrator"),
        summary: "Preview scan completed",
        data: { preview: true, input: args?.input ?? {} },
        warnings: ["Running outside Tauri; system data is mocked."],
        blockingIssues: [],
        performedActions: [],
        beforeAfterState: null,
        restartOrRefreshNeeded: [],
        guidedCommands: [],
      } as T);
    case "validate_tool_action":
    case "apply_tool_action":
      return ok({
        toolId: String(args?.toolId ?? "permission_ownership_repair"),
        summary: "Preview action result",
        data: { input: args?.input ?? {} },
        warnings: ["Actions are disabled in browser preview mode."],
        blockingIssues: [],
        performedActions: [String((args?.input as ToolActionInput | undefined)?.action ?? "preview")],
        beforeAfterState: null,
        restartOrRefreshNeeded: [],
        guidedCommands: [],
      } as T);
    case "list_guided_admin_commands":
      return ok([] as T);
    case "validate_launcher":
      return ok({
        valid: Boolean(input?.name && (input.kind === "url" ? input.url : input.execPath)),
        warnings: input?.iconPath ? [] : ["No icon is configured"],
        errors: input?.name ? [] : ["Launcher name is required"],
        preview: input ? previewFallback(input) : "",
      } as T);
    case "inspect_target":
      return ok({
        kind: "application",
        suggestedName: "Preview Launcher",
        execPath: String(args?.pathOrUrl ?? ""),
        terminal: false,
        warnings: ["Running in browser preview mode"],
      } as T);
    case "resolve_icon":
      return ok({
        input: String(args?.input ?? ""),
        resolvedPath: null,
        themeName: String(args?.input ?? ""),
        exists: false,
      } as T);
    case "scan_launcher_issues":
      return ok([] as T);
    case "create_launcher":
    case "update_launcher":
    case "repair_launcher":
      return ok({
        id: "preview",
        ...(input ?? {}),
        desktopFilePath: "~/.local/share/applications/deskcrafter-preview.desktop",
        managed: true,
      } as T);
    case "delete_launcher":
    case "launch_entry":
      return ok(undefined as T);
    default:
      return {
        ok: false,
        error: {
          code: "unsupported_target",
          message: `Unsupported command: ${command}`,
        },
      };
  }
}

async function unwrap<T>(result: Promise<ApiResult<T>>): Promise<T> {
  const resolved = await result;
  if (resolved.ok && resolved.data !== undefined) {
    return resolved.data;
  }
  throw new Error(resolved.error?.message ?? "Unknown DeskCrafter command failure");
}

export const api = {
  getSystemProfile: () => unwrap(invokeCommand<SystemProfile>("get_system_profile")),
  listTools: () => unwrap(invokeCommand<ToolDefinition[]>("list_tools")),
  getToolStatus: (toolId: string) =>
    unwrap(invokeCommand<ToolStatus>("get_tool_status", { toolId })),
  runToolScan: (toolId: string, input: ToolScanInput = {}) =>
    unwrap(invokeCommand<ToolResult>("run_tool_scan", { toolId, input })),
  validateToolAction: (toolId: string, input: ToolActionInput = {}) =>
    unwrap(invokeCommand<ToolResult>("validate_tool_action", { toolId, input })),
  applyToolAction: (toolId: string, input: ToolActionInput = {}) =>
    unwrap(invokeCommand<ToolResult>("apply_tool_action", { toolId, input })),
  listGuidedAdminCommands: (toolId: string) =>
    unwrap(invokeCommand<GuidedCommand[]>("list_guided_admin_commands", { toolId })),
  listLaunchers: () => unwrap(invokeCommand<Launcher[]>("list_launchers")),
  getLauncher: (id: string) => unwrap(invokeCommand<Launcher>("get_launcher", { id })),
  createLauncher: (input: LauncherInput) =>
    unwrap(invokeCommand<Launcher>("create_launcher", { input })),
  updateLauncher: (id: string, input: LauncherInput) =>
    unwrap(invokeCommand<Launcher>("update_launcher", { id, input })),
  deleteLauncher: (id: string) => unwrap(invokeCommand<void>("delete_launcher", { id })),
  launchEntry: (id: string) => unwrap(invokeCommand<void>("launch_entry", { id })),
  inspectTarget: (pathOrUrl: string) =>
    unwrap(invokeCommand<InspectTargetResult>("inspect_target", { pathOrUrl })),
  validateLauncher: (input: LauncherInput) =>
    unwrap(invokeCommand<ValidationReport>("validate_launcher", { input })),
  repairLauncher: (id: string, repairOptions: RepairOptions) =>
    unwrap(invokeCommand<Launcher>("repair_launcher", { id, repairOptions })),
  resolveIcon: (input: string) => unwrap(invokeCommand<IconResolution>("resolve_icon", { input })),
  scanLauncherIssues: () => unwrap(invokeCommand<LauncherIssue[]>("scan_launcher_issues")),
};

function mockTools(): ToolDefinition[] {
  return [
    {
      id: "launcher_repair_integrator",
      label: "Launcher Repair & Integrator",
      category: "launchers",
      description: "Create, repair, refresh, and remove launchers so apps actually show up and launch.",
      privilegeLevel: "user_write",
      elevationMode: "optional",
      reversible: true,
      desktopTargets: ["KDE", "GNOME", "Xfce", "XDG"],
      supportedDistros: ["linux"],
      primaryActions: [
        { id: "refresh_menus", label: "Refresh menus", kind: "repair", requiresPath: false, requiresValue: false, requiresElevation: false },
        { id: "repair_selected", label: "Repair selected", kind: "repair", requiresPath: false, requiresValue: true, requiresElevation: false },
        { id: "install_global", label: "Install globally", kind: "elevated_action", requiresPath: false, requiresValue: true, requiresElevation: true },
      ],
      pathInputLabel: "Inspect target",
      pathInputPlaceholder: "Path to AppImage, script, executable, or https:// URL",
      valueInputLabel: "Selected launcher id",
      valueInputPlaceholder: "Uses the selected launcher when available",
    },
    {
      id: "portable_app_integrator",
      label: "Portable App Integrator",
      category: "apps",
      description: "Integrate AppImages, binaries, and scripts into the desktop with real launchers.",
      privilegeLevel: "user_write",
      elevationMode: "optional",
      reversible: true,
      desktopTargets: ["KDE", "GNOME", "Xfce", "XDG"],
      supportedDistros: ["linux"],
      primaryActions: [
        { id: "integrate_path", label: "Integrate path", kind: "install", requiresPath: true, requiresValue: false, requiresElevation: false },
        { id: "relink_target", label: "Re-link target", kind: "repair", requiresPath: true, requiresValue: false, requiresElevation: false },
      ],
      pathInputLabel: "Portable target",
      pathInputPlaceholder: "~/.local/share/portable-apps/MyApp.AppImage",
      valueInputLabel: "Launcher id",
      valueInputPlaceholder: "Used for remove integration",
    },
    {
      id: "autostart_actions",
      label: "Autostart Actions",
      category: "startup",
      description: "Enable, disable, duplicate, and repair startup entries that should run on login.",
      privilegeLevel: "user_write",
      elevationMode: "optional",
      reversible: true,
      desktopTargets: ["KDE", "GNOME", "Xfce", "XDG"],
      supportedDistros: ["linux"],
      primaryActions: [
        { id: "enable_launcher", label: "Enable launcher", kind: "install", requiresPath: false, requiresValue: true, requiresElevation: false },
        { id: "disable_path", label: "Disable path", kind: "remove", requiresPath: true, requiresValue: false, requiresElevation: false },
      ],
      pathInputLabel: "Autostart path or target",
      pathInputPlaceholder: "~/.config/autostart/example.desktop",
      valueInputLabel: "Launcher id or new file name",
      valueInputPlaceholder: "Selected launcher id or copied desktop file name",
    },
    {
      id: "default_apps_mime_manager",
      label: "Default Apps & MIME Manager",
      category: "associations",
      description: "Inspect and repair file associations, URL scheme handlers, and open-with defaults.",
      privilegeLevel: "elevated_write",
      elevationMode: "required",
      reversible: true,
      desktopTargets: ["KDE", "GNOME", "Xfce", "XDG"],
      supportedDistros: ["linux"],
      primaryActions: [
        { id: "set_default_mime", label: "Set MIME default", kind: "update", requiresPath: true, requiresValue: true, requiresElevation: false },
        { id: "set_default_browser", label: "Set browser", kind: "update", requiresPath: false, requiresValue: true, requiresElevation: false },
      ],
      pathInputLabel: "MIME type",
      pathInputPlaceholder: "application/pdf or x-scheme-handler/https",
      valueInputLabel: "Desktop file id",
      valueInputPlaceholder: "org.mozilla.firefox.desktop",
    },
    {
      id: "flatpak_permissions_manager",
      label: "Flatpak Permissions Manager",
      category: "sandboxes",
      description: "Inspect and change Flatpak overrides so sandboxed apps can actually work.",
      privilegeLevel: "elevated_write",
      elevationMode: "required",
      reversible: true,
      desktopTargets: ["KDE", "GNOME", "Xfce", "XDG"],
      supportedDistros: ["linux"],
      primaryActions: [
        { id: "grant_home", label: "Grant home", kind: "update", requiresPath: true, requiresValue: false, requiresElevation: false },
        { id: "grant_path", label: "Grant path", kind: "update", requiresPath: true, requiresValue: true, requiresElevation: false },
        { id: "reset_overrides", label: "Reset overrides", kind: "repair", requiresPath: true, requiresValue: false, requiresElevation: false },
      ],
      pathInputLabel: "Flatpak app id",
      pathInputPlaceholder: "org.mozilla.firefox",
      valueInputLabel: "Filesystem path",
      valueInputPlaceholder: "/home/user/Documents",
    },
    {
      id: "permission_ownership_repair",
      label: "Permission & Ownership Repair",
      category: "permissions",
      description: "Repair executable bits and ownership problems that break launcher and app integration.",
      privilegeLevel: "elevated_write",
      elevationMode: "required",
      reversible: true,
      desktopTargets: ["KDE", "GNOME", "Xfce", "XDG"],
      supportedDistros: ["linux"],
      primaryActions: [
        { id: "make_executable", label: "Make executable", kind: "repair", requiresPath: true, requiresValue: false, requiresElevation: false },
        { id: "fix_ownership", label: "Fix ownership", kind: "elevated_action", requiresPath: true, requiresValue: false, requiresElevation: true },
      ],
      pathInputLabel: "Path to repair",
      pathInputPlaceholder: "~/.local/share/applications",
      valueInputLabel: "Optional value",
      valueInputPlaceholder: "Unused for current actions",
    },
    {
      id: "service_actions",
      label: "Service Actions",
      category: "advanced",
      description: "Start, stop, and enable services when desktop tools depend on them.",
      privilegeLevel: "system_repair",
      elevationMode: "required",
      reversible: true,
      desktopTargets: ["systemd"],
      supportedDistros: ["linux"],
      primaryActions: [
        { id: "start_user", label: "Start user", kind: "update", requiresPath: true, requiresValue: false, requiresElevation: false },
        { id: "start_system", label: "Start system", kind: "elevated_action", requiresPath: true, requiresValue: false, requiresElevation: true },
      ],
      pathInputLabel: "Service name",
      pathInputPlaceholder: "pipewire.service",
      valueInputLabel: "Optional value",
      valueInputPlaceholder: "Unused for current actions",
    },
    {
      id: "system_profile",
      label: "System Profile",
      category: "advanced",
      description: "Show distro, session, XDG paths, and integration capabilities.",
      privilegeLevel: "read_only",
      elevationMode: "none",
      reversible: false,
      desktopTargets: ["KDE", "GNOME", "Xfce", "XDG"],
      supportedDistros: ["linux"],
      primaryActions: [
        { id: "refresh_profile", label: "Refresh profile", kind: "scan", requiresPath: false, requiresValue: false, requiresElevation: false },
      ],
      pathInputLabel: "Optional query",
      pathInputPlaceholder: "Leave empty to scan the current system",
      valueInputLabel: "Optional value",
      valueInputPlaceholder: "Unused for current actions",
    },
  ];
}
