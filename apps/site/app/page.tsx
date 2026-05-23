'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Download,
  Github,
  MonitorCog,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Button } from "../components/Button";
import { bentoFeatures, primaryFeatures, principles, siteConfig, toolDefinitions } from "../lib/site-content";

export default function HomePage() {
  const [selectedToolId, setSelectedToolId] = useState("launcher_manager");
  const [targetPath, setTargetPath] = useState("~/.local/share/applications");
  const [scanScope, setScanScope] = useState("User-owned paths");
  const [safetyMode, setSafetyMode] = useState("Read first");
  const [simTab, setSimTab] = useState<"code" | "mock">("code");
  const [compileState, setCompileState] = useState<"idle" | "compiling" | "success">("idle");
  const [compileLog, setCompileLog] = useState("");

  // Doctor States
  const [docState, setDocState] = useState<"idle" | "scanning" | "scanned" | "repairing" | "repaired">("idle");
  const [docLogs, setDocLogs] = useState<Array<{ type: "info" | "warn" | "err" | "ok" | "success" | "head"; text: string }>>([
    { type: "head", text: "DeskCrafter Suite Scan v0.1.0" },
    { type: "info", text: "Registry scanner ready. Press 'Run Suite Scan' to inspect Linux tool modules." }
  ]);

  // Scroll State for Floating Pill Navbar
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Compile simulator action
  const handleCompile = (e: React.FormEvent) => {
    e.preventDefault();
    if (compileState !== "idle") return;

    setCompileState("compiling");
    setCompileLog("Loading tool registry contract...");

    setTimeout(() => {
      setCompileLog("Checking read/write boundary for selected module...");
    }, 400);

    setTimeout(() => {
      setCompileLog("Preparing safe action plan for Linux desktop paths...");
    }, 800);

    setTimeout(() => {
      setCompileState("success");
      setCompileLog(`Ready: ${selectedToolId} plan prepared without automatic admin changes.`);
    }, 1200);
  };

  const resetCompile = () => {
    setCompileState("idle");
    setCompileLog("");
  };

  // Diagnostic Doctor Simulator action
  const runDiagnostics = () => {
    setDocState("scanning");
    setDocLogs([
      { type: "head", text: "DeskCrafter Suite Scan v0.1.0" },
      { type: "info", text: "Scanning launcher, autostart, PATH, service, cache, permissions, and profile modules..." }
    ]);

    setTimeout(() => {
      setDocLogs(prev => [
        ...prev,
        { type: "info", text: "Read 8 tool manifests and mapped user-owned XDG locations." },
        { type: "warn", text: "PATH contains duplicate ~/.local/bin entry in two shell profiles." }
      ]);
    }, 300);

    setTimeout(() => {
      setDocLogs(prev => [
        ...prev,
        { type: "err", text: "AppImage launcher target is missing: /opt/Cursor/cursor.AppImage" },
        { type: "warn", text: "Cache inspector found 1.8 GB of reviewable user cache; cleanup not automatic." }
      ]);
    }, 650);

    setTimeout(() => {
      setDocState("scanned");
      setDocLogs(prev => [
        ...prev,
        { type: "head", text: "Suite Scan Finished: Found 1 critical issue and 2 guided findings." }
      ]);
    }, 1000);
  };

  const runRepair = () => {
    setDocState("repairing");
    setDocLogs(prev => [
      ...prev,
      { type: "info", text: "Preparing guided fixes. No privileged operation will run automatically." }
    ]);

    setTimeout(() => {
      setDocLogs(prev => [
        ...prev,
        { type: "ok", text: "Queued launcher metadata repair in user-owned applications directory." },
        { type: "ok", text: "Generated copyable systemctl command for service follow-up." }
      ]);
    }, 400);

    setTimeout(() => {
      setDocLogs(prev => [
        ...prev,
        { type: "ok", text: "Prepared PATH profile suggestion and cache review command." }
      ]);
    }, 800);

    setTimeout(() => {
      setDocState("repaired");
      setDocLogs(prev => [
        ...prev,
        { type: "success", text: "Success: Safe actions prepared; no admin changes were applied automatically." }
      ]);
    }, 1200);
  };

  const selectedTool = toolDefinitions.find((tool) => tool.id === selectedToolId) ?? toolDefinitions[0];
  const SelectedToolIcon = selectedTool.icon;

  return (
    <main>
      <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
        <div className="site-header-inner">
          <a className="brand" href="#top" aria-label="DeskCrafter home">
            <Image src="/logo.png" alt="DeskCrafter Logo" width={28} height={28} className="brand-logo" priority />
            <span>DeskCrafter</span>
          </a>
          <nav aria-label="Primary navigation">
            <a href="#features">Features</a>
            <a href="#linux">Architecture</a>
            <a href="#download">Download</a>
          </nav>
          <a className="github-link" href={siteConfig.githubUrl} target="_blank" rel="noopener noreferrer">
            <Github size={16} />
            GitHub
          </a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="badge animate-float">
            <Sparkles size={12} />
            <span>Open Source Linux tools v0.1.0</span>
          </div>
          <h1>{siteConfig.name}</h1>
          <p>{siteConfig.tagline}</p>
          <div className="hero-actions">
            <Button href="#download">
              <Download size={16} />
              Download CLI & App
              <ArrowRight size={15} />
            </Button>
            <Button href="#features" variant="secondary">
              Explore Features
            </Button>
          </div>
        </div>

        {/* Interactive Workspace Simulator Container */}
        <div className="simulator-container glass-panel">
          <div className="simulator-header">
            <div className="window-controls">
              <span className="window-dot red" />
              <span className="window-dot yellow" />
              <span className="window-dot green" />
            </div>
            <div className="window-title">tool-registry ~ DeskCrafter</div>
            <div className="window-spacer" />
          </div>

          <div className="simulator-grid">
            <form className="simulator-form" onSubmit={handleCompile} onChange={resetCompile}>
              <div className="form-group">
                <label htmlFor="tool-id-select">Tool Module</label>
                <select
                  id="tool-id-select"
                  value={selectedToolId}
                  onChange={(event) => setSelectedToolId(event.target.value)}
                >
                  {toolDefinitions.map((tool) => (
                    <option key={tool.id} value={tool.id}>
                      {tool.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="target-path-input">Target Path</label>
                <input
                  id="target-path-input"
                  type="text"
                  value={targetPath}
                  onChange={(e) => setTargetPath(e.target.value)}
                  placeholder="~/.local/share/applications"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="scan-scope-input">Scan Scope</label>
                <input
                  id="scan-scope-input"
                  type="text"
                  value={scanScope}
                  onChange={(e) => setScanScope(e.target.value)}
                  placeholder="User-owned paths"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="safety-mode-select">Safety Mode</label>
                <select
                  id="safety-mode-select"
                  value={safetyMode}
                  onChange={(e) => setSafetyMode(e.target.value)}
                >
                  <option value="Read first">Read first</option>
                  <option value="User-owned writes">User-owned writes</option>
                  <option value="Guided admin commands">Guided admin commands</option>
                  <option value="Inspection only">Inspection only</option>
                </select>
              </div>

              <button
                id="compile-submit-button"
                type="submit"
                className="button button-primary compile-btn-full"
                disabled={compileState === "compiling"}
              >
                <MonitorCog size={16} />
                {compileState === "compiling" ? "Preparing..." : "Prepare Tool Plan"}
              </button>
            </form>

            <div className="simulator-preview">
              <div className="sim-tabs">
                <button
                  id="tab-code-btn"
                  type="button"
                  className={`sim-tab-btn ${simTab === "code" ? "active" : ""}`}
                  onClick={() => setSimTab("code")}
                >
                  registry.toml
                </button>
                <button
                  id="tab-mock-btn"
                  type="button"
                  className={`sim-tab-btn ${simTab === "mock" ? "active" : ""}`}
                  onClick={() => setSimTab("mock")}
                >
                  Tool Preview
                </button>
              </div>

              {simTab === "code" ? (
                <div className="code-editor">
                  <span className="code-header-line">[tool]</span>{"\n"}
                  <span className="code-key">id</span>=<span className="code-value">&quot;{selectedTool.id}&quot;</span>{"\n"}
                  <span className="code-key">name</span>=<span className="code-value">&quot;{selectedTool.title}&quot;</span>{"\n"}
                  <span className="code-key">category</span>=<span className="code-value">&quot;{selectedTool.category}&quot;</span>{"\n"}
                  <span className="code-key">risk</span>=<span className="code-value">&quot;{selectedTool.risk}&quot;</span>{"\n"}
                  <span className="code-key">target</span>=<span className="code-value">&quot;{targetPath}&quot;</span>{"\n"}
                  <span className="code-key">scope</span>=<span className="code-value">&quot;{scanScope}&quot;</span>{"\n"}
                  <span className="code-key">mode</span>=<span className="code-value">&quot;{safetyMode}&quot;</span>{"\n"}
                  <span className="code-comment"># Tool Registry Console: scan first, write only when explicit</span>
                </div>
              ) : (
                <div className="desktop-preview-pane">
                  <div className="registry-preview-card">
                    <div className="registry-preview-icon">
                      <SelectedToolIcon size={30} />
                    </div>
                    <div>
                      <span className="registry-preview-kicker">{selectedTool.id}</span>
                      <strong>{selectedTool.title}</strong>
                      <p>{selectedTool.description}</p>
                    </div>
                    <div className="registry-pill-row">
                      <span>{selectedTool.category}</span>
                      <span>{selectedTool.risk}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="compile-console">
                {compileState === "compiling" && (
                  <>
                    <span className="console-spinner" />
                    <span>{compileLog}</span>
                  </>
                )}
                {compileState === "success" && (
                  <>
                    <CheckCircle size={14} className="console-success" />
                    <span className="console-success">{compileLog}</span>
                  </>
                )}
                {compileState === "idle" && (
                  <span className="compile-console-idle">Click Prepare Tool Plan to generate safe registry actions</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ecosystem-strip" aria-label="Supported Ecosystems">
        <div className="ecosystem-inner">
          <div className="ecosystem-title">Supports standard Linux desktop environments</div>
          <div className="ecosystem-logos">
            <div className="ecosystem-item">GNOME</div>
            <div className="ecosystem-item">KDE Plasma</div>
            <div className="ecosystem-item">Xfce</div>
            <div className="ecosystem-item">Cinnamon</div>
            <div className="ecosystem-item">MATE</div>
          </div>
        </div>
      </section>

      {/* Feature Splits */}
      <section className="section" id="features">
        <div className="feature-splits">
          {/* Split 1 */}
          <div className="feature-split">
            <div className="feature-split-content">
              <div className="feature-icon-wrapper">
                {React.createElement(primaryFeatures[0].icon, { size: 20 })}
              </div>
              <h2>{primaryFeatures[0].title}</h2>
              <p>
                {primaryFeatures[0].description} It validates generated entries, flags missing targets, and keeps launcher writes inside explicit user-owned paths.
              </p>
            </div>
            <div className="feature-split-visual">
              <div className="concept-window glass-panel">
                <div className="simulator-header">
                  <div className="window-controls">
                    <span className="window-dot red" />
                    <span className="window-dot yellow" />
                    <span className="window-dot green" />
                  </div>
                  <div className="window-title">launcher-manager.visual</div>
                </div>
                <div className="concept-body-mini">
                  <div className="concept-line pulse-line" style={{ width: "90%" }} />
                  <div className="concept-line" style={{ width: "70%" }} />
                  <div className="concept-line" style={{ width: "80%" }} />
                  <div className="concept-line" style={{ width: "50%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Split 2 */}
          <div className="feature-split reversed">
            <div className="feature-split-content">
              <div className="feature-icon-wrapper">
                {React.createElement(primaryFeatures[1].icon, { size: 20 })}
              </div>
              <h2>{primaryFeatures[1].title}</h2>
              <p>
                {primaryFeatures[1].description} Service and admin-facing surfaces stay read-first, with guided commands instead of automatic escalation.
              </p>
            </div>
            <div className="feature-split-visual">
              <div className="concept-window glass-panel">
                <div className="simulator-header">
                  <div className="window-controls">
                    <span className="window-dot red" />
                    <span className="window-dot yellow" />
                    <span className="window-dot green" />
                  </div>
                  <div className="window-title">profile-autostart.scan</div>
                </div>
                <div className="concept-body-mini">
                  <div className="concept-line concept-line-accent" style={{ width: "40%" }} />
                  <div className="concept-line pulse-line" style={{ width: "85%" }} />
                  <div className="concept-line" style={{ width: "60%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid section */}
      <section className="section bento-section">
        <div className="section-heading centered">
          <span className="eyebrow">Expanded Tool Suite</span>
          <h2>One registry for the Linux desktop work you actually repeat.</h2>
        </div>
        <div className="bento-grid">
          {bentoFeatures.map((feature, index) => {
            const FeatureIcon = feature.icon;
            return (
              <article key={feature.id} className={index === 0 || index === 5 ? "bento-item bento-large" : "bento-item"}>
                <div className="bento-icon">
                  <FeatureIcon size={20} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>

                <div className="bento-widget">
                  <div className="widget-terminal">
                    <div><span className="line-in">$</span> deskcrafter tools inspect {feature.id}</div>
                    <div><span className="line-out">[CATEGORY]</span> {feature.category}</div>
                    <div><span className="line-out">[BOUNDARY]</span> {feature.risk}</div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Linux Architecture & Live Doctor scan simulator */}
      <section className="split-section" id="linux">
        <div>
          <span className="eyebrow">Linux Integration</span>
          <h2>Secure Tauri backend runtime with read-first Linux diagnostics.</h2>
           <p className="section-body-text">
            DeskCrafter reads broadly and writes narrowly. Launcher and permission helpers can act on explicit user-owned paths, while services and cache cleanup remain inspection-first with guided follow-up commands.
          </p>
          <div className="principle-list">
            {principles.map((principle) => {
              const PrincipleIcon = principle.icon;
              return (
                <div className="principle" key={principle.title}>
                  <PrincipleIcon size={18} />
                  <div>
                    <strong>{principle.title}</strong>
                    <span>{principle.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Doctor Diagnostics UI Simulator Console */}
        <div className="doctor-dashboard">
          <div className="glass-panel">
            <div className="simulator-header">
              <div className="window-controls">
                <span className="window-dot red" />
                <span className="window-dot yellow" />
                <span className="window-dot green" />
              </div>
              <div className="window-title">suite-scan ~ registry</div>
              <div className="window-spacer" />
            </div>

            <div className="doc-btn-container">
              {docState === "idle" && (
                <button id="run-diagnostics-btn" className="doc-btn" onClick={runDiagnostics}>
                  <Play size={11} />
                  Run Suite Scan
                </button>
              )}
              {docState === "scanning" && (
                <span className="doc-btn doc-btn-disabled">
                  <span className="console-spinner" />
                  Scanning...
                </span>
              )}
              {docState === "scanned" && (
                <button id="run-repair-btn" className="doc-btn doc-btn-repair" onClick={runRepair}>
                  <RotateCcw size={11} />
                  Prepare Guided Fixes
                </button>
              )}
              {docState === "repairing" && (
                <span className="doc-btn doc-btn-disabled">
                  <span className="console-spinner" />
                  Preparing...
                </span>
              )}
              {docState === "repaired" && (
                <span className="doc-btn doc-btn-repaired">
                  <CheckCircle size={11} />
                  Actions Prepared
                </span>
              )}
            </div>

            <div className="doctor-console-body">
              {docLogs.map((log, index) => {
                if (log.type === "head") {
                  return (
                    <div key={index} className="doctor-line head">
                      <span>{log.text}</span>
                    </div>
                  );
                }

                let icon = null;
                let badgeClass = "";
                let badgeText = "";
                let lineClass = "";

                if (log.type === "info") {
                  badgeClass = "ok";
                  badgeText = "INFO";
                } else if (log.type === "warn") {
                  badgeClass = "warn";
                  badgeText = "WARN";
                  lineClass = "warn";
                  icon = <AlertTriangle size={12} />;
                } else if (log.type === "err") {
                  badgeClass = "err";
                  badgeText = "ERR";
                  lineClass = "err";
                  icon = <XCircle size={12} />;
                } else if (log.type === "ok") {
                  badgeClass = "ok";
                  badgeText = "OK";
                  lineClass = "ok";
                  icon = <CheckCircle size={12} />;
                } else if (log.type === "success") {
                  badgeClass = "ok";
                  badgeText = "SUCCESS";
                  lineClass = "ok";
                  icon = <CheckCircle size={12} />;
                }

                return (
                  <div key={index} className={`doctor-line ${lineClass}`}>
                    <span className={`doctor-badge ${badgeClass}`}>{badgeText}</span>
                    {icon}
                    <span>{log.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="section" id="download">
        <div className="cta-card">
          <div className="cta-content">
            <MonitorCog size={30} className="cta-icon" />
            <h2>Ready to inspect your Linux desktop toolchain?</h2>
            <p>
              Manage launchers and autostart, inspect AppImages, PATH, services, cache, permissions, and system profile checks from one local-first workspace.
            </p>
            <div className="cta-actions">
              <Button href={siteConfig.githubUrl}>
                <Github size={16} />
                View Source
              </Button>
              <Button href="https://github.com/DhanushSantosh/DeskCrafter/releases" variant="secondary">
                View Releases
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-content">
            <div className="footer-brand">
              <Image src="/logo.png" alt="DeskCrafter Logo" width={22} height={22} className="brand-logo-small" />
              <strong>DeskCrafter</strong>
            </div>
            <div className="footer-links">
              <a href={siteConfig.githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://github.com/DhanushSantosh/DeskCrafter/releases" target="_blank" rel="noopener noreferrer">Releases</a>
              <a href="https://github.com/DhanushSantosh/DeskCrafter/issues" target="_blank" rel="noopener noreferrer">Issues</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>DeskCrafter: Standalone Linux desktop tools suite built for read-first diagnostics and user-owned launcher workflows.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
