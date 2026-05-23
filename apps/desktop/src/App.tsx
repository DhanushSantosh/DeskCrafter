import {
  Activity,
  AppWindow,
  BadgeCheck,
  FileCode2,
  Globe2,
  Image,
  Package,
  Play,
  RefreshCw,
  Save,
  Search,
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
  toolCatalog,
} from "./lib/launcher";
import type {
  IconResolution,
  InspectTargetResult,
  Launcher,
  LauncherInput,
  LauncherIssue,
  LauncherKind,
  SystemProfile,
  ValidationReport,
} from "./lib/types";
import "./styles.css";

const toolIcons = {
  application: AppWindow,
  app_image: Package,
  script: FileCode2,
  url: Globe2,
  icons: Image,
  doctor: Stethoscope,
};

type ActiveTool = LauncherKind | "icons" | "doctor";

function isLauncherKind(value: ActiveTool): value is LauncherKind {
  return value === "application" || value === "app_image" || value === "script" || value === "url";
}

export default function App() {
  const [activeTool, setActiveTool] = useState<ActiveTool>("application");
  const [profile, setProfile] = useState<SystemProfile | null>(null);
  const [launchers, setLaunchers] = useState<Launcher[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<LauncherInput>(defaultLauncherInput);
  const [validation, setValidation] = useState<ValidationReport | null>(null);
  const [issues, setIssues] = useState<LauncherIssue[]>([]);
  const [iconResolution, setIconResolution] = useState<IconResolution | null>(null);
  const [inspectedTarget, setInspectedTarget] = useState<InspectTargetResult | null>(null);
  const [status, setStatus] = useState("Ready");
  const [targetInput, setTargetInput] = useState("");

  const selectedLauncher = useMemo(
    () => launchers.find((launcher) => launcher.id === selectedId) ?? null,
    [launchers, selectedId]
  );

  const refreshAll = useCallback(async () => {
    setStatus("Refreshing workspace");
    const [systemProfile, launcherList, issueList] = await Promise.all([
      api.getSystemProfile(),
      api.listLaunchers(),
      api.scanLauncherIssues(),
    ]);
    setProfile(systemProfile);
    setLaunchers(launcherList);
    setIssues(issueList);
    setStatus("Workspace refreshed");
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([api.getSystemProfile(), api.listLaunchers(), api.scanLauncherIssues()])
      .then(([systemProfile, launcherList, issueList]) => {
        if (!active) {
          return;
        }
        setProfile(systemProfile);
        setLaunchers(launcherList);
        setIssues(issueList);
        setStatus("Workspace refreshed");
      })
      .catch((error: Error) => {
        if (active) {
          setStatus(error.message);
        }
      });
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

  function handleToolSelect(tool: ActiveTool) {
    setActiveTool(tool);
    if (isLauncherKind(tool)) {
      setDraft((current) => buildLauncherInput(current, { kind: tool }));
    }
  }

  function selectLauncher(launcher: Launcher) {
    setSelectedId(launcher.id);
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
    if (isLauncherKind(launcher.kind)) {
      setActiveTool(launcher.kind);
    }
  }

  async function inspectTarget() {
    if (!targetInput.trim()) {
      setStatus("Enter a path or URL to inspect");
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
    setActiveTool(result.kind);
    setStatus("Target inspected");
  }

  async function saveLauncher() {
    const saved = selectedId
      ? await api.updateLauncher(selectedId, draft)
      : await api.createLauncher(draft);
    setSelectedId(saved.id);
    setStatus(`${saved.name} saved`);
    await refreshAll();
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
    await refreshAll();
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
    await refreshAll();
  }

  const ActiveIcon = toolIcons[activeTool];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">D</div>
          <div>
            <div className="brand-name">DeskCrafter</div>
            <div className="brand-subtitle">Linux Launcher Suite</div>
          </div>
        </div>

        <nav className="tool-nav" aria-label="DeskCrafter tools">
          {toolCatalog.map((tool) => {
            const Icon = toolIcons[tool.id];
            return (
              <button
                key={tool.id}
                className={`tool-button ${activeTool === tool.id ? "tool-button-active" : ""}`}
                onClick={() => handleToolSelect(tool.id)}
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
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <div className="eyebrow">Target directory</div>
            <div className="path-label">{profile?.applicationsDir ?? "Resolving XDG profile"}</div>
          </div>
          <div className="topbar-actions">
            <span className="status-pill">
              <Activity size={14} />
              {status}
            </span>
            <Button variant="secondary" onClick={() => void refreshAll()}>
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
                <h1>{toolCatalog.find((tool) => tool.id === activeTool)?.label}</h1>
                <p>{profile?.distro ?? "Linux"} · {profile?.desktopSession ?? "Desktop session"}</p>
              </div>
            </div>

            <div className="target-row">
              <input
                value={targetInput}
                onChange={(event) => setTargetInput(event.target.value)}
                placeholder="Inspect an AppImage, script path, executable, or https:// URL"
              />
              <Button variant="secondary" onClick={() => void inspectTarget()}>
                <Search size={16} />
                Inspect
              </Button>
            </div>

            {inspectedTarget ? (
              <div className="notice">
                <BadgeCheck size={16} />
                <span>
                  Suggested {inspectedTarget.kind.replace("_", " ")} launcher:
                  {" "}
                  <strong>{inspectedTarget.suggestedName}</strong>
                </span>
              </div>
            ) : null}

            {activeTool === "doctor" ? (
              <DoctorPanel issues={issues} onRepair={() => void repairSelected()} />
            ) : activeTool === "icons" ? (
              <IconPanel resolution={iconResolution} onResolve={() => void resolveIcon()} />
            ) : (
              <LauncherForm
                draft={draft}
                selectedLauncher={selectedLauncher}
                onChange={updateDraft}
                onSave={() => void saveLauncher()}
                onDelete={() => void deleteSelected()}
                onLaunch={() => void launchSelected()}
              />
            )}
          </section>

          <aside className="inspector">
            <div className="inspector-section">
              <h2>Library</h2>
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
              {validation?.valid ? <div className="message message-ok">Ready to save</div> : null}
            </div>

            <div className="inspector-section preview-section">
              <h2>Desktop preview</h2>
              <pre>{validation?.preview || "Complete the form to preview generated launcher content."}</pre>
            </div>
          </aside>
        </div>
      </section>
    </main>
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

function DoctorPanel({ issues, onRepair }: { issues: LauncherIssue[]; onRepair: () => void }) {
  return (
    <div className="doctor-panel">
      <div className="terminal-card">
        <Terminal size={22} />
        <div>
          <h2>Launcher scan</h2>
          <p>{issues.length === 0 ? "No broken user launchers detected." : `${issues.length} issue(s) found.`}</p>
        </div>
      </div>
      <div className="issue-list">
        {issues.map((issue) => (
          <div className={`issue issue-${issue.severity}`} key={`${issue.path}-${issue.message}`}>
            <strong>{issue.severity}</strong>
            <span>{issue.message}</span>
            <small>{issue.path}</small>
          </div>
        ))}
      </div>
      <Button variant="secondary" onClick={onRepair}>
        <Stethoscope size={16} />
        Repair selected launcher
      </Button>
    </div>
  );
}

function IconPanel({
  resolution,
  onResolve,
}: {
  resolution: IconResolution | null;
  onResolve: () => void;
}) {
  return (
    <div className="doctor-panel">
      <div className="terminal-card">
        <Image size={22} />
        <div>
          <h2>Icon resolution</h2>
          <p>Use the Icon field in the launcher form, then resolve it here.</p>
        </div>
      </div>
      <Button variant="secondary" onClick={onResolve}>
        <Search size={16} />
        Resolve icon
      </Button>
      {resolution ? (
        <div className="resolution-box">
          <span>Input: {resolution.input}</span>
          <span>Exists: {resolution.exists ? "yes" : "no"}</span>
          <span>Path: {resolution.resolvedPath ?? "theme name or unresolved"}</span>
        </div>
      ) : null}
    </div>
  );
}
