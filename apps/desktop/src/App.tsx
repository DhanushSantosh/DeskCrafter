import {
  Activity,
  AppWindow,
  Boxes,
  Fingerprint,
  Gauge,
  Link2,
  Package,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { ActionWorkspace } from "./components/ActionWorkspace";
import { Button } from "./components/Button";
import { LauncherModule } from "./components/LauncherModule";
import { ToolMeta } from "./components/ToolMeta";
import { useLauncherForm } from "./hooks/useLauncherForm";
import { useLauncherLibrary } from "./hooks/useLauncherLibrary";
import { useSuiteLoader } from "./hooks/useSuiteLoader";
import { useToolWorkspace } from "./hooks/useToolWorkspace";
import { buildLauncherInput, defaultLauncherInput } from "./lib/launcher";
import { api } from "./lib/api";
import type { Launcher, ToolCategory } from "./lib/types";
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

export default function App() {
  const { profile, tools, launchers, issues, status, setStatus, refreshSuite } = useSuiteLoader();

  const { selectedId, setSelectedId, selectedLauncher, launchSelected } = useLauncherLibrary({
    launchers,
    setStatus,
  });

  const { draft, setDraft, validation, iconResolution, inspectedTarget, updateDraft, saveLauncher, resolveIcon, inspectTarget } =
    useLauncherForm({ selectedId, setSelectedId, setStatus, refreshSuite });

  const {
    activeToolId,
    setActiveToolId,
    targetInput,
    setTargetInput,
    actionValue,
    setActionValue,
    secondaryValue,
    setSecondaryValue,
    allowElevation,
    setAllowElevation,
    toolResult,
    guidedCommands,
    activeTool,
    groupedTools,
    scanTool,
    selectTool,
    runPrimaryAction,
  } = useToolWorkspace({ tools, selectedId, setStatus, refreshSuite });

  // Cross-hook operations that span multiple state domains
  function selectLauncher(launcher: Launcher) {
    setSelectedId(launcher.id);
    setActiveToolId(launcherToolId);
    setDraft(
      buildLauncherInput(defaultLauncherInput, {
        name: launcher.name,
        description: launcher.description,
        execPath: launcher.execPath,
        iconPath: launcher.iconPath,
        categories: launcher.categories,
        terminal: launcher.terminal,
        kind: launcher.kind,
        url: launcher.url ?? null,
      })
    );
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

  async function handleInspect() {
    if (!targetInput.trim()) {
      setStatus("Enter a path or URL to inspect");
      return;
    }
    if (activeToolId !== launcherToolId) {
      await scanTool(activeToolId);
      return;
    }
    await inspectTarget(targetInput);
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
                placeholder={activeTool?.pathInputPlaceholder ?? ""}
              />
              <Button variant="secondary" onClick={() => void handleInspect()}>
                <Search size={16} />
                {activeToolId === launcherToolId ? "Inspect" : "Scan"}
              </Button>
            </div>

            <div className="action-grid">
              <label>
                <span>{activeTool?.valueInputLabel ?? "Value"}</span>
                <input
                  value={actionValue}
                  onChange={(event) => setActionValue(event.target.value)}
                  placeholder={activeTool?.valueInputPlaceholder ?? ""}
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
                  if (!activeTool) return;
                  void runPrimaryAction(activeTool, actionDescriptor);
                }}
              />
            ) : (
              <ActionWorkspace
                tool={activeTool}
                selectedLauncher={selectedLauncher}
                onAction={(actionDescriptor) => {
                  if (!activeTool) return;
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
                    Targets: {activeTool.desktopTargets.join(", ")} ·{" "}
                    {activeTool.reversible ? "reversible" : "read-only"}
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
              <pre>
                {validation?.preview ||
                  "Open Launcher Repair & Integrator to preview desktop entries."}
              </pre>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
