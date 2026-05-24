import {
  Activity,
  AppWindow,
  BadgeCheck,
  Boxes,
  Fingerprint,
  FolderCog,
  Gauge,
  Image,
  Link2,
  Package,
  Play,
  RefreshCw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
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
  ToolActionDescriptor,
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
  associations: "Associations",
  sandboxes: "Sandboxes",
  permissions: "Permissions",
  advanced: "Advanced",
};

const categoryIcons = {
  launchers: AppWindow,
  startup: Gauge,
  apps: Package,
  associations: Link2,
  sandboxes: ShieldCheck,
  permissions: Fingerprint,
  advanced: Settings2,
};

const toolIcons: Record<string, typeof AppWindow> = {
  launcher_repair_integrator: AppWindow,
  portable_app_integrator: Package,
  autostart_actions: Gauge,
  default_apps_mime_manager: Link2,
  flatpak_permissions_manager: ShieldCheck,
  permission_ownership_repair: Fingerprint,
  service_actions: Terminal,
  system_profile: Boxes,
};

const launcherToolId = "launcher_repair_integrator";

const toolInputConfig: Record<
  string,
  {
    pathLabel: string;
    pathPlaceholder: string;
    valueLabel: string;
    valuePlaceholder: string;
  }
> = {
  launcher_repair_integrator: {
    pathLabel: "Inspect target",
    pathPlaceholder: "Path to AppImage, script, executable, or https:// URL",
    valueLabel: "Selected launcher id",
    valuePlaceholder: "Uses the selected launcher when available",
  },
  portable_app_integrator: {
    pathLabel: "Portable target",
    pathPlaceholder: "/home/dhanush/Downloads/MyApp.AppImage",
    valueLabel: "Launcher id",
    valuePlaceholder: "Used for remove integration",
  },
  autostart_actions: {
    pathLabel: "Autostart path or target",
    pathPlaceholder: "~/.config/autostart/example.desktop",
    valueLabel: "Launcher id or new file name",
    valuePlaceholder: "Selected launcher id or copied desktop file name",
  },
  default_apps_mime_manager: {
    pathLabel: "MIME type",
    pathPlaceholder: "application/pdf or x-scheme-handler/https",
    valueLabel: "Desktop file id",
    valuePlaceholder: "org.mozilla.firefox.desktop",
  },
  flatpak_permissions_manager: {
    pathLabel: "Flatpak app id",
    pathPlaceholder: "org.mozilla.firefox",
    valueLabel: "Filesystem path",
    valuePlaceholder: "/home/dhanush/Documents",
  },
  permission_ownership_repair: {
    pathLabel: "Path to repair",
    pathPlaceholder: "~/.local/share/applications",
    valueLabel: "Optional value",
    valuePlaceholder: "Unused for current actions",
  },
  service_actions: {
    pathLabel: "Service name",
    pathPlaceholder: "pipewire.service",
    valueLabel: "Optional value",
    valuePlaceholder: "Unused for current actions",
  },
  system_profile: {
    pathLabel: "Optional query",
    pathPlaceholder: "Leave empty to scan the current system",
    valueLabel: "Optional value",
    valuePlaceholder: "Unused for current actions",
  },
};

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
  const [actionValue, setActionValue] = useState("");
  const [secondaryValue, setSecondaryValue] = useState("");
  const [allowElevation, setAllowElevation] = useState(true);

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

  const inputConfig = activeTool ? toolInputConfig[activeTool.id] ?? toolInputConfig.system_profile : toolInputConfig.system_profile;

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
      targetId: selectedId,
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

  async function runPrimaryAction(tool: ToolDefinition, descriptor: ToolActionDescriptor) {
    if (descriptor.kind === "scan") {
      await scanTool(tool.id);
      return;
    }

    const input = {
      action: descriptor.id,
      path: targetInput || null,
      query: targetInput || null,
      targetId: selectedId,
      value: actionValue || selectedId || null,
      secondaryValue: secondaryValue || null,
      allowElevation,
    };

    const validationResult = await api.validateToolAction(tool.id, input);
    setToolResult(validationResult);
    setGuidedCommands(validationResult.guidedCommands);
    if (validationResult.blockingIssues.length > 0) {
      setStatus("Action blocked");
      return;
    }

    const applied = await api.applyToolAction(tool.id, input);
    setToolResult(applied);
    setGuidedCommands(applied.guidedCommands);
    setStatus(applied.summary);
    await refreshSuite(false);
  }

  const ActiveIcon = activeTool ? toolIcons[activeTool.id] ?? Activity : Activity;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img className="brand-logo" src="/icon.png" alt="" aria-hidden="true" />
          <div>
            <div className="brand-name">DeskCrafter</div>
            <div className="brand-subtitle">Desktop Repair Suite</div>
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
                <h1>{activeTool?.label ?? "DeskCrafter"}</h1>
                <p>{activeTool?.description ?? "Loading suite registry"}</p>
              </div>
            </div>

            <div className="target-row">
              <input
                value={targetInput}
                onChange={(event) => setTargetInput(event.target.value)}
                placeholder={inputConfig.pathPlaceholder}
              />
              <Button variant="secondary" onClick={() => void inspectTarget()}>
                <Search size={16} />
                {activeToolId === launcherToolId ? "Inspect" : "Scan"}
              </Button>
            </div>

            <div className="action-grid">
              <label>
                <span>{inputConfig.valueLabel}</span>
                <input
                  value={actionValue}
                  onChange={(event) => setActionValue(event.target.value)}
                  placeholder={inputConfig.valuePlaceholder}
                />
              </label>
              <label>
                <span>Secondary value</span>
                <input
                  value={secondaryValue}
                  onChange={(event) => setSecondaryValue(event.target.value)}
                  placeholder="Optional extra value"
                />
              </label>
              <label className="toggle-row">
                <input
                  checked={allowElevation}
                  onChange={(event) => setAllowElevation(event.target.checked)}
                  type="checkbox"
                />
                <span>Allow elevated actions</span>
              </label>
            </div>

            {activeTool ? <ToolMeta tool={activeTool} /> : null}

            {activeToolId === launcherToolId ? (
              <LauncherModule
                draft={draft}
                selectedLauncher={selectedLauncher}
                inspectedTarget={inspectedTarget}
                iconResolution={iconResolution}
                issues={issues}
                actions={activeTool?.primaryActions ?? []}
                onChange={updateDraft}
                onSave={() => void saveLauncher()}
                onDelete={() => void deleteSelected()}
                onLaunch={() => void launchSelected()}
                onResolveIcon={() => void resolveIcon()}
                onRepair={() => void repairSelected()}
                onPrimaryAction={(actionDescriptor) => {
                  if (!activeTool) {
                    return;
                  }
                  void runPrimaryAction(activeTool, actionDescriptor);
                }}
              />
            ) : (
              <ActionWorkspace
                tool={activeTool}
                selectedLauncher={selectedLauncher}
                onAction={(actionDescriptor) => {
                  if (!activeTool) {
                    return;
                  }
                  void runPrimaryAction(activeTool, actionDescriptor);
                }}
                result={toolResult}
                guidedCommands={guidedCommands}
              />
            )}
          </section>

          <aside className="inspector">
            <div className="inspector-section">
              <h2>Tool status</h2>
              {activeTool ? (
                <>
                  <div className="message message-ok">
                    {activeTool.privilegeLevel.replaceAll("_", " ")} · {activeTool.elevationMode}
                  </div>
                  <p className="empty-state">
                    Targets: {activeTool.desktopTargets.join(", ")} · {activeTool.reversible ? "reversible" : "read-only"}
                  </p>
                </>
              ) : null}
            </div>

            <div className="inspector-section">
              <h2>Primary actions</h2>
              {activeTool?.primaryActions.map((actionDescriptor) => (
                <div className="capability-pill" key={actionDescriptor.id}>
                  {actionDescriptor.label}
                </div>
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
                <div className="message message-error" key={error}>
                  {error}
                </div>
              ))}
              {validation?.warnings.map((warning) => (
                <div className="message message-warning" key={warning}>
                  {warning}
                </div>
              ))}
              {validation?.valid ? <div className="message message-ok">Launcher ready to save</div> : null}
            </div>

            <div className="inspector-section preview-section">
              <h2>Desktop preview</h2>
              <pre>{validation?.preview || "Open Launcher Repair & Integrator to preview desktop entries."}</pre>
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
        {categoryLabels[tool.category]} · {tool.supportedDistros.join(", ")} · {tool.primaryActions.length} action(s)
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
  actions,
  onChange,
  onSave,
  onDelete,
  onLaunch,
  onResolveIcon,
  onRepair,
  onPrimaryAction,
}: {
  draft: LauncherInput;
  selectedLauncher: Launcher | null;
  inspectedTarget: InspectTargetResult | null;
  iconResolution: IconResolution | null;
  issues: LauncherIssue[];
  actions: ToolActionDescriptor[];
  onChange: (patch: Partial<LauncherInput>) => void;
  onSave: () => void;
  onDelete: () => void;
  onLaunch: () => void;
  onResolveIcon: () => void;
  onRepair: () => void;
  onPrimaryAction: (actionDescriptor: ToolActionDescriptor) => void;
}) {
  return (
    <>
      {inspectedTarget ? (
        <div className="notice">
          <Sparkles size={16} />
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
            <p>
              {iconResolution
                ? iconResolution.resolvedPath ?? iconResolution.themeName ?? "unresolved"
                : "Resolve the icon field when needed."}
            </p>
          </div>
          <Button variant="secondary" onClick={onResolveIcon}>
            Resolve
          </Button>
        </div>
        <div className="terminal-card">
          <Stethoscope size={22} />
          <div>
            <h2>Launcher doctor</h2>
            <p>{issues.length === 0 ? "No launcher issues found." : `${issues.length} issue(s) found.`}</p>
          </div>
          <Button variant="secondary" onClick={onRepair}>
            Repair selected
          </Button>
        </div>
      </div>
      <div className="action-strip">
        {actions.map((actionDescriptor) => (
          <Button key={actionDescriptor.id} variant="secondary" onClick={() => onPrimaryAction(actionDescriptor)}>
            {actionDescriptor.label}
          </Button>
        ))}
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
        <select value={draft.kind} onChange={(event) => onChange({ kind: event.target.value as LauncherKind })}>
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
        <input value={draft.description} onChange={(event) => onChange({ description: event.target.value })} />
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
      <label className="toggle-row span-two">
        <input checked={draft.terminal} onChange={(event) => onChange({ terminal: event.target.checked })} type="checkbox" />
        <span>Launch in terminal</span>
      </label>
      <div className="action-row span-two">
        <Button onClick={onSave}>
          <Save size={16} />
          {selectedLauncher ? "Update launcher" : "Create launcher"}
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

function ActionWorkspace({
  tool,
  selectedLauncher,
  onAction,
  result,
  guidedCommands,
}: {
  tool: ToolDefinition | null;
  selectedLauncher: Launcher | null;
  onAction: (actionDescriptor: ToolActionDescriptor) => void;
  result: ToolResult | null;
  guidedCommands: GuidedCommand[];
}) {
  if (!tool) {
    return null;
  }

  return (
    <div className="tool-result-panel">
      <div className="notice">
        <FolderCog size={16} />
        <span>
          {selectedLauncher ? `Selected launcher context: ${selectedLauncher.name}` : "Actions can run with or without a selected launcher context."}
        </span>
      </div>
      <div className="action-strip">
        {tool.primaryActions.map((actionDescriptor) => (
          <Button key={actionDescriptor.id} variant="secondary" onClick={() => onAction(actionDescriptor)}>
            {actionDescriptor.label}
          </Button>
        ))}
      </div>
      <ToolResultPanel result={result} guidedCommands={guidedCommands} />
    </div>
  );
}

function ToolResultPanel({
  result,
  guidedCommands,
}: {
  result: ToolResult | null;
  guidedCommands: GuidedCommand[];
}) {
  if (!result) {
    return (
      <div className="empty-tool-state">
        <h2>Action-first workflow</h2>
        <p>Scan the current tool or run one of its actions to see blocking issues, performed steps, and refresh requirements.</p>
      </div>
    );
  }

  return (
    <>
      <ResultMessages label="Warnings" tone="warning" messages={result.warnings} />
      <ResultMessages label="Blocking issues" tone="error" messages={result.blockingIssues} />
      <ResultMessages label="Performed" tone="ok" messages={result.performedActions} />
      <ResultMessages label="Refresh needed" tone="warning" messages={result.restartOrRefreshNeeded} />
      {result.beforeAfterState ? (
        <div>
          <h2 className="compact-heading">Before / after</h2>
          <pre className="data-preview">{JSON.stringify(result.beforeAfterState, null, 2)}</pre>
        </div>
      ) : null}
      <div>
        <h2 className="compact-heading">Result data</h2>
        <pre className="data-preview">{JSON.stringify(result.data, null, 2)}</pre>
      </div>
      {guidedCommands.length > 0 ? <GuidedCommands commands={guidedCommands} /> : null}
    </>
  );
}

function ResultMessages({
  label,
  tone,
  messages,
}: {
  label: string;
  tone: "error" | "warning" | "ok";
  messages: string[];
}) {
  if (messages.length === 0) {
    return null;
  }
  return (
    <div>
      <h2 className="compact-heading">{label}</h2>
      {messages.map((message) => (
        <div className={`message message-${tone}`} key={message}>
          {message}
        </div>
      ))}
    </div>
  );
}

function GuidedCommands({ commands }: { commands: GuidedCommand[] }) {
  return (
    <div className="guided-commands">
      <h2>Guided commands</h2>
      {commands.map((command) => (
        <div className="guided-command" key={`${command.label}-${command.command}`}>
          <div>
            <strong>{command.label}</strong>
            <span>{command.explanation}</span>
          </div>
          <div className="message message-warning">{command.privilegeLevel.replaceAll("_", " ")}</div>
          <code>{command.command}</code>
        </div>
      ))}
    </div>
  );
}
