'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, Search, Menu, X } from "lucide-react";
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
import { ScrollToTop } from "../components/ScrollToTop";

export default function HomePage() {
  const [booted, setBooted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroWord = siteConfig.name.toUpperCase();

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main className="awwwards-main">
      <CustomCursor />
      <CommandPalette />
      <AnimatePresence>
        {!booted && <BootSequence onComplete={() => setBooted(true)} />}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            id="mobile-menu"
            className="mobile-menu-overlay"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mobile-menu-header">
              <span className="mobile-menu-brand">DeskCrafter</span>
              <button type="button" className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <X size={24} />
              </button>
            </div>
            <div className="mobile-menu-content">
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#architecture" onClick={() => setMobileMenuOpen(false)}>Architecture</a>
              <a href="#diagnostics" onClick={() => setMobileMenuOpen(false)}>Diagnostics</a>
              <div className="mobile-menu-divider" />
              <a href={siteConfig.githubUrl} target="_blank" rel="noopener noreferrer">Source Code</a>
              <a href="https://github.com/DhanushSantosh/DeskCrafter/releases" target="_blank" rel="noopener noreferrer" className="mobile-download">
                <Download size={18} /> Download Now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="noise-overlay" />

      <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
        <div className="site-header-inner">
          <Magnetic intensity={0.2}>
            <a className="brand" href="#top" data-cursor="HOME">
              <Image src="/logo.png" alt="DeskCrafter Logo" width={28} height={28} className="brand-logo" priority />
              <span className="brand-text">DeskCrafter</span>
            </a>
          </Magnetic>
          
          <nav className="desktop-nav" aria-label="Primary navigation">
            <Magnetic intensity={0.3}><a href="#features" data-cursor="SCROLL">Features</a></Magnetic>
            <Magnetic intensity={0.3}><a href="#architecture" data-cursor="VIEW">Architecture</a></Magnetic>
            <Magnetic intensity={0.3}><a href="#diagnostics" data-cursor="TEST">Diagnostics</a></Magnetic>
          </nav>

          <div className="header-actions">
            <button type="button" className="navbar-search" onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))} data-cursor="SEARCH" aria-label="Open search">
              <Search size={14} /> 
              <span className="search-label">Search</span>
              <kbd className="hide-on-mobile">Ctrl K</kbd>
            </button>
            
            <a className="download-btn hide-on-mobile" href="https://github.com/DhanushSantosh/DeskCrafter/releases" target="_blank" rel="noopener noreferrer" data-cursor="DOWNLOAD">
              <Download size={16} /> <span>Download</span>
            </a>

            <button
              type="button"
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <section className="hero-section" id="top">
        <ParticleCanvas />
        
        {/* Top Spacer to balance the bottom section */}
        <div className="hero-spacer" />

        <div className="kinetic-hero-wrapper">
          <motion.div 
            className="hero-terminal-prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={booted ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: 0.6 }}
          >
            <span className="prompt-user">root@deskcrafter</span>:~# 
            <motion.span 
              animate={{ opacity: [1, 0, 1] }} 
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              style={{ display: "inline-block", width: "8px", background: "white", marginLeft: "8px", height: "14px" }}
            />
          </motion.div>

          <motion.h1 
            className="kinetic-hero-title"
            initial="hidden"
            animate={booted ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.05, delayChildren: 0.2 }
              }
            }}
          >
            {heroWord.split("").map((char, index) => (
              <motion.span 
                key={index} 
                className="kinetic-char"
                variants={{
                  hidden: { opacity: 0, y: 50, rotateX: 90 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    rotateX: 0,
                    transition: { type: "spring", damping: 12, stiffness: 100 }
                  }
                }}
                whileHover={{ 
                  scale: 1.1, 
                  y: -20, 
                  rotateZ: (index % 2 === 0 ? 5 : -5),
                  transition: { type: "spring", stiffness: 300, damping: 10 }
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p 
            className="kinetic-hero-subtitle"
            initial={{ opacity: 0 }}
            animate={booted ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            {siteConfig.tagline}
          </motion.p>
          
        </div>

        {/* Bottom Spacer & Scroll Indicator */}
        <div className="hero-spacer hero-spacer-bottom">
          <Magnetic intensity={0.2}>
            <motion.div 
              className="scroll-indicator"
              initial={{ opacity: 0 }}
              animate={booted ? { opacity: 0.6 } : { opacity: 0 }}
              transition={{ delay: 1.5, duration: 1 }}
              onClick={() => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' })}
              data-cursor="SCROLL"
            >
              <div className="mouse-icon">
                <div className="mouse-wheel"></div>
              </div>
              <span>Scroll</span>
            </motion.div>
          </Magnetic>
        </div>
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
            <span className="footer-title">deskcrafter.</span>
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
      <ScrollToTop />
    </main>
  );
}
