'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function AmbientBackground() {
  return (
    <div className="ambient-background">
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="ambient-orb orb-1"
      />
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="ambient-orb orb-2"
      />
    </div>
  );
}
