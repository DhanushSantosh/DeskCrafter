'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Terminal, Activity, Package } from 'lucide-react';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeResult, setActiveResult] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    const handleOpenEvent = () => setIsOpen(true);
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleOpenEvent);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleOpenEvent);
    };
  }, []);

  const runCommand = (action: string) => {
    setActiveResult(`Running sequence: ${action}...`);
    setTimeout(() => setActiveResult(`[SUCCESS] Completed: ${action}`), 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="command-backdrop"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20, x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: -20, x: "-50%" }}
            className="command-palette"
          >
            <div className="command-input-wrapper">
              <Search size={18} className="command-icon" />
              <input
                autoFocus
                type="text"
                className="command-input"
                placeholder="Type a command or search (e.g., 'scan')..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="command-shortcut">ESC</span>
            </div>

            <div className="command-results">
              {activeResult ? (
                <div className="command-active-result">
                  <span className="console-spinner" />
                  <code>{activeResult}</code>
                </div>
              ) : (
                <>
                  <div className="command-group-label">System Diagnostics</div>
                  <button className="command-item" onClick={() => runCommand('deskcrafter doctor --fix')}>
                    <Activity size={16} /> Run Full Suite Scan
                  </button>
                  <button className="command-item" onClick={() => runCommand('deskcrafter cache inspect')}>
                    <Terminal size={16} /> Inspect Orphaned Cache
                  </button>

                  <div className="command-group-label">App Integration</div>
                  <button className="command-item" onClick={() => runCommand('deskcrafter appimage discover')}>
                    <Package size={16} /> Discover Unlinked AppImages
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
