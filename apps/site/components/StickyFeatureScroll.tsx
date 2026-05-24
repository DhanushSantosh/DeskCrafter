'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppWindow, Activity, Package, Route } from 'lucide-react';

const scrollFeatures = [
  {
    id: "launcher",
    title: "LAUNCHER_MANAGER",
    desc: "Build and repair desktop entries, AppImage launchers, scripts, and URLs right from your user-owned XDG workspace. No blind root execution.",
    icon: AppWindow,
    terminal: {
      in: "$ deskcrafter tools inspect launcher_manager",
      category: "Launchers",
      boundary: "User write"
    }
  },
  {
    id: "autostart",
    title: "AUTOSTART_INSPECTOR",
    desc: "Map the Linux session and inspect user vs system autostart entries. Identifies orphaned startup scripts that degrade boot time.",
    icon: Activity,
    terminal: {
      in: "$ deskcrafter tools inspect autostart_manager",
      category: "Startup",
      boundary: "User write"
    }
  },
  {
    id: "appimage",
    title: "SANDBOX_DISCOVERY",
    desc: "Automatically locate disconnected AppImages and prepare safe, localized launcher integration paths with desktop-file-validate.",
    icon: Package,
    terminal: {
      in: "$ deskcrafter tools inspect appimage_manager",
      category: "Apps",
      boundary: "Read first"
    }
  },
  {
    id: "path",
    title: "ENV_PATH_TRACER",
    desc: "Find duplicate PATH entries, missing directories, and trace shell profile hints safely without disrupting your bashrc.",
    icon: Route,
    terminal: {
      in: "$ deskcrafter tools inspect environment_path",
      category: "System",
      boundary: "Read only"
    }
  }
];

export function StickyFeatureScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollProgress = -rect.top / (rect.height - window.innerHeight);
      
      let newIndex = Math.floor(scrollProgress * scrollFeatures.length);
      newIndex = Math.max(0, Math.min(newIndex, scrollFeatures.length - 1));
      
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeIndex]);

  const activeFeature = scrollFeatures[activeIndex];

  return (
    <div ref={containerRef} className="sticky-scroll-container">
      <div className="sticky-scroll-text">
        {scrollFeatures.map((feature, index) => {
          const FeatureIcon = feature.icon;
          const isActive = index === activeIndex;
          return (
            <div 
              key={feature.id} 
              className={`sticky-scroll-block ${isActive ? 'active' : ''}`}
            >
              <div className="sticky-icon-wrap">
                <FeatureIcon size={24} />
              </div>
              <h3 className="cyber-h3">{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="sticky-scroll-visual" data-cursor="OBSERVE">
        <div className="sticky-visual-inner">
          <div className="hud-corner top-left" />
          <div className="hud-corner top-right" />
          <div className="hud-corner bottom-left" />
          <div className="hud-corner bottom-right" />
          
          <div className="simulator-header">
            <div className="window-controls">
              <span className="window-dot red" />
              <span className="window-dot yellow" />
              <span className="window-dot green" />
            </div>
            <div className="window-title">root@deskcrafter ~ live-inspect</div>
          </div>
          
          <div className="sticky-terminal">
            <motion.div
              key={activeFeature.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div><span className="line-in">{activeFeature.terminal.in}</span></div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <span className="line-out">[CATEGORY]</span> {activeFeature.terminal.category}
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <span className="line-out">[BOUNDARY]</span> {activeFeature.terminal.boundary}
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                <span className="line-out">[STATUS]</span> Ready to execute.
              </motion.div>
              
              <motion.div 
                className="terminal-cursor-blink"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                █
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
