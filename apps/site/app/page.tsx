import {
  ArrowRight,
  Download,
  Github,
  MonitorCog,
  Sparkles,
} from "lucide-react";
import { Button } from "../components/Button";
import { featureGroups, principles, proofPoints, siteConfig } from "../lib/site-content";

export default function HomePage() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="DeskCrafter home">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span>DeskCrafter</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#tools">Tools</a>
          <a href="#linux">Linux-first</a>
          <a href="#download">Download</a>
        </nav>
        <a className="github-link" href={siteConfig.githubUrl}>
          <Github size={18} />
          GitHub
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={16} />
            Native Linux launcher suite
          </div>
          <h1>{siteConfig.name}</h1>
          <p>{siteConfig.tagline}</p>
          <div className="hero-actions">
            <Button href="#download">
              <Download size={19} />
              Download for Linux
              <ArrowRight size={17} />
            </Button>
            <Button href="#tools" variant="secondary">
              Explore tools
            </Button>
          </div>
        </div>
        <div className="hero-visual" aria-label="DeskCrafter product interface concept">
          <div className="concept-window">
            <div className="concept-titlebar">
              <span />
              <span />
              <span />
              <strong>Launcher Suite</strong>
            </div>
            <div className="concept-body">
              <div className="concept-sidebar">
                <span className="active-line" />
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="concept-workspace">
                <div className="concept-heading" />
                <div className="concept-field wide" />
                <div className="concept-row">
                  <div className="concept-field" />
                  <div className="concept-field" />
                </div>
                <div className="concept-preview">
                  <code>[Desktop Entry]</code>
                  <code>Name=DeskCrafter Tool</code>
                  <code>Exec=/home/user/AppImage</code>
                  <code>Categories=Utility;</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="proof-strip" aria-label="DeskCrafter product facts">
        {proofPoints.map((point) => (
          <div key={point.label}>
            <strong>{point.value}</strong>
            <span>{point.label}</span>
          </div>
        ))}
      </section>

      <section className="section" id="tools">
        <div className="section-heading">
          <span className="eyebrow">Tool suite</span>
          <h2>One focused workspace for the launchers Linux users actually create.</h2>
        </div>
        <div className="tool-grid">
          {featureGroups.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className="tool-item" key={feature.title}>
                <Icon size={25} />
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="split-section" id="linux">
        <div>
          <span className="eyebrow">Linux-first architecture</span>
          <h2>Tauri shell. Rust backend. User-owned XDG paths.</h2>
          <p>
            DeskCrafter moves local integration into a secure native backend so the interface can
            stay fast while filesystem, validation, and launch behavior remain explicit.
          </p>
          <div className="principle-list">
            {principles.map((principle) => {
              const Icon = principle.icon;
              return (
                <div className="principle" key={principle.title}>
                  <Icon size={20} />
                  <div>
                    <strong>{principle.title}</strong>
                    <span>{principle.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="architecture-visual" aria-label="DeskCrafter architecture concept">
          <div className="signal-card">
            <span>React workspace</span>
            <strong>Tool UI</strong>
          </div>
          <div className="signal-line" />
          <div className="signal-card signal-card-core">
            <span>Rust core</span>
            <strong>XDG-safe commands</strong>
          </div>
          <div className="signal-line" />
          <div className="signal-card">
            <span>Linux desktop</span>
            <strong>Launchers repaired</strong>
          </div>
        </div>
      </section>

      <section className="download-section" id="download">
        <MonitorCog size={34} />
        <h2>Ready to craft cleaner Linux launchers?</h2>
        <p>{siteConfig.description}</p>
        <div className="hero-actions">
          <Button href={siteConfig.githubUrl}>
            <Github size={19} />
            View source
          </Button>
          <Button href="https://github.com/DhanushSantosh/DeskCrafter/releases" variant="secondary">
            Releases
          </Button>
        </div>
      </section>
    </main>
  );
}
