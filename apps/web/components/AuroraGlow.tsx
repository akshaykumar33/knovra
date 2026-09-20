'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';

export function AuroraGlow() {
  const { currentThemeConfig } = useTheme();
  const isDark = currentThemeConfig.isDark;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '1400px',
        height: '580px',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: isDark ? 0.65 : 0.35,
        transition: 'opacity 0.3s ease',
      }}
      aria-hidden="true"
    >
      {/* Aurora Orb 1: Emerald glow drifting */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -35, 20, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '-10%',
          left: '15%',
          width: '520px',
          height: '520px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.28) 0%, rgba(16, 185, 129, 0) 70%)',
          filter: 'blur(70px)',
        }}
      />

      {/* Aurora Orb 2: Cyan energy orb */}
      <motion.div
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 30, -25, 0],
          scale: [1, 0.9, 1.2, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '5%',
          right: '18%',
          width: '580px',
          height: '580px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.24) 0%, rgba(6, 182, 212, 0) 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Aurora Orb 3: Violet mystic highlight */}
      <motion.div
        animate={{
          x: [0, 30, -40, 0],
          y: [0, -20, 35, 0],
          scale: [0.95, 1.1, 1, 0.95],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '25%',
          left: '42%',
          width: '460px',
          height: '460px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.20) 0%, rgba(139, 92, 246, 0) 70%)',
          filter: 'blur(75px)',
        }}
      />
    </div>
  );
}

export default AuroraGlow;
