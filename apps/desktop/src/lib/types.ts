export type LauncherKind = "application" | "app_image" | "script" | "url";

export type ErrorCode =
  | "invalid_input"
  | "not_found"
  | "permission_denied"
  | "io_error"
  | "parse_error"
  | "unsupported_target";

export interface ApiError {
  code: ErrorCode;
  message: string;
}

export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: ApiError;
}

export interface LauncherInput {
  name: string;
  description: string;
  execPath: string;
  iconPath: string;
  categories: string[];
  terminal: boolean;
  kind: LauncherKind;
  url?: string | null;
}

export interface Launcher extends LauncherInput {
  id: string;
  desktopFilePath: string;
  managed: boolean;
}

export interface SystemProfile {
  dataHome: string;
  configHome: string;
  applicationsDir: string;
  metadataDir: string;
  desktopSession?: string | null;
  distro?: string | null;
  packageManager?: string | null;
  hasSystemd: boolean;
  hasFlatpak: boolean;
  hasAppimageSupport: boolean;
}

export interface ValidationReport {
  valid: boolean;
  warnings: string[];
  errors: string[];
  preview: string;
}

export interface InspectTargetResult {
  kind: LauncherKind;
  suggestedName: string;
  execPath: string;
  terminal: boolean;
  warnings: string[];
}

export interface IconResolution {
  input: string;
  resolvedPath?: string | null;
  themeName?: string | null;
  exists: boolean;
}

export interface LauncherIssue {
  launcherId?: string | null;
  path: string;
  severity: "info" | "warning" | "error";
  message: string;
}

export interface RepairOptions {
  normalizeCategories: boolean;
  refreshIcon: boolean;
}

export type ToolCategory =
  | "launchers"
  | "startup"
  | "apps"
  | "associations"
  | "sandboxes"
  | "permissions"
  | "advanced";

export type PrivilegeLevel =
  | "read_only"
  | "user_write"
  | "elevated_write"
  | "system_repair";

export type ToolActionKind =
  | "scan"
  | "repair"
  | "install"
  | "update"
  | "remove"
  | "elevated_action";

export interface ToolActionDescriptor {
  id: string;
  label: string;
  kind: ToolActionKind;
  requiresPath: boolean;
  requiresValue: boolean;
  requiresElevation: boolean;
}

export interface ToolDefinition {
  id: string;
  label: string;
  category: ToolCategory;
  description: string;
  privilegeLevel: PrivilegeLevel;
  elevationMode: string;
  reversible: boolean;
  desktopTargets: string[];
  supportedDistros: string[];
  primaryActions: ToolActionDescriptor[];
}

export interface ToolScanInput {
  query?: string | null;
  path?: string | null;
  targetId?: string | null;
}

export interface ToolActionInput {
  query?: string | null;
  path?: string | null;
  action?: string | null;
  targetId?: string | null;
  value?: string | null;
  secondaryValue?: string | null;
  allowElevation?: boolean | null;
}

export interface GuidedCommand {
  label: string;
  command: string;
  privilegeLevel: PrivilegeLevel;
  explanation: string;
}

export interface ToolResult {
  toolId: string;
  summary: string;
  data: unknown;
  warnings: string[];
  blockingIssues: string[];
  performedActions: string[];
  beforeAfterState?: unknown;
  restartOrRefreshNeeded: string[];
  guidedCommands: GuidedCommand[];
}

export interface ToolStatus {
  toolId: string;
  available: boolean;
  summary: string;
  warnings: string[];
}
