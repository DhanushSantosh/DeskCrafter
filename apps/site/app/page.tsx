'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Download,
  Github,
  MonitorCog,
  Sparkles,
  AppWindow,
  Package,
  Terminal as TerminalIcon,
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  Globe2,
  FileCode2,
  Image as ImageIcon,
  Stethoscope,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import { Button } from "../components/Button";
import { siteConfig } from "../lib/site-content";

export default function HomePage() {
  // Simulator States
  const [appName, setAppName] = useState("Zen Browser");
  const [execPath, setExecPath] = useState("/opt/zen/zen-browser");
  const [iconName, setIconName] = useState("zen-browser");
  const [category, setCategory] = useState("Network;WebBrowser;");
  const [simTab, setSimTab] = useState<"code" | "mock">("code");
  const [compileState, setCompileState] = useState<"idle" | "compiling" | "success">("idle");
  const [compileLog, setCompileLog] = useState("");

  // Doctor States
  const [docState, setDocState] = useState<"idle" | "scanning" | "scanned" | "repairing" | "repaired">("idle");
  const [docLogs, setDocLogs] = useState<Array<{ type: "info" | "warn" | "err" | "ok" | "success" | "head"; text: string }>>([
    { type: "head", text: "DeskCrafter Doctor v0.1.0" },
    { type: "info", text: "Diagnostic scanner ready. Press 'Run Diagnostics' to begin checks." }
  ]);

  // Icon Resolver Widget States
  const [searchQuery, setSearchQuery] = useState("firefox");

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
    setCompileLog("Building launcher package...");

    setTimeout(() => {
      setCompileLog("Validating desktop entry standards...");
    }, 400);

    setTimeout(() => {
      setCompileLog("Writing launcher to local standard XDG folder...");
    }, 800);

    setTimeout(() => {
      setCompileState("success");
      setCompileLog("Success: Created launcher at ~/.local/share/applications/zen-browser.desktop");
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
      { type: "head", text: "DeskCrafter Doctor v0.1.0" },
      { type: "info", text: "Initializing diagnostic scan of ~/.local/share/applications/..." }
    ]);

    setTimeout(() => {
      setDocLogs(prev => [
        ...prev,
        { type: "info", text: "Scanning 24 active launcher files..." },
        { type: "warn", text: "Duplicate launcher: Discord.desktop & discord-flatpak.desktop" }
      ]);
    }, 300);

    setTimeout(() => {
      setDocLogs(prev => [
        ...prev,
        { type: "err", text: "Broken Exec path: Cursor.desktop points to missing target /opt/Cursor/cursor.AppImage" },
        { type: "warn", text: "Missing icon path: Obsidian.desktop points to unindexed 'obsidian-icon'" }
      ]);
    }, 650);

    setTimeout(() => {
      setDocState("scanned");
      setDocLogs(prev => [
        ...prev,
        { type: "head", text: "Diagnostic Finished: Found 1 critical error, 2 warnings." }
      ]);
    }, 1000);
  };

  const runRepair = () => {
    setDocState("repairing");
    setDocLogs(prev => [
      ...prev,
      { type: "info", text: "Starting system repairs..." }
    ]);

    setTimeout(() => {
      setDocLogs(prev => [
        ...prev,
        { type: "ok", text: "Symlinked missing AppImage file to Cursor workspace" },
        { type: "ok", text: "Resolved icon path: Obsidian system icon mapped to generic development theme" }
      ]);
    }, 400);

    setTimeout(() => {
      setDocLogs(prev => [
        ...prev,
        { type: "ok", text: "Deduplicated desktop entries: Preserved local installation overrides" }
      ]);
    }, 800);

    setTimeout(() => {
      setDocState("repaired");
      setDocLogs(prev => [
        ...prev,
        { type: "success", text: "Success: DeskCrafter repaired launcher files without system conflicts." }
      ]);
    }, 1200);
  };

  // Icon query resolver logic calculated during render
  const getSearchResult = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return "Type an icon query...";
    }
    if (q.includes("fire") || q.includes("fox")) {
      return "/usr/share/icons/hicolor/scalable/apps/firefox.svg";
    }
    if (q.includes("term") || q.includes("bash")) {
      return "/usr/share/icons/Adwaita/scalable/apps/utilities-terminal.svg";
    }
    if (q.includes("obs") || q.includes("note")) {
      return "/usr/share/icons/hicolor/512x512/apps/obsidian.png";
    }
    if (q.includes("discord") || q.includes("chat")) {
      return "/var/lib/flatpak/exports/share/icons/hicolor/scalable/apps/com.discordapp.Discord.svg";
    }
    return `~/.local/share/icons/${q}.svg (Fallback matching resolved)`;
  };
  const searchResult = getSearchResult();

  return (
    <main>
      <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
        <div className="site-header-inner">
          <a className="brand" href="#top" aria-label="DeskCrafter home">
            <Image src="/logo.png" alt="DeskCrafter Logo" width={28} height={28} className="brand-logo" />
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
            <span>Open Source v0.1.0</span>
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
            <div className="window-title">launcher-studio ~ DeskCrafter</div>
            <div className="window-spacer" />
          </div>

          <div className="simulator-grid">
            <form className="simulator-form" onSubmit={handleCompile} onChange={resetCompile}>
              <div className="form-group">
                <label htmlFor="app-name-input">Application Name</label>
                <input
                  id="app-name-input"
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Zen Browser"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="exec-path-input">Executable / AppImage Path</label>
                <input
                  id="exec-path-input"
                  type="text"
                  value={execPath}
                  onChange={(e) => setExecPath(e.target.value)}
                  placeholder="/opt/zen/zen"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="icon-name-input">Icon Theme Name</label>
                <input
                  id="icon-name-input"
                  type="text"
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  placeholder="zen-browser"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category-select">Primary Category</label>
                <select
                  id="category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Network;WebBrowser;">Web Browsers</option>
                  <option value="Development;IDE;">Development IDEs</option>
                  <option value="Game;Strategy;">Games / Utilities</option>
                  <option value="AudioVideo;Player;">Media Players</option>
                  <option value="Office;WordProcessor;">Office Suites</option>
                </select>
              </div>

              <button
                id="compile-submit-button"
                type="submit"
                className="button button-primary compile-btn-full"
                disabled={compileState === "compiling"}
              >
                <MonitorCog size={16} />
                {compileState === "compiling" ? "Compiling..." : "Build Launcher"}
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
                  preview.desktop
                </button>
                <button
                  id="tab-mock-btn"
                  type="button"
                  className={`sim-tab-btn ${simTab === "mock" ? "active" : ""}`}
                  onClick={() => setSimTab("mock")}
                >
                  Launcher Dock
                </button>
              </div>

              {simTab === "code" ? (
                <div className="code-editor">
                  <span className="code-header-line">[Desktop Entry]</span>{"\n"}
                  <span className="code-key">Type</span>=<span className="code-value">Application</span>{"\n"}
                  <span className="code-key">Name</span>=<span className="code-value">{appName}</span>{"\n"}
                  <span className="code-key">Exec</span>=<span className="code-value">{execPath}</span>{"\n"}
                  <span className="code-key">Icon</span>=<span className="code-value">{iconName}</span>{"\n"}
                  <span className="code-key">Terminal</span>=<span className="code-value">false</span>{"\n"}
                  <span className="code-key">Categories</span>=<span className="code-value">{category}</span>{"\n"}
                  <span className="code-comment"># Created via DeskCrafter Marketing sandbox</span>
                </div>
              ) : (
                <div className="desktop-preview-pane">
                  <div className="mock-app-dock">
                    <div className="mock-dock-item">
                      <div className="mock-dock-icon-box">
                        <AppWindow size={28} />
                      </div>
                      <span className="mock-app-label">Files</span>
                    </div>
                    <div className="mock-dock-item">
                      <div className="mock-dock-icon-box active-dock-item">
                        <TerminalIcon size={28} />
                        <span className="mock-dock-dot" />
                      </div>
                      <span className="mock-app-label dock-label-active">{appName}</span>
                    </div>
                    <div className="mock-dock-item">
                      <div className="mock-dock-icon-box">
                        <Package size={28} />
                      </div>
                      <span className="mock-app-label">AppImage</span>
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
                  <span className="compile-console-idle">Click Build Launcher to compile and write metadata</span>
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
            <div className="ecosystem-item">Mate</div>
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
                <AppWindow size={20} />
              </div>
              <h2>Desktop Entry Studio</h2>
              <p>
                Craft standards-compliant, beautiful `.desktop` launcher configurations without fighting complex system properties.
                DeskCrafter provides live metadata validation, error checking, and safely manages user installations in the target XDG application path.
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
                  <div className="window-title">Desktop Studio Visualizer</div>
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
                <Package size={20} />
              </div>
              <h2>AppImage Integrator</h2>
              <p>
                Turn isolated standalone AppImage downloads into full system residents.
                Extract application schemas, index icons, and link portable downloads to native launcher menu indexes automatically.
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
                  <div className="window-title">AppImage Schema Linker</div>
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
          <span className="eyebrow">Advanced Capabilities</span>
          <h2>A robust workspace to manage system shortcuts.</h2>
        </div>
        <div className="bento-grid">
          {/* Card 1: Script Launcher */}
          <article className="bento-item bento-large">
            <div className="bento-icon">
              <FileCode2 size={20} />
            </div>
            <h3>Script Launcher Wrapper</h3>
            <p>Wrap custom terminal runs, script arguments, environment hooks, or executable bash instructions with a user-friendly launcher wrapper.</p>

            <div className="bento-widget">
              <div className="widget-terminal">
                <div><span className="line-in">$</span> deskcrafter wrap --script run_app.sh</div>
                <div><span className="line-out">[RESOLVE]</span> script path matches executable schemas</div>
                <div><span className="line-out">[SUCCESS]</span> Wrapped shortcut exported to launcher path</div>
              </div>
            </div>
          </article>

          {/* Card 2: URL Launcher */}
          <article className="bento-item">
            <div className="bento-icon">
              <Globe2 size={20} />
            </div>
            <h3>URL Quick Pin</h3>
            <p>Create shortcuts targeting custom browser dashboards, repositories, or local servers directly.</p>

            <div className="bento-widget">
              <div className="widget-url-card">
                <div className="widget-url-favicon">W</div>
                <div className="widget-url-info">
                  <span className="widget-url-title">Local Server Dashboard</span>
                  <span className="widget-url-meta">localhost:3000 (HTTP target)</span>
                </div>
              </div>
            </div>
          </article>

          {/* Card 3: Icon Manager */}
          <article className="bento-item">
            <div className="bento-icon">
              <ImageIcon size={20} />
            </div>
            <h3>Icon Resolver Widget</h3>
            <p>Type queries to resolve native systems icons, custom theme paths, and flatpak configurations instantly.</p>

            <div className="bento-widget widget-layout-vertical">
              <div className="widget-search">
                <Search size={12} className="icon-muted" />
                <input
                  id="icon-resolver-search"
                  type="text"
                  className="widget-search-field"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type 'firefox' or 'terminal'..."
                />
              </div>
              <div className="widget-search-results">
                <div className="widget-search-item">
                  <span>path:</span>
                  <span className="highlight text-ellipsis" title={searchResult}>
                    {searchResult}
                  </span>
                </div>
              </div>
            </div>
          </article>

          {/* Card 4: Launcher Doctor */}
          <article className="bento-item bento-large">
            <div className="bento-icon">
              <Stethoscope size={20} />
            </div>
            <h3>Launcher Doctor Dashboard</h3>
            <p>Scan background applications menu folders for broken launcher links, dead binary files, and missing theme assets.</p>

            <div className="bento-widget">
              <div className="widget-stats">
                <div className="widget-stat-box">
                  <div className="widget-stat-val">24</div>
                  <div className="widget-stat-lbl">Parsed Launchers</div>
                </div>
                <div className="widget-stat-box">
                  <div className="widget-stat-val widget-stat-error">3</div>
                  <div className="widget-stat-lbl">Issues Found</div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Linux Architecture & Live Doctor scan simulator */}
      <section className="split-section" id="linux">
        <div>
          <span className="eyebrow">Linux Integration</span>
          <h2>Secure Tauri backend runtime operating inside user-owned XDG directories.</h2>
           <p className="section-body-text">
            DeskCrafter operates on a clean architecture built for security. Your application metadata is read from and written to directories you own.
            No root requirements, no daemon processes, and completely standalone local execution.
          </p>
          <div className="principle-list">
            <div className="principle">
              <ShieldCheck size={18} />
              <div>
                <strong>Security & Sovereignty</strong>
                <span>Launcher configurations stay entirely on your local machine. No external services or accounts needed.</span>
              </div>
            </div>
            <div className="principle">
              <BadgeCheck size={18} />
              <div>
                <strong>Safe Path Handling</strong>
                <span>Creates files using standard XDG specs. Rest assured that the core system directories will never be edited.</span>
              </div>
            </div>
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
              <div className="window-title">doctor-terminal ~ scan</div>
              <div className="window-spacer" />
            </div>

            <div className="doc-btn-container">
              {docState === "idle" && (
                <button id="run-diagnostics-btn" className="doc-btn" onClick={runDiagnostics}>
                  <Play size={11} />
                  Run Diagnostics
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
                  Fix Issues
                </button>
              )}
              {docState === "repairing" && (
                <span className="doc-btn doc-btn-disabled">
                  <span className="console-spinner" />
                  Repairing...
                </span>
              )}
              {docState === "repaired" && (
                <span className="doc-btn doc-btn-repaired">
                  <CheckCircle size={11} />
                  System Repaired
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
            <h2>Ready to clean your application menu launchers?</h2>
            <p>{siteConfig.description}</p>
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
            <p>DeskCrafter: Standalone launcher suite built for the Linux desktop.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
