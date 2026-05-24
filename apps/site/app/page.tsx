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
import { siteConfig } from "../lib/site-content";
import { motion, Variants } from "framer-motion";
import { AmbientBackground } from "../components/AmbientBackground";
import { SpotlightCard } from "../components/SpotlightCard";
import { bentoFeatures, primaryFeatures, principles, toolDefinitions } from "../lib/site-content";

export default function HomePage() {
  const [selectedToolId, setSelectedToolId] = useState("launcher_repair_integrator");
  const [targetPath, setTargetPath] = useState("~/.local/share/applications");
  const [scanScope, setScanScope] = useState("Desktop integration paths");
  const [safetyMode, setSafetyMode] = useState("Validate then apply");
  const [simTab, setSimTab] = useState<"code" | "mock">("code");
  const [compileState, setCompileState] = useState<"idle" | "compiling" | "success">("idle");
  const [compileLog, setCompileLog] = useState("");

  // Doctor States
  const [docState, setDocState] = useState<"idle" | "scanning" | "scanned" | "repairing" | "repaired">("idle");
  const [docLogs, setDocLogs] = useState<Array<{ type: "info" | "warn" | "err" | "ok" | "success" | "head"; text: string }>>([
    { type: "head", text: "DeskCrafter Repair Console v0.1.0" },
    { type: "info", text: "Action planner ready. Press 'Run Repair Scan' to inspect integration issues and available fixes." }
  ]);

  // Terminal Widget Reveal State
  const [termState, setTermState] = useState(0);

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

  // Terminal Auto-Reveal Animation for Bento Cards
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (termState === 0) {
      timeout = setTimeout(() => setTermState(1), 1200);
    } else if (termState === 1) {
      timeout = setTimeout(() => setTermState(2), 600);
    } else if (termState === 2) {
      timeout = setTimeout(() => {
        setTermState(0);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [termState]);

  // Compile simulator action
  const handleCompile = (e: React.FormEvent) => {
    e.preventDefault();
    if (compileState !== "idle") return;

    setCompileState("compiling");
    setCompileLog("Loading action contract for selected tool...");

    setTimeout(() => {
      setCompileLog("Validating required path, privilege level, and target action...");
    }, 400);

    setTimeout(() => {
      setCompileLog("Preparing repair or integration plan with refresh steps...");
    }, 800);

    setTimeout(() => {
      setCompileState("success");
      setCompileLog(`Ready: ${selectedToolId} action plan prepared with explicit elevation boundaries.`);
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
      { type: "head", text: "DeskCrafter Repair Console v0.1.0" },
      { type: "info", text: "Scanning launcher, portable app, autostart, MIME, Flatpak, permission, service, and profile modules..." }
    ]);

    setTimeout(() => {
      setDocLogs(prev => [
        ...prev,
        { type: "info", text: "Read 8 tool definitions and mapped desktop integration targets." },
        { type: "warn", text: "mimeapps.list points text/html to a missing launcher entry." }
      ]);
    }, 300);

    setTimeout(() => {
      setDocLogs(prev => [
        ...prev,
        { type: "err", text: "Portable app target is missing: /opt/Cursor/cursor.AppImage" },
        { type: "warn", text: "Flatpak org.mozilla.firefox is missing a filesystem override required for downloads." }
      ]);
    }, 650);

    setTimeout(() => {
      setDocState("scanned");
      setDocLogs(prev => [
        ...prev,
        { type: "head", text: "Repair Scan Finished: Found 1 blocking issue and 2 actionable fixes." }
      ]);
    }, 1000);
  };

  const runRepair = () => {
    setDocState("repairing");
    setDocLogs(prev => [
      ...prev,
      { type: "info", text: "Preparing action set. Elevated steps remain explicit and user-visible." }
    ]);

    setTimeout(() => {
      setDocLogs(prev => [
        ...prev,
        { type: "ok", text: "Queued launcher repair and menu refresh for the selected desktop entry." },
        { type: "ok", text: "Generated xdg-mime and flatpak override commands for follow-up." }
      ]);
    }, 400);

    setTimeout(() => {
      setDocLogs(prev => [
        ...prev,
        { type: "ok", text: "Prepared guided systemctl and ownership repair steps where elevation is required." }
      ]);
    }, 800);

    setTimeout(() => {
      setDocState("repaired");
      setDocLogs(prev => [
        ...prev,
        { type: "success", text: "Success: Repair actions prepared with before-and-after state and explicit elevation boundaries." }
      ]);
    }, 1200);
  };

  const selectedTool = toolDefinitions.find((tool) => tool.id === selectedToolId) ?? toolDefinitions[0];
  const SelectedToolIcon = selectedTool.icon;

  const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const scaleUpVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const slideLeftVariants: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const slideRightVariants: Variants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const bentoItemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

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
        <AmbientBackground />
        <motion.div 
          className="hero-copy"
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
        >
          <div className="badge animate-float">
            <Sparkles size={12} />
            <span>Open Source repair suite v0.1.0</span>
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
        </motion.div>

        {/* Interactive Workspace Simulator Container */}
        <motion.div 
          className="simulator-container glass-panel"
          initial="hidden"
          animate="visible"
          variants={scaleUpVariants}
          transition={{ delay: 0.2 }}
        >
          <div className="simulator-header">
            <div className="window-controls">
              <span className="window-dot red" />
              <span className="window-dot yellow" />
              <span className="window-dot green" />
            </div>
            <div className="window-title">action-registry ~ DeskCrafter</div>
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
                  placeholder="~/.local/share/applications/app.desktop"
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
                  placeholder="Desktop integration paths"
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
                  <option value="Validate then apply">Validate then apply</option>
                  <option value="User-scope repair">User-scope repair</option>
                  <option value="Elevated workflow">Elevated workflow</option>
                  <option value="Guided commands only">Guided commands only</option>
                </select>
              </div>

              <button
                id="compile-submit-button"
                type="submit"
                className="button button-primary compile-btn-full"
                disabled={compileState === "compiling"}
              >
                <MonitorCog size={16} />
                {compileState === "compiling" ? "Preparing..." : "Prepare Action Plan"}
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
                  Action Preview
                </button>
              </div>

              {simTab === "code" ? (
                <div className="code-editor">
                  <span className="code-header-line">[action_plan]</span>{"\n"}
                  <span className="code-key">id</span>=<span className="code-value">&quot;{selectedTool.id}&quot;</span>{"\n"}
                  <span className="code-key">name</span>=<span className="code-value">&quot;{selectedTool.title}&quot;</span>{"\n"}
                  <span className="code-key">category</span>=<span className="code-value">&quot;{selectedTool.category}&quot;</span>{"\n"}
                  <span className="code-key">privilege</span>=<span className="code-value">&quot;{selectedTool.risk}&quot;</span>{"\n"}
                  <span className="code-key">target</span>=<span className="code-value">&quot;{targetPath}&quot;</span>{"\n"}
                  <span className="code-key">scope</span>=<span className="code-value">&quot;{scanScope}&quot;</span>{"\n"}
                  <span className="code-key">mode</span>=<span className="code-value">&quot;{safetyMode}&quot;</span>{"\n"}
                  <span className="code-comment"># Validate first, then apply explicit repair or integration actions</span>
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
                  <span className="compile-console-idle">Click Prepare Action Plan to build explicit repair and integration steps</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <motion.section 
        className="ecosystem-strip" aria-label="Supported Ecosystems"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={scaleUpVariants}
      >
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
      </motion.section>

      {/* Feature Splits */}
      <section className="section" id="features">
        <div className="feature-splits">
          {/* Split 1 */}
          <motion.div 
            className="feature-split"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={slideLeftVariants}
          >
            <div className="feature-split-content">
              <div className="feature-icon-wrapper">
                {React.createElement(primaryFeatures[0].icon, { size: 20 })}
              </div>
              <h2>{primaryFeatures[0].title}</h2>
              <p>
                {primaryFeatures[0].description} It keeps repairs explicit, refreshes menu state, and supports elevated global installs only when they materially improve integration.
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
                  <div className="window-title">launcher-repair.action</div>
                </div>
                <div className="concept-body-mini">
                  <div className="concept-line pulse-line" style={{ width: "90%" }} />
                  <div className="concept-line" style={{ width: "70%" }} />
                  <div className="concept-line" style={{ width: "80%" }} />
                  <div className="concept-line" style={{ width: "50%" }} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Split 2 */}
          <motion.div 
            className="feature-split reversed"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={slideRightVariants}
          >
            <div className="feature-split-content">
              <div className="feature-icon-wrapper">
                {React.createElement(primaryFeatures[1].icon, { size: 20 })}
              </div>
              <h2>{primaryFeatures[1].title}</h2>
              <p>
                {primaryFeatures[1].description} System-facing fixes stay understandable, reversible where possible, and tied to concrete desktop behavior.
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
                  <div className="window-title">defaults-sandbox.repair</div>
                </div>
                <div className="concept-body-mini">
                  <div className="concept-line concept-line-accent" style={{ width: "40%" }} />
                  <div className="concept-line pulse-line" style={{ width: "85%" }} />
                  <div className="concept-line" style={{ width: "60%" }} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid section */}
      <section className="section bento-section">
        <div className="section-heading centered">
          <span className="eyebrow">Expanded Tool Suite</span>
          <h2>One action registry for the Linux desktop fixes you actually need.</h2>
        </div>
        <motion.div 
          className="bento-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {bentoFeatures.map((feature, index) => {
            const FeatureIcon = feature.icon;
            return (
              <motion.div key={feature.id} variants={bentoItemVariants}>
                <SpotlightCard className={index === 0 || index === 5 ? "bento-item bento-large" : "bento-item"}>
                <div className="bento-icon">
                  <FeatureIcon size={20} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>

                <div className="bento-widget">
                  <div className="widget-terminal">
                    <div><span className="line-in">$</span> deskcrafter tools inspect {feature.id}</div>
                    {termState >= 1 && <div><span className="line-out">[CATEGORY]</span> {feature.category}</div>}
                    {termState >= 2 && <div><span className="line-out">[PRIVILEGE]</span> {feature.risk}</div>}
                  </div>
                </div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Linux Architecture & Live Doctor scan simulator */}
      <motion.section 
        className="split-section" id="linux"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUpVariants}
      >
        <div>
          <span className="eyebrow">Linux Integration</span>
          <h2>Secure Tauri backend runtime built for desktop integration repair.</h2>
           <p className="section-body-text">
            DeskCrafter scans to support action. User-scope fixes can apply directly, elevated workflows stay explicit, and every tool is shaped around making apps visible, launchable, and correctly associated on Linux.
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
              <div className="window-title">repair-console ~ registry</div>
              <div className="window-spacer" />
            </div>

            <div className="doc-btn-container">
              {docState === "idle" && (
                <button id="run-diagnostics-btn" className="doc-btn" onClick={runDiagnostics}>
                  <Play size={11} />
                  Run Repair Scan
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
                  Prepare Repair Actions
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
                  Repair Plan Ready
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
      </motion.section>

      {/* Download Section */}
      <motion.section 
        className="section" id="download"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={scaleUpVariants}
      >
        <div className="cta-card">
          <div className="cta-content">
            <MonitorCog size={30} className="cta-icon" />
            <h2>Ready to repair your Linux app integrations?</h2>
            <p>
              Repair launchers, integrate portable apps, fix startup entries, correct MIME defaults, adjust Flatpak permissions, and recover from ownership drift from one local-first workspace.
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
      </motion.section>

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
            <p>DeskCrafter: Standalone Linux desktop repair suite built for explicit actions, guided elevation, and reliable app integration.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
