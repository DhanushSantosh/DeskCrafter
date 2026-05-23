import {
  Activity,
  AppWindow,
  BadgeCheck,
  Boxes,
  Gauge,
  HardDrive,
  Image,
  KeyRound,
  Package,
  Play,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Stethoscope,
  Terminal,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "./components/Button";
import { api } from "./lib/api";
import {
  buildLauncherInput,
  categoriesToInput,
  defaultLauncherInput,
  normalizeCategoryInput,
} from "./lib/launcher";
import type {
  GuidedCommand,
  IconResolution,
  InspectTargetResult,
  Launcher,
  LauncherInput,
  LauncherIssue,
  LauncherKind,
  SystemProfile,
  ToolCategory,
  ToolDefinition,
  ToolResult,
  ValidationReport,
} from "./lib/types";
import "./styles.css";

const categoryLabels: Record<ToolCategory, string> = {
  launchers: "Launchers",
  startup: "Startup",
  apps: "Apps",
  system: "System",
  storage: "Storage",
  permissions: "Permissions",
};

const categoryIcons = {
  launchers: AppWindow,
  startup: Gauge,
  apps: Package,
  system: Terminal,
  storage: HardDrive,
  permissions: KeyRound,
};

const toolIcons: Record<string, typeof AppWindow> = {
  launcher_manager: AppWindow,
  autostart_manager: Gauge,
  appimage_manager: Package,
  environment_path: Terminal,
  service_viewer: ShieldCheck,
  disk_cache_inspector: HardDrive,
  permissions_helper: KeyRound,
  system_profile: Boxes,
};

const launcherToolId = "launcher_manager";
const permissionsToolId = "permissions_helper";

type SuiteSnapshot = {
  systemProfile: SystemProfile;
  definitions: ToolDefinition[];
  launcherList: Launcher[];
  issueList: LauncherIssue[];
};

async function loadSuiteData(): Promise<SuiteSnapshot> {
  const [systemProfile, definitions, launcherList, issueList] = await Promise.all([
    api.getSystemProfile(),
    api.listTools(),
    api.listLaunchers(),
    api.scanLauncherIssues(),
  ]);
  return { systemProfile, definitions, launcherList, issueList };
}

export default function App() {
  const [tools, setTools] = useState<ToolDefinition[]>([]);
  const [activeToolId, setActiveToolId] = useState(launcherToolId);
  const [profile, setProfile] = useState<SystemProfile | null>(null);
  const [launchers, setLaunchers] = useState<Launcher[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<LauncherInput>(defaultLauncherInput);
  const [validation, setValidation] = useState<ValidationReport | null>(null);
  const [issues, setIssues] = useState<LauncherIssue[]>([]);
  const [iconResolution, setIconResolution] = useState<IconResolution | null>(null);
  const [inspectedTarget, setInspectedTarget] = useState<InspectTargetResult | null>(null);
  const [toolResult, setToolResult] = useState<ToolResult | null>(null);
  const [guidedCommands, setGuidedCommands] = useState<GuidedCommand[]>([]);
  const [status, setStatus] = useState("Ready");
  const [targetInput, setTargetInput] = useState("");

  const selectedLauncher = useMemo(
    () => launchers.find((launcher) => launcher.id === selectedId) ?? null,
    [launchers, selectedId]
  );

  const activeTool = useMemo(
    () => tools.find((tool) => tool.id === activeToolId) ?? null,
    [tools, activeToolId]
  );

  const groupedTools = useMemo(() => {
    const grouped = new Map<ToolCategory, ToolDefinition[]>();
    for (const tool of tools) {
      const current = grouped.get(tool.category) ?? [];
      current.push(tool);
      grouped.set(tool.category, current);
    }
    return grouped;
  }, [tools]);

  const refreshSuite = useCallback(async (announce = true) => {
    if (announce) {
      setStatus("Refreshing suite");
    }
    const { systemProfile, definitions, launcherList, issueList } = await loadSuiteData();
    setProfile(systemProfile);
    setTools(definitions);
    setLaunchers(launcherList);
    setIssues(issueList);
    setStatus("Suite refreshed");
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const { systemProfile, definitions, launcherList, issueList } = await loadSuiteData();
        if (active) {
          setProfile(systemProfile);
          setTools(definitions);
          setLaunchers(launcherList);
          setIssues(issueList);
          setStatus("Suite refreshed");
        }
      } catch (error) {
        if (active) {
          setStatus(error instanceof Error ? error.message : "Unable to refresh suite");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .validateLauncher(draft)
      .then((report) => {
        if (!cancelled) {
          setValidation(report);
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setValidation({
            valid: false,
            warnings: [],
            errors: [error.message],
            preview: "",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [draft]);

  function updateDraft(patch: Partial<LauncherInput>) {
    setDraft((current) => buildLauncherInput(current, patch));
  }

  async function selectTool(tool: ToolDefinition) {
    setActiveToolId(tool.id);
    setToolResult(null);
    setGuidedCommands([]);
    if (tool.id !== launcherToolId) {
      await scanTool(tool.id);
    }
  }

  function selectLauncher(launcher: Launcher) {
    setSelectedId(launcher.id);
    setActiveToolId(launcherToolId);
    setDraft({
      name: launcher.name,
      description: launcher.description,
      execPath: launcher.execPath,
      iconPath: launcher.iconPath,
      categories: launcher.categories,
      terminal: launcher.terminal,
      kind: launcher.kind,
      url: launcher.url ?? null,
    });
  }

  async function scanTool(toolId = activeToolId) {
    setStatus("Scanning tool");
    const result = await api.runToolScan(toolId, {
      query: targetInput || null,
      path: targetInput || null,
    });
    const commands = await api.listGuidedAdminCommands(toolId);
    setToolResult(result);
    setGuidedCommands(commands.length > 0 ? commands : result.guidedCommands);
    setStatus(result.summary);
  }

  async function inspectTarget() {
    if (!targetInput.trim()) {
      setStatus("Enter a path or URL to inspect");
      return;
    }
    if (activeToolId !== launcherToolId) {
      await scanTool(activeToolId);
      return;
    }
    const result = await api.inspectTarget(targetInput);
    setInspectedTarget(result);
    updateDraft({
      name: result.suggestedName,
      execPath: result.execPath,
      terminal: result.terminal,
      kind: result.kind,
      url: result.kind === "url" ? targetInput : null,
    });
    setStatus("Target inspected");
  }

  async function saveLauncher() {
    const saved = selectedId
      ? await api.updateLauncher(selectedId, draft)
      : await api.createLauncher(draft);
    setSelectedId(saved.id);
    setStatus(`${saved.name} saved`);
    await refreshSuite();
  }

  async function deleteSelected() {
    if (!selectedId) {
      setStatus("Select a launcher to delete");
      return;
    }
    await api.deleteLauncher(selectedId);
    setSelectedId(null);
    setDraft(defaultLauncherInput);
    setStatus("Launcher deleted with backup");
    await refreshSuite();
  }

  async function launchSelected() {
    if (!selectedId) {
      setStatus("Select a launcher to run");
      return;
    }
    await api.launchEntry(selectedId);
    setStatus("Launch requested");
  }

  async function resolveIcon() {
    const result = await api.resolveIcon(draft.iconPath);
    setIconResolution(result);
    setStatus(result.exists ? "Icon resolved" : "Icon will be treated as a theme name");
  }

  async function repairSelected() {
    if (!selectedId) {
      setStatus("Select a launcher to repair");
      return;
    }
    const repaired = await api.repairLauncher(selectedId, {
      normalizeCategories: true,
      refreshIcon: true,
    });
    selectLauncher(repaired);
    setStatus("Launcher metadata repaired");
    await refreshSuite();
  }

  const ActiveIcon = activeTool ? toolIcons[activeTool.id] ?? Activity : Activity;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">D</div>
          <div>
            <div className="brand-name">DeskCrafter</div>
            <div className="brand-subtitle">Linux Tools Suite</div>
          </div>
        </div>

        <nav className="tool-nav" aria-label="DeskCrafter tools">
          {Array.from(groupedTools.entries()).map(([category, categoryTools]) => {
            const CategoryIcon = categoryIcons[category];
            return (
              <section className="tool-group" key={category}>
                <div className="tool-group-label">
                  <CategoryIcon size={14} />
                  {categoryLabels[category]}
                </div>
                {categoryTools.map((tool) => {
                  const Icon = toolIcons[tool.id] ?? Activity;
                  return (
                    <button
                      key={tool.id}
                      className={`tool-button ${activeToolId === tool.id ? "tool-button-active" : ""}`}
                      onClick={() => void selectTool(tool)}
                      type="button"
                    >
                      <Icon size={18} />
                      <span>
                        <strong>{tool.label}</strong>
                        <small>{tool.description}</small>
                      </span>
                    </button>
                  );
                })}
              </section>
            );
          })}
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <div className="eyebrow">System profile</div>
            <div className="path-label">
              {profile?.distro ?? "Linux"} · {profile?.desktopSession ?? "Desktop session"} ·{" "}
              {profile?.packageManager ?? "package manager unknown"}
            </div>
          </div>
          <div className="topbar-actions">
            <span className="status-pill">
              <Activity size={14} />
              {status}
            </span>
            <Button variant="secondary" onClick={() => void refreshSuite()}>
              <RefreshCw size={16} />
              Refresh
            </Button>
          </div>
        </header>

        <div className="content-grid">
          <section className="primary-panel">
            <div className="section-heading">
              <ActiveIcon size={24} />
              <div>
                <h1>{activeTool?.label ?? "Linux Tools Suite"}</h1>
                <p>{activeTool?.description ?? "Loading suite registry"}</p>
              </div>
            </div>

            <div className="target-row">
              <input
                value={targetInput}
                onChange={(event) => setTargetInput(event.target.value)}
                placeholder={
                  activeToolId === launcherToolId
                    ? "Inspect an AppImage, script path, executable, or https:// URL"
                    : "Optional path or query for this tool"
                }
              />
              <Button variant="secondary" onClick={() => void inspectTarget()}>
                <Search size={16} />
                {activeToolId === launcherToolId ? "Inspect" : "Scan"}
              </Button>
            </div>

            {activeTool ? (
              <ToolMeta tool={activeTool} />
            ) : null}

            {activeToolId === launcherToolId ? (
              <LauncherModule
                draft={draft}
                selectedLauncher={selectedLauncher}
                inspectedTarget={inspectedTarget}
                iconResolution={iconResolution}
                onChange={updateDraft}
                onSave={() => void saveLauncher()}
                onDelete={() => void deleteSelected()}
                onLaunch={() => void launchSelected()}
                onResolveIcon={() => void resolveIcon()}
                onRepair={() => void repairSelected()}
                issues={issues}
              />
            ) : (
              <ToolResultPanel
                result={toolResult}
                guidedCommands={guidedCommands}
                onScan={() => void scanTool()}
                onPermissionAction={
                  activeToolId === permissionsToolId
                    ? () =>
                        void api
                          .applyToolAction(permissionsToolId, {
                            path: targetInput || null,
                            action: "make_executable",
                          })
                          .then(setToolResult)
                    : undefined
                }
              />
            )}
          </section>

          <aside className="inspector">
            <div className="inspector-section">
              <h2>Tool status</h2>
              <div className="message message-ok">{activeTool?.riskLevel.replace("_", " ") ?? "loading"}</div>
              {activeTool?.capabilities.map((capability) => (
                <div className="capability-pill" key={capability}>{capability}</div>
              ))}
            </div>

            <div className="inspector-section">
              <h2>Launcher library</h2>
              <div className="launcher-list">
                {launchers.length === 0 ? (
                  <p className="empty-state">No user launchers found yet.</p>
                ) : (
                  launchers.map((launcher) => (
                    <button
                      key={launcher.id}
                      className={`launcher-row ${selectedId === launcher.id ? "launcher-row-active" : ""}`}
                      onClick={() => selectLauncher(launcher)}
                      type="button"
                    >
                      <span>{launcher.name}</span>
                      <small>{launcher.kind.replace("_", " ")}</small>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="inspector-section">
              <h2>Validation</h2>
              {validation?.errors.map((error) => (
                <div className="message message-error" key={error}>{error}</div>
              ))}
              {validation?.warnings.map((warning) => (
                <div className="message message-warning" key={warning}>{warning}</div>
              ))}
              {validation?.valid ? <div className="message message-ok">Launcher ready to save</div> : null}
            </div>

            <div className="inspector-section preview-section">
              <h2>Desktop preview</h2>
              <pre>{validation?.preview || "Open Launcher Manager to preview generated launcher content."}</pre>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function ToolMeta({ tool }: { tool: ToolDefinition }) {
  return (
    <div className="notice suite-notice">
      <BadgeCheck size={16} />
      <span>
        {categoryLabels[tool.category]} · {tool.riskLevel.replace("_", " ")} · {tool.supportedDistros.join(", ")}
      </span>
    </div>
  );
}

function LauncherModule({
  draft,
  selectedLauncher,
  inspectedTarget,
  iconResolution,
  issues,
  onChange,
  onSave,
  onDelete,
  onLaunch,
  onResolveIcon,
  onRepair,
}: {
  draft: LauncherInput;
  selectedLauncher: Launcher | null;
  inspectedTarget: InspectTargetResult | null;
  iconResolution: IconResolution | null;
  issues: LauncherIssue[];
  onChange: (patch: Partial<LauncherInput>) => void;
  onSave: () => void;
  onDelete: () => void;
  onLaunch: () => void;
  onResolveIcon: () => void;
  onRepair: () => void;
}) {
  return (
    <>
      {inspectedTarget ? (
        <div className="notice">
          <BadgeCheck size={16} />
          <span>
            Suggested {inspectedTarget.kind.replace("_", " ")} launcher:{" "}
            <strong>{inspectedTarget.suggestedName}</strong>
          </span>
        </div>
      ) : null}
      <LauncherForm
        draft={draft}
        selectedLauncher={selectedLauncher}
        onChange={onChange}
        onSave={onSave}
        onDelete={onDelete}
        onLaunch={onLaunch}
      />
      <div className="suite-grid">
        <div className="terminal-card">
          <Image size={22} />
          <div>
            <h2>Icon resolution</h2>
            <p>{iconResolution ? iconResolution.resolvedPath ?? iconResolution.themeName ?? "unresolved" : "Resolve the icon field when needed."}</p>
          </div>
          <Button variant="secondary" onClick={onResolveIcon}>Resolve</Button>
        </div>
        <div className="terminal-card">
          <Stethoscope size={22} />
          <div>
            <h2>Launcher Doctor</h2>
            <p>{issues.length === 0 ? "No launcher issues found." : `${issues.length} issue(s) found.`}</p>
          </div>
          <Button variant="secondary" onClick={onRepair}>Repair selected</Button>
        </div>
      </div>
    </>
  );
}

function LauncherForm({
  draft,
  selectedLauncher,
  onChange,
  onSave,
  onDelete,
  onLaunch,
}: {
  draft: LauncherInput;
  selectedLauncher: Launcher | null;
  onChange: (patch: Partial<LauncherInput>) => void;
  onSave: () => void;
  onDelete: () => void;
  onLaunch: () => void;
}) {
  return (
    <div className="form-grid">
      <label>
        <span>Name</span>
        <input value={draft.name} onChange={(event) => onChange({ name: event.target.value })} />
      </label>
      <label>
        <span>Kind</span>
        <select
          value={draft.kind}
          onChange={(event) => onChange({ kind: event.target.value as LauncherKind })}
        >
          <option value="application">Application</option>
          <option value="app_image">AppImage</option>
          <option value="script">Script</option>
          <option value="url">URL</option>
        </select>
      </label>
      <label className="span-two">
        <span>{draft.kind === "url" ? "URL" : "Executable"}</span>
        <input
          value={draft.kind === "url" ? draft.url ?? "" : draft.execPath}
          onChange={(event) =>
            draft.kind === "url"
              ? onChange({ url: event.target.value, execPath: "" })
              : onChange({ execPath: event.target.value, url: null })
          }
        />
      </label>
      <label className="span-two">
        <span>Description</span>
        <input
          value={draft.description}
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </label>
      <label>
        <span>Icon</span>
        <input value={draft.iconPath} onChange={(event) => onChange({ iconPath: event.target.value })} />
      </label>
      <label>
        <span>Categories</span>
        <input
          value={categoriesToInput(draft.categories)}
          onChange={(event) => onChange({ categories: normalizeCategoryInput(event.target.value) })}
        />
      </label>
      <label className="toggle-row">
        <input
          type="checkbox"
          checked={draft.terminal}
          onChange={(event) => onChange({ terminal: event.target.checked })}
        />
        <span>Run in terminal</span>
      </label>
      <div className="action-row span-two">
        <Button onClick={onSave}>
          <Save size={16} />
          {selectedLauncher ? "Save changes" : "Create launcher"}
        </Button>
        <Button variant="secondary" onClick={onLaunch}>
          <Play size={16} />
          Launch
        </Button>
        <Button variant="danger" onClick={onDelete}>
          <Trash2 size={16} />
          Delete
        </Button>
      </div>
    </div>
  );
}

function ToolResultPanel({
  result,
  guidedCommands,
  onScan,
  onPermissionAction,
}: {
  result: ToolResult | null;
  guidedCommands: GuidedCommand[];
  onScan: () => void;
  onPermissionAction?: () => void;
}) {
  return (
    <div className="tool-result-panel">
      <div className="action-row">
        <Button onClick={onScan}>
          <Search size={16} />
          Run scan
        </Button>
        {onPermissionAction ? (
          <Button variant="secondary" onClick={onPermissionAction}>
            <KeyRound size={16} />
            Mark executable
          </Button>
        ) : null}
      </div>
      {result ? (
        <>
          <div className="terminal-card">
            <Terminal size={22} />
            <div>
              <h2>{result.summary}</h2>
              <p>{result.warnings.length === 0 ? "Scan completed without warnings." : `${result.warnings.length} warning(s)`}</p>
            </div>
          </div>
          <ResultMessages result={result} />
          <pre className="data-preview">{JSON.stringify(result.data, null, 2)}</pre>
        </>
      ) : (
        <div className="empty-tool-state">
          <Terminal size={34} />
          <h2>Run a scan to load this tool.</h2>
          <p>Tools are read-first by default. Admin-level changes appear as guided commands, not automatic writes.</p>
        </div>
      )}
      <GuidedCommands commands={guidedCommands} />
    </div>
  );
}

function ResultMessages({ result }: { result: ToolResult }) {
  return (
    <div className="result-messages">
      {result.warnings.map((warning) => (
        <div className="message message-warning" key={warning}>{warning}</div>
      ))}
      {result.repairSuggestions.map((suggestion) => (
        <div className="message message-ok" key={suggestion}>{suggestion}</div>
      ))}
    </div>
  );
}

function GuidedCommands({ commands }: { commands: GuidedCommand[] }) {
  if (commands.length === 0) {
    return null;
  }
  return (
    <section className="guided-commands">
      <h2>Guided commands</h2>
      {commands.map((command) => (
        <div className="guided-command" key={`${command.label}-${command.command}`}>
          <div>
            <strong>{command.label}</strong>
            <span>{command.explanation}</span>
          </div>
          <code>{command.command}</code>
        </div>
      ))}
    </section>
  );
}
