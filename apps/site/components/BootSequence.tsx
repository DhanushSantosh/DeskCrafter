'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_WORDMARK = String.raw`
 ____  _____ ____  _  __  ____ ____      _    _____ _____ _____ ____  
|  _ \| ____/ ___|| |/ / / ___|  _ \    / \  |  ___|_   _| ____|  _ \ 
| | | |  _| \___ \| ' / | |   | |_) |  / _ \ | |_    | | |  _| | |_) |
| |_| | |___ ___) | . \ | |___|  _ <  / ___ \|  _|   | | | |___|  _ < 
|____/|_____|____/|_|\_\ \____|_| \_\/_/   \_\_|     |_| |_____|_| \_\
`;

const BOOT_LOGS = [
  "deskcrafter-os v0.1.0-alpha core boot...",
  "Initializing hardware abstractions...",
  "[ OK ] Mounted XDG virtual filesystem.",
  "Loading kernel modules...",
  "[ OK ] Detected 12 CPU cores. Allocating resources.",
  "Verifying desktop entry specifications...",
  "[ OK ] flatpak-run sandboxing module loaded.",
  "Bypassing generic SaaS UI vectors...",
  "Injecting Awwwards-grade CSS engine...",
  "[ OK ] Cybernetic visual system active.",
];

export function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [isBooting, setIsBooting] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let currentLine = 0;
    
    const interval = setInterval(() => {
      if (currentLine < BOOT_LOGS.length) {
        setLines(prev => [...prev, BOOT_LOGS[currentLine]]);
        currentLine++;
      }
    }, 150);

    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return p + 5;
      });
    }, 80);

    const finishTimeout = setTimeout(() => {
      setIsBooting(false);
      onComplete(); // Fire immediately to let parent components animate in simultaneously
    }, 2800);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
      clearTimeout(finishTimeout);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isBooting && (
        <motion.div
          className="boot-sequence-overlay"
          exit={{ 
            clipPath: "inset(50% 0 50% 0)", 
            opacity: 0,
            transition: { duration: 0.8, ease: [0.77, 0, 0.175, 1] } 
          }}
        >
          <div className="boot-terminal">
            <div className="boot-ascii">
              <pre className="boot-wordmark" aria-label="DESKCRAFTER">
                {BOOT_WORDMARK}
              </pre>
            </div>
            
            <div className="boot-logs">
              {lines.map((line, i) => (
                <div key={i} className="boot-log-line">
                  <span className="log-caret">&gt;</span> {line}
                </div>
              ))}
            </div>

            <div className="boot-progress">
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-text">SYS_LOAD :: {progress}%</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
