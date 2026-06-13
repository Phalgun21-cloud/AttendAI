'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [cursorType, setCursorType] = useState<'normal' | 'pointer' | 'hidden'>('normal');
  const [hoveredText, setHoveredText] = useState<string | null>(null);

  // Position of the mouse
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Spring physics settings (lagging behind with high damping for a premium premium look)
  const springConfig = { damping: 35, stiffness: 250, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Handle magnetic buttons
      const target = e.target as HTMLElement;
      const magneticElement = target.closest('[data-magnetic]') as HTMLElement;

      if (magneticElement) {
        const rect = magneticElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate distance from center
        const distX = e.clientX - centerX;
        const distY = e.clientY - centerY;

        // Apply magnetic pull (max 12px)
        const pullX = Math.max(-12, Math.min(12, distX * 0.25));
        const pullY = Math.max(-12, Math.min(12, distY * 0.25));

        magneticElement.style.transform = `translate(${pullX}px, ${pullY}px)`;
        magneticElement.style.transition = 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)';
        
        // Change cursor to magnetic snapping state
        setCursorType('pointer');
      } else {
        // Find and reset any translated magnetic elements in the document
        const magneticElements = document.querySelectorAll('[data-magnetic]');
        magneticElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.style.transform && htmlEl.style.transform !== 'translate(0px, 0px)') {
            htmlEl.style.transform = 'translate(0px, 0px)';
            htmlEl.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
          }
        });
      }

      // Check standard interactive hover tags
      const isInteractive = target.closest('a, button, [role="button"], [data-cursor="pointer"]');
      if (isInteractive && !magneticElement) {
        setCursorType('pointer');
        const customText = (isInteractive as HTMLElement).getAttribute('data-cursor-text');
        setHoveredText(customText);
      } else if (!magneticElement) {
        setCursorType('normal');
        setHoveredText(null);
      }
    };

    const handleMouseLeaveWindow = () => {
      setCursorType('hidden');
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
    };
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  // Render cursor only on desktop/mouse devices
  return (
    <>
      {/* Background soft torch glow following cursor */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-0 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial from-[#4F46E5]/10 to-transparent blur-2xl opacity-60"
        style={{
          x: cursorX,
          y: cursorY,
        }}
      />

      {/* GPU Accelerated Custom Cursor Wrapper */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-50"
        style={{
          x: cursorX,
          y: cursorY,
        }}
      >
        {/* Main Custom Cursor Ring */}
        <motion.div
          className="rounded-full border mix-blend-screen -translate-x-1/2 -translate-y-1/2"
          animate={{
            width: cursorType === 'pointer' ? 48 : 8,
            height: cursorType === 'pointer' ? 48 : 8,
            backgroundColor: cursorType === 'pointer' ? 'rgba(79, 70, 229, 0.05)' : '#FFFFFF',
            borderColor: cursorType === 'pointer' ? 'rgba(79, 70, 229, 0.6)' : 'transparent',
            opacity: cursorType === 'hidden' ? 0 : 1,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            transformOrigin: 'center',
          }}
        >
          {hoveredText && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute left-14 top-1/2 -translate-y-1/2 rounded-md bg-[#141414] border border-white/10 px-2.5 py-1 text-[9px] font-mono tracking-widest text-[#FFFFFF] uppercase whitespace-nowrap shadow-xl"
            >
              {hoveredText}
            </motion.span>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
