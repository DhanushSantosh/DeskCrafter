'use client';

import React, { useEffect, useRef } from 'react';

interface Streak {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  thickness: number;
}

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let streaks: Streak[] = [];
    const numStreaks = 60; 
    const mouse = { x: -1000, y: -1000 };

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      initStreaks();
    };

    const initStreaks = () => {
      streaks = [];
      for (let i = 0; i < numStreaks; i++) {
        streaks.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          length: Math.random() * 150 + 50,
          speed: Math.random() * 2 + 1,
          opacity: Math.random() * 0.4 + 0.1,
          thickness: Math.random() * 1.5 + 0.5,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw static horizontal track lines for texture
      ctx.lineWidth = 1;
      const numTracks = Math.floor(canvas.height / 40);
      for (let i = 0; i < numTracks; i++) {
        const y = i * 40;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.stroke();
      }

      // Update & Draw Horizontal Streaks
      for (let i = 0; i < streaks.length; i++) {
        const s = streaks[i];
        
        // Move streak left
        s.x -= s.speed;

        // Reset if off-screen
        if (s.x + s.length < 0) {
          s.x = canvas.width + Math.random() * 200;
          s.y = Math.random() * canvas.height;
        }

        // Check distance to mouse for interactive glow
        const dy = s.y - mouse.y;
        const dx = (s.x + s.length / 2) - mouse.x;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let currentOpacity = s.opacity;
        if (dist < 150) {
          // Increase opacity and thickness near mouse
          currentOpacity = Math.min(0.8, s.opacity + (150 - dist) * 0.005);
        }

        // Draw Streak
        const gradient = ctx.createLinearGradient(s.x, s.y, s.x + s.length, s.y);
        gradient.addColorStop(0, `rgba(255, 13, 62, 0)`); // Fade in front
        gradient.addColorStop(0.2, `rgba(255, 13, 62, ${currentOpacity})`);
        gradient.addColorStop(0.8, `rgba(255, 13, 62, ${currentOpacity})`);
        gradient.addColorStop(1, `rgba(255, 13, 62, 0)`); // Fade out tail

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.length, s.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = dist < 150 ? s.thickness * 1.5 : s.thickness;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="hero-canvas-wrapper">
      <div className="canvas-gradient-mask" />
      <canvas
        ref={canvasRef}
        className="particle-canvas"
      />
    </div>
  );
}
