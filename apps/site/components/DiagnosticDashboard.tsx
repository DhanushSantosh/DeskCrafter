'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AppWindow, Activity, Package, Route, Workflow, Shield, Fingerprint, FileCog } from 'lucide-react';

const tools = [
  { id: 'launcher', title: 'Launcher Integrator', risk: 'User write', status: 'WARN', icon: AppWindow },
  { id: 'autostart', title: 'Autostart Actions', risk: 'User write', status: 'SAFE', icon: Activity },
  { id: 'portable', title: 'Portable Sandbox', risk: 'Read only', status: 'WARN', icon: Package },
  { id: 'env', title: 'PATH Environment', risk: 'Read only', status: 'SAFE', icon: Route },
  { id: 'mime', title: 'MIME Defaults', risk: 'Elevated write', status: 'SAFE', icon: Workflow },
  { id: 'flatpak', title: 'Flatpak Overrides', risk: 'Elevated write', status: 'WARN', icon: Shield },
  { id: 'perms', title: 'Ownership Drift', risk: 'Elevated write', status: 'SAFE', icon: Fingerprint },
  { id: 'service', title: 'System Services', risk: 'System repair', status: 'SAFE', icon: FileCog },
];

export function DiagnosticDashboard() {
  const [activeScan, setActiveScan] = useState<string | null>(null);
  const [statuses, setStatuses] = useState(tools.reduce((acc, t) => ({ ...acc, [t.id]: t.status }), {} as Record<string, string>));

  const runScan = (id: string) => {
    if (activeScan) return;
    setActiveScan(id);
    setStatuses(s => ({ ...s, [id]: 'SCAN' }));
    
    setTimeout(() => {
      setStatuses(s => ({ ...s, [id]: 'SAFE' }));
      setActiveScan(null);
    }, 1500);
  };

  return (
    <div className="diagnostic-dashboard">
      <div className="dashboard-header">
        <h2>Live Diagnostic Telemetry</h2>
        <div className="telemetry-badge">
          <span className="live-dot"></span>
          8 MODULES ACTIVE
        </div>
      </div>
      
      <div className="diagnostic-grid">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const status = statuses[tool.id];
          
          return (
            <motion.div 
              key={tool.id}
              className={`diag-card ${status === 'WARN' ? 'warn' : ''} ${status === 'SCAN' ? 'scanning' : ''}`}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => runScan(tool.id)}
              data-cursor={status === 'WARN' ? 'FIX' : 'SCAN'}
            >
              <div className="diag-card-header">
                <div className="diag-icon-box">
                  <Icon size={18} />
                </div>
                <div className={`diag-status ${status.toLowerCase()}`}>
                  {status}
                </div>
              </div>
              <div className="diag-card-body">
                <h3>{tool.title}</h3>
                <span className="diag-risk">{tool.risk}</span>
              </div>
              
              {status === 'SCAN' && (
                <motion.div 
                  className="scan-line"
                  initial={{ top: 0 }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
