'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, Github, Sparkles, Terminal } from "lucide-react";
import { siteConfig } from "../lib/site-content";
import { motion, AnimatePresence } from "framer-motion";
import { ParticleCanvas } from "../components/ParticleCanvas";
import { CommandPalette } from "../components/CommandPalette";
import { StickyFeatureScroll } from "../components/StickyFeatureScroll";
import { BootSequence } from "../components/BootSequence";
import { CustomCursor } from "../components/CustomCursor";
import { Magnetic } from "../components/Magnetic";
import { ArchitectureVisualizer } from "../components/ArchitectureVisualizer";
import { DiagnosticDashboard } from "../components/DiagnosticDashboard";

export default function HomePage() {
  const [booted, setBooted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="awwwards-main">
      <CustomCursor />
      <CommandPalette />
      <AnimatePresence>
        {!booted && <BootSequence onComplete={() => setBooted(true)} />}
      </AnimatePresence>

      <div className="noise-overlay" />

      <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
        <div className="site-header-inner">
          <Magnetic intensity={0.2}>
            <a className="brand" href="#top" data-cursor="HOME">
              <Image src="/logo.png" alt="DeskCrafter Logo" width={28} height={28} className="brand-logo" priority />
              <span>DeskCrafter</span>
            </a>
          </Magnetic>
          
          <nav aria-label="Primary navigation">
            <Magnetic intensity={0.3}><a href="#features" data-cursor="SCROLL">Features</a></Magnetic>
            <Magnetic intensity={0.3}><a href="#architecture" data-cursor="VIEW">Architecture</a></Magnetic>
            <Magnetic intensity={0.3}><a href="#diagnostics" data-cursor="TEST">Diagnostics</a></Magnetic>
          </nav>

          <Magnetic intensity={0.2}>
            <a className="github-link" href={siteConfig.githubUrl} target="_blank" rel="noopener noreferrer" data-cursor="CODE">
              <Github size={16} /> GitHub
            </a>
          </Magnetic>
        </div>
      </header>

      <section className="hero-section" id="top">
        <ParticleCanvas />
        <div className="hero-content">
          <motion.div 
            className="hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={booted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <Sparkles size={14} className="cherry-icon" />
            <span>v0.1.0-alpha system ready</span>
          </motion.div>
          
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={booted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            INTEGRATE. <br />
            <span className="cherry-text">REPAIR.</span> <br />
            DOMINATE.
          </motion.h1>

          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={booted ? { opacity: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {siteConfig.tagline}
          </motion.p>

          <motion.div 
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={booted ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7 }}
          >
            <Magnetic intensity={0.1}>
              <a href="#download" className="cyber-button primary" data-cursor="INSTALL">
                <Terminal size={18} /> INITIALIZE INSTALL
                <ArrowRight size={16} />
              </a>
            </Magnetic>
            <div className="press-k-hint">Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to execute commands</div>
          </motion.div>
        </div>
        
        {/* Decorative HUD Elements */}
        <div className="hud-corner top-left" />
        <div className="hud-corner top-right" />
        <div className="hud-corner bottom-left" />
        <div className="hud-corner bottom-right" />
      </section>

      <section className="architecture-section" id="architecture">
        <div className="section-container">
          <div className="section-header text-center">
            <h2 className="section-title">THE XDG PIPELINE</h2>
            <p className="section-desc">Visualize the exact flow of how Linux processes your applications.</p>
          </div>
          <ArchitectureVisualizer />
        </div>
      </section>

      <section id="features" className="sticky-scroll-wrapper">
        <StickyFeatureScroll />
      </section>

      <section className="diagnostics-section" id="diagnostics">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">SYSTEM TELEMETRY</h2>
            <p className="section-desc">Run mock diagnostics across 8 core integration modules.</p>
          </div>
          <DiagnosticDashboard />
        </div>
      </section>

      <footer className="cyber-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <Image src="/logo.png" alt="DeskCrafter Logo" width={24} height={24} />
            <span className="footer-title">DESKCRAFTER_OS</span>
          </div>
          <div className="footer-links">
            <Magnetic intensity={0.2}><a href={siteConfig.githubUrl} data-cursor="GITHUB">Source</a></Magnetic>
            <Magnetic intensity={0.2}><a href="https://github.com/DhanushSantosh/DeskCrafter/releases" data-cursor="DOWNLOAD">Releases</a></Magnetic>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-line"></div>
          <p>© 2026 DeskCrafter OS. Open Source Repair Suite.</p>
        </div>
      </footer>
    </main>
  );
}
