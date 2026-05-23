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
      } as T);
    case "list_launchers":
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
