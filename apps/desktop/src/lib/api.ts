import { previewFallback } from "./launcher";
import type {
  ApiResult,
  IconResolution,
  InspectTargetResult,
  Launcher,
  LauncherInput,
  LauncherIssue,
  RepairOptions,
  SystemProfile,
  GuidedCommand,
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
        toolId: String(args?.toolId ?? "system_profile"),
        summary: "Preview scan completed",
        data: { preview: true, input: args?.input ?? {} },
        warnings: ["Running outside Tauri; system data is mocked."],
        repairSuggestions: [],
        guidedCommands: [],
      } as T);
    case "validate_tool_action":
    case "apply_tool_action":
      return ok({
        toolId: String(args?.toolId ?? "permissions_helper"),
        summary: "Preview action result",
        data: { input: args?.input ?? {} },
        warnings: ["Actions are disabled in browser preview mode."],
        repairSuggestions: [],
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
      id: "launcher_manager",
      label: "Launcher Manager",
      category: "launchers",
      description: "Create, inspect, repair, and launch user application entries.",
      riskLevel: "user_write",
      capabilities: ["desktop entries", "AppImages", "scripts", "URLs"],
      supportedDistros: ["linux"],
    },
    {
      id: "autostart_manager",
      label: "Autostart Manager",
      category: "startup",
      description: "Inspect user and system autostart entries.",
      riskLevel: "user_write",
      capabilities: ["XDG autostart"],
      supportedDistros: ["linux"],
    },
    {
      id: "appimage_manager",
      label: "AppImage Manager",
      category: "apps",
      description: "Find AppImages and report integration readiness.",
      riskLevel: "read_only",
      capabilities: ["AppImage discovery"],
      supportedDistros: ["linux"],
    },
    {
      id: "environment_path",
      label: "Environment & PATH Viewer",
      category: "system",
      description: "Inspect PATH entries and shell profile files.",
      riskLevel: "read_only",
      capabilities: ["PATH", "shell profiles"],
      supportedDistros: ["linux"],
    },
    {
      id: "service_viewer",
      label: "Service Viewer",
      category: "system",
      description: "Read user and system systemd service state.",
      riskLevel: "guided_admin",
      capabilities: ["systemd", "guided commands"],
      supportedDistros: ["linux"],
    },
    {
      id: "disk_cache_inspector",
      label: "Disk & Cache Inspector",
      category: "storage",
      description: "Read safe user-owned cache sizes.",
      riskLevel: "read_only",
      capabilities: ["cache sizes"],
      supportedDistros: ["linux"],
    },
    {
      id: "permissions_helper",
      label: "Permissions Helper",
      category: "permissions",
      description: "Inspect file executability and user-owned chmod actions.",
      riskLevel: "user_write",
      capabilities: ["permissions", "executable bit"],
      supportedDistros: ["linux"],
    },
    {
      id: "system_profile",
      label: "System Profile",
      category: "system",
      description: "Show distro, session, XDG paths, and integration capabilities.",
      riskLevel: "read_only",
      capabilities: ["distro", "XDG", "systemd", "Flatpak"],
      supportedDistros: ["linux"],
    },
  ];
}
