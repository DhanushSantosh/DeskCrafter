'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileCode, ShieldAlert, MonitorCheck, AppWindow } from 'lucide-react';

export function ArchitectureVisualizer() {
  const steps = [
    { icon: FileCode, label: "app.desktop", desc: "User entry created" },
    { icon: ShieldAlert, label: "desktop-file-validate", desc: "Linting & syntax check" },
    { icon: MonitorCheck, label: "update-desktop-database", desc: "MIME cache rebuild" },
    { icon: AppWindow, label: "System Dock", desc: "Available for launch" },
  ];

  return (
    <div className="architecture-visualizer">
      <div className="arch-pipeline">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={idx}>
              <motion.div 
                className="arch-node"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.2, duration: 0.5 }}
                data-cursor="VIEW"
              >
                <div className="arch-icon-wrapper">
                  <Icon size={24} />
                </div>
                <div className="arch-text">
                  <span className="arch-label">{step.label}</span>
                  <span className="arch-desc">{step.desc}</span>
                </div>
              </motion.div>
              
              {idx < steps.length - 1 && (
                <motion.div 
                  className="arch-connector"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.2 + 0.3, duration: 0.4 }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Background SVG Grid/Lines can be placed here */}
      <svg className="arch-bg-svg" width="100%" height="100%">
        <pattern id="arch-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#arch-grid)" />
      </svg>
    </div>
  );
}
