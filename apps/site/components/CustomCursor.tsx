'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState('');
  
  // Outer circle motion
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Inner dot motion (fast)
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  
  const dotSpringConfig = { damping: 40, stiffness: 1000, mass: 0.1 };
  const dotXSpring = useSpring(dotX, dotSpringConfig);
  const dotYSpring = useSpring(dotY, dotSpringConfig);

  useEffect(() => {
    // Determine if device has touch capability (disable custom cursor)
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      return;
    }

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
      dotX.set(e.clientX - 4);
      dotY.set(e.clientY - 4);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleHoverStart = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveEl = target.closest('a, button, input, select, [data-cursor]');
      
      if (interactiveEl) {
        setIsHovering(true);
        const text = interactiveEl.getAttribute('data-cursor');
        if (text) {
          setCursorText(text);
        } else {
          setCursorText('');
        }
      }
    };

    const handleHoverEnd = () => {
      setIsHovering(false);
      setCursorText('');
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseover', handleHoverStart);
    window.addEventListener('mouseout', handleHoverEnd);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleHoverStart);
      window.removeEventListener('mouseout', handleHoverEnd);
    };
  }, [cursorX, cursorY, dotX, dotY, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="cursor-container">
      <motion.div
        className={`cursor-ring ${isHovering ? 'hovering' : ''}`}
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        {isHovering && cursorText && (
          <span className="cursor-text">{cursorText}</span>
        )}
      </motion.div>
      <motion.div
        className={`cursor-dot ${isHovering ? 'hovering' : ''}`}
        style={{
          x: dotXSpring,
          y: dotYSpring,
        }}
      />
    </div>
  );
}
