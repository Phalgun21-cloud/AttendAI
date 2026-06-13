'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import CustomCursor from './CustomCursor';
import AudioWaveform from './AudioWaveform';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface Props {
  isLoggedIn: boolean;
}

export default function HomePageClient({ isLoggedIn }: Props) {
  const dashLink = isLoggedIn ? '/dashboard' : '/login';

  // Active scene triggers (1 to 6)
  const [activeScene, setActiveScene] = useState(1);
  const [dialogueStep, setDialogueStep] = useState(0);
  const [emotionalState, setEmotionalState] = useState(1);

  // Refs for GSAP ScrollTrigger
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const emotionalContainerRef = useRef<HTMLDivElement>(null);
  const emotionalSectionRef = useRef<HTMLDivElement>(null);

  // Cache refs to prevent redundant React re-renders on scroll frames
  const currentSceneRef = useRef(1);
  const currentDialogueRef = useRef(0);
  const currentEmotionalStateRef = useRef(1);

  // ─── 3D PARALLAX EFFECT FOR RFID TERMINAL (Framer Motion local tilt) ───
  const tiltX = useSpring(useMotionValue(10), { damping: 35, stiffness: 250 });
  const tiltY = useSpring(useMotionValue(-10), { damping: 35, stiffness: 250 });

  useEffect(() => {
    const handleMouseMoveParallax = (e: MouseEvent) => {
      const halfWidth = window.innerWidth / 2;
      const halfHeight = window.innerHeight / 2;
      const offX = (e.clientX - halfWidth) / halfWidth;
      const offY = (e.clientY - halfHeight) / halfHeight;

      tiltX.set(-offY * 10 + 10);
      tiltY.set(offX * 10 - 10);
    };

    window.addEventListener('mousemove', handleMouseMoveParallax);
    return () => window.removeEventListener('mousemove', handleMouseMoveParallax);
  }, [tiltX, tiltY]);

  // ─── GSAP SCROLLTRIGGER PRESENTATION SETUP ───
  useEffect(() => {
    // Force browser scroll-behavior to auto to prevent scroll animation fights
    document.documentElement.style.scrollBehavior = 'auto';

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Initial State Definitions for all actors (ensure they start hidden/positioned)
      gsap.set('.actor-reader', { x: 0, y: 0, scale: 1, opacity: 1 });
      gsap.set('.actor-card', { x: -260, y: 220, z: -250, rotateX: 35, rotateY: -25, rotateZ: -15, scale: 0.65, opacity: 0, transformStyle: 'preserve-3d' });
      gsap.set('.actor-profile', { x: 320, y: 20, scale: 0.8, opacity: 0, pointerEvents: 'none' });
      gsap.set('.actor-phone', { x: 300, scale: 0.75, opacity: 0, pointerEvents: 'none' });
      gsap.set('.actor-list', { x: 300, scale: 0.75, opacity: 0, pointerEvents: 'none' });
      gsap.set('.actor-call', { x: 200, y: 0, scale: 0.8, opacity: 0, pointerEvents: 'none' });
      gsap.set('.actor-dash-left', { x: -250, opacity: 0, pointerEvents: 'none' });
      gsap.set('.actor-dash-bottom', { y: 180, opacity: 0, pointerEvents: 'none' });
      gsap.set('.chart-path', { strokeDashoffset: 400, strokeDasharray: 400 });
      gsap.set('.chart-glow-path', { opacity: 0 });
      gsap.set('.ripple-bubble', { scale: 0.8, opacity: 0 });
      gsap.set('.reader-status-ready', { opacity: 0 });
      gsap.set('.reader-status-standby', { opacity: 1 });

      // Transcript dialogue text starting states inside call panel
      gsap.set('.dialogue-bubble-1', { opacity: 0, x: -6 });
      gsap.set('.dialogue-bubble-2', { opacity: 0, x: 6 });
      gsap.set('.dialogue-bubble-3', { opacity: 0, x: -6 });

      // Initial State for stacked narrative text blocks
      gsap.set('.text-slide-1', { opacity: 1, y: 0 });
      gsap.set('.text-slide-2, .text-slide-3, .text-slide-4, .text-slide-5, .text-slide-6', { opacity: 0, y: 20 });

      // 2. Master ScrollTrigger Timeline Setup
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=500%', // 5 full viewports of scroll space for 6 slides
          pin: sectionRef.current,
          pinSpacing: true,
          scrub: 0.5, // Cushioned scroll inputs for buttery smooth transitions
          snap: {
            snapTo: 1 / 5, // Snap exactly to 0.0, 0.2, 0.4, 0.6, 0.8, 1.0 (6 steps)
            duration: { min: 0.25, max: 0.5 }, // Faster snapping so it doesn't fight manual scroll
            delay: 0.05, // Slight delay before snapping to let scroll settle
            ease: 'power2.out' // Smooth deceleration ease for snapping
          },
          onUpdate: (self) => {
            const p = self.progress;
            const step = Math.round(p * 5); // Index 0 to 5
            const newScene = step + 1;

            // Only trigger React re-renders when the scene state boundaries are actually crossed
            if (currentSceneRef.current !== newScene) {
              currentSceneRef.current = newScene;
              setActiveScene(newScene);
            }

            // Compute dialogueStep dynamically based on slide 5 progress
            let newDialogue = 0;
            if (p >= 0.6 && p < 0.8) {
              const slide5Progress = (p - 0.6) / 0.2;
              if (slide5Progress < 0.33) {
                newDialogue = 1;
              } else if (slide5Progress >= 0.33 && slide5Progress < 0.66) {
                newDialogue = 2;
              } else {
                newDialogue = 3;
              }
            }
            if (currentDialogueRef.current !== newDialogue) {
              currentDialogueRef.current = newDialogue;
              setDialogueStep(newDialogue);
            }
          }
        }
      });

      // Subtle, premium cinematic zoom on the canvas wrapper across the whole timeline
      tl.to('.morphing-canvas-wrapper', { scale: 1.08, ease: 'none', duration: 5 }, 0);

      // ─── TRANSITION: State 1 -> State 2 (Time 0 to 1) ───
      // Overlapping text slide fade out/in (removes visual dead zones, shortened for fast responsive transitions)
      tl.to('.text-slide-1', { opacity: 0, y: -20, duration: 0.4, ease: 'power2.inOut' }, 0)
        .to('.text-slide-2', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.inOut' }, 0.4);

      // Reader shifts left side-by-side to open space on the right for ledger panel (tightened gap)
      tl.to('.actor-reader', { x: -150, scale: 0.85, duration: 1.0, ease: 'power1.inOut' }, 0);

      // Card enters frame & taps the reader at shifted position
      tl.to('.actor-card', { x: -150, y: 0, z: 0, rotateX: 8, rotateY: -5, rotateZ: 0, scale: 0.85, opacity: 1, duration: 1.0, ease: 'power1.inOut' }, 0);

      // Reader LED updates to green on tap
      tl.to('.reader-led', { borderColor: '#22C55E', backgroundColor: 'rgba(34, 197, 94, 0.15)', boxShadow: '0 0 12px rgba(34, 197, 94, 0.6)', duration: 0.3, ease: 'none' }, 0.7)
        .to('.reader-status-standby', { opacity: 0, duration: 0.2 }, 0.7)
        .to('.reader-status-ready', { opacity: 1, duration: 0.2 }, 0.7);

      // Contactless ripple animation triggers
      tl.to('.ripple-bubble', { scale: 2.0, opacity: 0.8, duration: 0.4, ease: 'power1.out' }, 0.6)
        .to('.ripple-bubble', { opacity: 0, duration: 0.2 }, 1.0);

      // Profile panel slides/fades in on the right (tightened gap)
      tl.to('.actor-profile', { x: 120, scale: 1, opacity: 1, pointerEvents: 'auto', duration: 0.8, ease: 'power1.inOut' }, 0.2);


      // ─── TRANSITION: State 2 -> State 3 (Time 1 to 2) ───
      // Overlapping text slide fade out/in
      tl.to('.text-slide-2', { opacity: 0, y: -20, duration: 0.4, ease: 'power2.inOut' }, 1.0)
        .to('.text-slide-3', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.inOut' }, 1.4);

      // Card exits (fades away to top)
      tl.to('.actor-card', { x: -130, y: -60, scale: 0.75, opacity: 0, duration: 0.5, ease: 'power1.inOut' }, 1.0);

      // Profile ledger panel exits quickly to left
      tl.to('.actor-profile', { x: -60, scale: 0.8, opacity: 0, pointerEvents: 'none', duration: 0.6, ease: 'power1.inOut' }, 1.0);

      // Reader shifts slightly further left & shrinks (tightened gap)
      tl.to('.actor-reader', { scale: 0.82, x: -160, duration: 0.8, ease: 'power1.inOut' }, 1.0);

      // Smartphone panel enters on the right side-by-side (tightened gap)
      tl.to('.actor-phone', { x: 100, scale: 1, opacity: 1, pointerEvents: 'auto', duration: 0.8, ease: 'power1.inOut' }, 1.1);

      // Notification banner pops inside phone screen
      tl.to('.phone-notification', { y: 0, opacity: 1, duration: 0.5, ease: 'power1.inOut' }, 1.4);


      // ─── TRANSITION: State 3 -> State 4 (Time 2 to 3) ───
      // Overlapping text slide fade out/in
      tl.to('.text-slide-2', { pointerEvents: 'none', duration: 0 }, 2.0); // Cleanup pointer events
      tl.to('.text-slide-3', { opacity: 0, y: -20, duration: 0.4, ease: 'power2.inOut' }, 2.0)
        .to('.text-slide-4', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.inOut' }, 2.4);

      // Smartphone Panel exits left
      tl.to('.actor-phone', { x: -80, scale: 0.8, opacity: 0, pointerEvents: 'none', duration: 0.8, ease: 'power1.inOut' }, 2.0);

      // Reader shifts slightly more left to make room for list panel (tightened gap)
      tl.to('.actor-reader', { scale: 0.78, x: -170, duration: 0.8, ease: 'power1.inOut' }, 2.0);

      // Absentee list panel slides in on the right (tightened gap)
      tl.to('.actor-list', { x: 120, scale: 1, opacity: 1, pointerEvents: 'auto', duration: 0.8, ease: 'power1.inOut' }, 2.1);

      // LED indicator on reader becomes amber to alert anomaly
      tl.to('.reader-led', { borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.15)', boxShadow: '0 0 12px rgba(245, 158, 11, 0.6)', duration: 0.3, ease: 'none' }, 2.2);


      // ─── TRANSITION: State 4 -> State 5 (Time 3 to 4) ───
      // Overlapping text slide fade out/in
      tl.to('.text-slide-3', { pointerEvents: 'none', duration: 0 }, 3.0);
      tl.to('.text-slide-4', { opacity: 0, y: -20, duration: 0.4, ease: 'power2.inOut' }, 3.0)
        .to('.text-slide-5', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.inOut' }, 3.4);

      // RFID Reader exits off-screen bottom-left
      tl.to('.actor-reader', { x: -320, y: 150, scale: 0, opacity: 0, duration: 0.8, ease: 'power1.inOut' }, 3.0);

      // Absentee list panel exits left
      tl.to('.actor-list', { x: -90, scale: 0.8, opacity: 0, pointerEvents: 'none', duration: 0.8, ease: 'power1.inOut' }, 3.0);

      // AI Call dialog panel enters centered
      tl.to('.actor-call', { x: 0, y: 0, scale: 1, opacity: 1, pointerEvents: 'auto', duration: 0.8, ease: 'power1.inOut' }, 3.1);

      // Outbound call transcript dialogues enter sequentially
      tl.to('.dialogue-bubble-1', { opacity: 1, x: 0, duration: 0.4, ease: 'power1.inOut' }, 3.4)
        .to('.dialogue-bubble-2', { opacity: 1, x: 0, duration: 0.4, ease: 'power1.inOut' }, 3.6)
        .to('.dialogue-bubble-3', { opacity: 1, x: 0, duration: 0.4, ease: 'power1.inOut' }, 3.8);


      // ─── TRANSITION: State 5 -> State 6 (Time 4 to 5) ───
      // Overlapping text slide fade out/in
      tl.to('.text-slide-4', { pointerEvents: 'none', duration: 0 }, 4.0);
      tl.to('.text-slide-5', { opacity: 0, y: -20, duration: 0.4, ease: 'power2.inOut' }, 4.0)
        .to('.text-slide-6', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.inOut' }, 4.4);

      // AI Call panel scales down and shifts to supporting bottom-right position
      tl.to('.actor-call', { x: 240, y: 65, scale: 0.62, duration: 0.8, ease: 'power1.inOut' }, 4.0);

      // Dashboard Left Panel (Operations Deck) slides/fades in
      tl.to('.actor-dash-left', { x: 0, opacity: 1, pointerEvents: 'auto', duration: 0.8, ease: 'power1.inOut' }, 4.1);

      // Dashboard Bottom Status entry fades in
      tl.to('.actor-dash-bottom', { y: 0, opacity: 1, pointerEvents: 'auto', duration: 0.8, ease: 'power1.inOut' }, 4.1);

      // Daily scan chart path draws live
      tl.to('.chart-path', { strokeDashoffset: 0, duration: 0.8, ease: 'power1.inOut' }, 4.1);

      // Chart gradient fill area fades in
      tl.to('.chart-glow-path', { opacity: 1, duration: 0.4, ease: 'none' }, 4.6);

    }, containerRef);

    // Refresh ScrollTrigger calculations after full hydration
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, []);

  // ─── GSAP SCROLLTRIGGER FOR EMOTIONAL KEYNOTE SECTION ───
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: emotionalContainerRef.current,
        start: 'top top',
        end: '+=600%', // 6 full viewports of scroll space for 7 slides
        pin: emotionalSectionRef.current,
        pinSpacing: true,
        scrub: 0.5,
        snap: {
          snapTo: 1 / 6,
          duration: { min: 0.25, max: 0.5 },
          delay: 0.05,
          ease: 'power2.out',
        },
        onUpdate: (self) => {
          const p = self.progress;
          const step = Math.round(p * 6); // 0 to 6
          const newStep = step + 1; // 1 to 7

          if (currentEmotionalStateRef.current !== newStep) {
            currentEmotionalStateRef.current = newStep;
            setEmotionalState(newStep);
          }
        },
      });
    }, emotionalContainerRef);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, []);



  return (
    <div className="cinematic-root relative min-h-screen">
      {/* Premium custom trailing cursor */}
      <CustomCursor />

      {/* Grid and noise background layers */}
      <div className="cinematic-grid" />
      <div className="cinematic-dots" />
      <div className="cinematic-noise" />

      {/* Ambient background spotlights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[10%] w-[45%] aspect-square rounded-full bg-radial from-[#4F46E5]/10 to-transparent blur-3xl" />
        <div className="absolute bottom-[20%] right-[10%] w-[40%] aspect-square rounded-full bg-radial from-[#06B6D4]/5 to-transparent blur-3xl" />
      </div>

      {/* Fixed geometric navigation header */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/[0.04] bg-[#0A0A0A]/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-5.5 h-5.5 rounded bg-gradient-to-tr from-[#4F46E5] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-[9px] font-black text-white font-mono">A</span>
            </div>
            <span className="font-extrabold text-[10.5px] font-mono tracking-widest text-white uppercase select-none">
              Attend<span className="text-indigo-400">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded border border-white/[0.05] bg-white/[0.02] text-[8px] font-mono text-zinc-550 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] led-status" />
              Roster Sync Online
            </span>
            <Link 
              href={dashLink}
              data-magnetic
              className="inline-flex items-center justify-center px-4.5 py-1.5 rounded border border-white/10 bg-white hover:bg-zinc-200 text-black font-semibold text-[9px] font-mono tracking-widest uppercase transition-all shadow-xl hover:-translate-y-0.5"
            >
              Access Portal
            </Link>
          </div>
        </div>
      </header>

      {/* ─── SCROLL TRIGGER PRESENTATION CONTAINER ─── */}
      <div ref={containerRef} className="relative w-full z-10">
        
        {/* Pinned presentation viewport */}
        <div ref={sectionRef} className="relative w-full h-screen flex items-center overflow-hidden">
          
          <div className="max-w-6xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 items-center gap-16 relative z-10">
            
            {/* LEFT COLUMN: Narrative stacked slides */}
            <div className="lg:col-span-5 relative z-20 pointer-events-none text-left select-none min-h-[300px] md:min-h-[280px]">
              
              {/* Slide 1 */}
              <div className="text-slide-1 space-y-4 absolute top-0 left-0 w-full">
                <div className="text-[8.5px] font-mono tracking-widest text-zinc-500 uppercase">01 // TELEMETRY GATE</div>
                <h1 className="text-4xl md:text-5xl font-bold leading-[1.05] text-white">
                  Students tap in.<br/>
                  AttendAI takes over.
                </h1>
                <p className="text-[12.5px] text-zinc-400 font-light leading-relaxed max-w-sm">
                  Proximity scans verify check-in logs. Edge gate commits roster sync in 8ms.
                </p>
              </div>

              {/* Slide 2 */}
              <div className="text-slide-2 space-y-4 absolute top-0 left-0 w-full opacity-0">
                <div className="text-[8.5px] font-mono tracking-widest text-indigo-400 uppercase">02 // CLOUD INGESTION</div>
                <h1 className="text-4xl md:text-5xl font-bold leading-[1.05] text-white">
                  Roster ledger<br/>
                  sync complete.
                </h1>
                <p className="text-[12.5px] text-zinc-400 font-light leading-relaxed max-w-sm">
                  Database matching confirms identification. Student status updates instantly to Present.
                </p>
              </div>

              {/* Slide 3 */}
              <div className="text-slide-3 space-y-4 absolute top-0 left-0 w-full opacity-0">
                <div className="text-[8.5px] font-mono tracking-widest text-[#22C55E] uppercase font-bold">03 // PUSH TELEMETRY</div>
                <h1 className="text-4xl md:text-5xl font-bold leading-[1.05] text-white">
                  Parent safety<br/>
                  alert delivered.
                </h1>
                <p className="text-[12.5px] text-zinc-400 font-light leading-relaxed max-w-sm">
                  WhatsApp & SMS notifications route immediately. Safe arrival confirmed in real-time.
                </p>
              </div>

              {/* Slide 4 */}
              <div className="text-slide-4 space-y-4 absolute top-0 left-0 w-full opacity-0">
                <div className="text-[8.5px] font-mono tracking-widest text-[#F59E0B] uppercase font-bold">04 // ANOMALY DETECT</div>
                <h1 className="text-4xl md:text-5xl font-bold leading-[1.05] text-white">
                  Missing check-ins<br/>
                  auto flagged.
                </h1>
                <p className="text-[12.5px] text-zinc-400 font-light leading-relaxed max-w-sm">
                  Roster thresholds check limits. Absent students highlighted automatically at lock-off time.
                </p>
              </div>

              {/* Slide 5 */}
              <div className="text-slide-5 space-y-4 absolute top-0 left-0 w-full opacity-0">
                <div className="text-[8.5px] font-mono tracking-widest text-indigo-400 uppercase">05 // OUTBOUND SIP CALL</div>
                <h1 className="text-4xl md:text-5xl font-bold leading-[1.05] text-white">
                  AI voice agent<br/>
                  inquiring parents.
                </h1>
                <p className="text-[12.5px] text-zinc-400 font-light leading-relaxed max-w-sm">
                  Autonomous dialer establishes call. Transcript excuses processed and parsed live.
                </p>
              </div>

              {/* Slide 6 */}
              <div className="text-slide-6 space-y-4 absolute top-0 left-0 w-full opacity-0">
                <div className="text-[8.5px] font-mono tracking-widest text-[#22C55E] uppercase font-bold">06 // LOOP COMPLETE</div>
                <h1 className="text-4xl md:text-5xl font-bold leading-[1.05] text-white">
                  Secure operational<br/>
                  harmony.
                </h1>
                <p className="text-[12.5px] text-zinc-400 font-light leading-relaxed max-w-sm">
                  Medical leave cataloged directly to dashboard roster. Zero administrative overhead.
                </p>
              </div>

            </div>

            {/* RIGHT COLUMN: Interactive Morphing Canvas */}
            <div className="lg:col-span-7 h-[55vh] flex items-center justify-center relative perspective-1000 select-none">
              
              <div className="morphing-canvas-wrapper relative w-full h-full flex items-center justify-center">

                {/* ─── ACTOR 1: 3D RFID READER ─── */}
                <div className="actor-reader absolute z-10 w-52 h-72 pointer-events-none" style={{ transition: 'none' }}>
                  <motion.div
                    style={{
                      rotateX: tiltX,
                      rotateY: tiltY,
                      transformStyle: 'preserve-3d',
                    }}
                    className="w-full h-full rounded-2xl bg-gradient-to-b from-[#18181B] to-[#0D0D0F] border border-white/[0.08] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.95)] flex flex-col items-center justify-between p-4 overflow-hidden"
                  >
                    {/* Reflected glare filter */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-white/[0.03]" />

                    {/* Status LED ring */}
                    <div className="w-full flex justify-center pt-1">
                      <div className="w-12 h-1.5 rounded-full border reader-led bg-indigo-600/15 border-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]" />
                    </div>

                    {/* Center contactless radar */}
                    <div className="w-22 h-22 rounded-full border border-white/5 bg-white/[0.01] flex items-center justify-center relative" style={{ transform: 'translateZ(15px)' }}>
                      <div className="w-18 h-18 rounded-full border border-dashed border-white/10 animate-spin" style={{ animationDuration: '20s' }} />
                      <div className="absolute w-10 h-10 rounded-full bg-gradient-to-tr from-white/[0.02] to-white/[0.05] flex items-center justify-center border border-white/10">
                        <svg className="w-4.5 h-4.5 text-zinc-650" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M5 10c0-3.87 3.13-7 7-7s7 3.13 7 7M2 13h20M12 13v7" />
                        </svg>
                      </div>

                      {/* Ripple tap bubble */}
                      <div className="ripple-bubble absolute inset-0 rounded-full border border-indigo-500/40 opacity-0" />
                    </div>

                    {/* Small system output */}
                    <div className="w-full bg-black/55 border border-white/5 rounded-lg p-2 font-mono text-[7px] text-zinc-550" style={{ transform: 'translateZ(8px)' }}>
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-zinc-650">SYS_EDG</span>
                        <span>ONLINE</span>
                      </div>
                      <div className="h-3 flex items-center justify-center text-center relative w-full">
                        <span className="reader-status-standby text-zinc-650 animate-pulse block">STANDBY FOR SCANS</span>
                        <span className="reader-status-ready text-[#22C55E] font-bold absolute opacity-0 block">NFC READY</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* ─── ACTOR 2: RFID STUDENT CARD (Approaching & Tapping) ─── */}
                <div className="actor-card absolute w-44 h-28 rounded-xl bg-gradient-to-br from-indigo-950/80 via-zinc-900/90 to-black border border-indigo-500/25 shadow-[0_12px_30px_rgba(0,0,0,0.85)] p-3 flex flex-col justify-between z-20 pointer-events-none" style={{ transition: 'none' }}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent" />
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[8.5px] font-bold text-white tracking-wide">RAHUL VERMA</div>
                      <div className="text-[6px] font-mono text-zinc-550">ID: 84920</div>
                    </div>
                    <div className="w-3.5 h-3.5 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-mono text-[6px] text-white font-bold">A</div>
                  </div>
                  <div className="flex justify-between items-end border-t border-white/5 pt-1.5 font-mono text-[5px] text-zinc-650">
                    <span>NFC SECURITY</span>
                    <span className="text-indigo-400 font-bold">CARD SCANNED</span>
                  </div>
                </div>

                {/* ─── ACTOR 3: STUDENT PROFILE LEDGER ─── */}
                <div className="actor-profile absolute w-72 cinematic-card p-4.5 border border-white/[0.06] shadow-2xl flex flex-col gap-3 text-left pointer-events-none" style={{ transition: 'none' }}>
                  <div className="flex items-center gap-3 border-b border-white/5 pb-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-white text-[10px]">RV</div>
                    <div>
                      <div className="text-[10px] font-bold text-white">Rahul Verma</div>
                      <div className="text-[7.5px] font-mono text-indigo-400 font-bold uppercase tracking-wider">Present • Checked in 08:30:04</div>
                    </div>
                  </div>
                  <div className="space-y-1.5 font-mono text-[8px] text-zinc-400">
                    <div className="flex justify-between items-center text-zinc-550 border-b border-white/5 pb-1">
                      <span>PARAMETER DIAGNOSTIC</span>
                      <span>SYNC STATE</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Classroom Gate Gateway</span>
                      <span className="text-[#22C55E] font-bold">GATEWAY_01 OK</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Ledger sync latency</span>
                      <span className="text-zinc-300">8.2 milliseconds</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Cloud DB synchronization</span>
                      <span className="text-[#22C55E] flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-[#22C55E] led-status" /> VERIFIED
                      </span>
                    </div>
                  </div>
                </div>

                {/* ─── ACTOR 4: SMARTPHONE NOTIFICATION PUSH ─── */}
                <div className="actor-phone absolute w-52 h-80 rounded-[24px] bg-[#0A0A0A] border-[3px] border-zinc-800 shadow-2xl p-3 flex flex-col justify-between pointer-events-none" style={{ transition: 'none' }}>
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-14 h-3 bg-zinc-800 rounded-full flex items-center justify-center">
                    <span className="w-4 h-0.5 bg-zinc-750 rounded-full" />
                  </div>

                  <div className="flex justify-between items-center font-mono text-[6.5px] text-zinc-550 pt-2 px-1">
                    <span>08:30</span>
                    <span>LTE WIFI</span>
                  </div>

                  <div className="flex-1 flex items-center justify-center p-2">
                    <div className="phone-notification w-full bg-[#141414]/95 border border-indigo-500/25 p-3 rounded-xl flex items-start gap-2 text-left opacity-0" style={{ transition: 'none' }}>
                      <div className="w-6 h-6 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                        <span className="text-[8px] font-mono font-bold">A</span>
                      </div>
                      <div>
                        <div className="text-[8.5px] font-bold text-white flex justify-between items-center">
                          <span>AttendAI Roster</span>
                          <span className="text-[6.5px] text-zinc-550 font-mono">now</span>
                        </div>
                        <p className="text-[7.5px] text-zinc-400 leading-snug pt-0.5">Rahul Verma checked in safely at GATE_01 (08:30:04 AM).</p>
                      </div>
                    </div>
                  </div>

                  <div className="w-16 h-0.5 bg-zinc-650 rounded-full mx-auto mb-1" />
                </div>

                {/* ─── ACTOR 5: ABSENT RISK LEDGER ─── */}
                <div className="actor-list absolute w-72 cinematic-card p-4 border border-white/[0.06] shadow-2xl flex flex-col gap-3.5 text-left pointer-events-none" style={{ transition: 'none' }}>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[8.5px] font-mono text-zinc-550 uppercase">ABSENTEES LIST (UNEXCUSED)</span>
                    <span className="text-[7px] font-mono text-red-500 font-bold bg-red-500/5 px-2 py-0.5 border border-red-500/15 rounded">ROSTER LIMIT SHUT</span>
                  </div>
                  <div className="space-y-1.5 font-mono text-[8px]">
                    {[
                      { name: 'Rahul Verma', time: '08:30 AM', status: 'PRESENT', col: 'text-[#22C55E]' },
                      { name: 'Kabir Mehta', time: '08:42 AM', status: 'PRESENT', col: 'text-[#22C55E]' },
                      { name: 'Rohan Sen', time: '——', status: 'ABSENT ANOMALY', col: 'text-red-500 font-extrabold animate-pulse' }
                    ].map((row, idx) => (
                      <div 
                        key={idx} 
                        className={`flex justify-between items-center p-2 rounded border ${
                          row.status.includes('ABSENT') 
                            ? 'bg-red-500/5 border-red-500/25 shadow-lg shadow-red-500/5' 
                            : 'bg-black/30 border-white/5'
                        }`}
                      >
                        <span>{row.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-650">{row.time}</span>
                          <span className={`${row.col} text-[7.5px]`}>{row.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ─── ACTOR 6: GLASS AI CALL SIP INTERFACE ─── */}
                <div className="actor-call absolute z-20 w-64 cinematic-card p-4.5 border border-indigo-500/20 bg-[#141414]/90 flex flex-col gap-3.5 shadow-2xl text-left pointer-events-none" style={{ transition: 'none' }}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />

                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 led-status" />
                      <span className="text-[7.5px] font-mono text-indigo-400 uppercase tracking-widest font-bold">AI Voice Channel #8401</span>
                    </div>
                    <span className="text-[7px] font-mono text-zinc-555">ESTABLISHED</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-[9.5px] font-bold text-white">Rohan Sen (Parent Outbound)</div>
                      <span className="text-[7px] font-mono text-zinc-550">+91 98XXX XXX10</span>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  </div>

                  <div className="h-9 bg-black/40 border border-white/5 rounded-lg flex items-center justify-center px-3 relative overflow-hidden">
                    <AudioWaveform activeScene={activeScene} dialogueStep={dialogueStep} />
                  </div>

                  <div className="space-y-3 pt-0.5 text-[8px] font-mono leading-relaxed relative">
                    <div className="dialogue-bubble-1 flex gap-2 opacity-0" style={{ transition: 'none' }}>
                      <span className="text-indigo-400 font-bold">[AI]:</span>
                      <p className="text-zinc-350">Rohan was absent from check-in. Is he sick today?</p>
                    </div>
                    <div className="dialogue-bubble-2 flex gap-2 justify-end text-right opacity-0" style={{ transition: 'none' }}>
                      <p className="text-zinc-350">Yes, he has a mild fever.</p>
                      <span className="text-zinc-650 font-bold">[PARENT]:</span>
                    </div>
                    <div className="dialogue-bubble-3 flex gap-2 opacity-0" style={{ transition: 'none' }}>
                      <span className="text-indigo-400 font-bold">[AI]:</span>
                      <p className="text-[#22C55E]">Excused logged. Roster updated.</p>
                    </div>
                  </div>
                </div>

                {/* ─── ACTOR 7: DASHBOARD BACKGROUND PANELS ─── */}
                <div className="actor-dash-left absolute z-10 w-72 h-[340px] cinematic-card p-4 border border-white/[0.08] bg-[#0E1210]/95 flex flex-col gap-4 text-left pointer-events-none" style={{ transition: 'none' }}>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                      <span className="text-[7.5px] font-mono text-[#22C55E] tracking-widest font-bold">OPERATIONS DECK</span>
                    </div>
                    <span className="text-[7px] font-mono text-zinc-550">SYNC_STATUS: VERIFIED</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'PRESENT RATIO', val: '93.5% (1328)', color: 'text-[#22C55E]' },
                      { label: 'AI EXCUSED', val: '6.5% (92)', color: 'text-indigo-400' }
                    ].map((card, i) => (
                      <div key={i} className="bg-black/30 border border-white/5 p-2 rounded flex flex-col justify-between">
                        <span className="text-[6.5px] font-mono text-zinc-550 block">{card.label}</span>
                        <span className={`text-[10px] font-mono font-bold ${card.color} pt-0.5`}>{card.val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex-1 bg-black/40 border border-white/5 p-3 rounded-lg flex flex-col justify-between">
                    <div className="flex justify-between items-center text-[7px] font-mono text-zinc-550">
                      <span>DAILY SCAN TELEMETRY</span>
                      <span className="text-[#22C55E] font-bold">OK</span>
                    </div>

                    <div className="h-24 w-full relative pt-2">
                      <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.18"/>
                            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        <line x1="0" y1="20" x2="400" y2="20" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                        <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                        <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

                        <path
                          className="chart-path"
                          d="M 10 90 L 70 85 L 140 70 L 210 75 L 280 40 L 350 42 L 390 20"
                          fill="none"
                          stroke="#4F46E5"
                          strokeWidth="2.5"
                          style={{ strokeDasharray: 400, strokeDashoffset: 400, transition: 'none' }}
                        />
                        <path
                          className="chart-glow-path"
                          d="M 10 90 L 70 85 L 140 70 L 210 75 L 280 40 L 350 42 L 390 20 L 390 100 L 10 100 Z"
                          fill="url(#chart-glow)"
                          style={{ opacity: 0, transition: 'none' }}
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Dashboard Bottom Roster Logging entry */}
                <div className="actor-dash-bottom absolute bottom-1 right-0 left-0 bg-black/60 border border-[#22C55E]/15 p-2 rounded-lg flex items-center justify-between font-mono text-[7px] z-10 pointer-events-none" style={{ transition: 'none' }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    <span className="text-[#22C55E] font-bold uppercase">LEDGER SYNC APPROVED</span>
                    <span className="text-zinc-650">|</span>
                    <span className="text-zinc-300">Rohan Sen • Absentee excused via voice Outbound SIP</span>
                  </div>
                  <span className="text-[#22C55E] font-bold bg-[#22C55E]/10 px-1.5 py-0.5 border border-[#22C55E]/20 rounded text-[6.5px]">
                    ROSTER_AUTO_SYNC
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* Dynamic scroll down mouse indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none z-30 select-none">
            <span className="text-[7.5px] font-mono text-zinc-550 uppercase tracking-widest">SCROLL TO WALK THROUGH PRODUCT</span>
            <div className="w-4.5 h-7.5 rounded-full border border-white/10 flex justify-center p-1.5">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1 h-1.5 rounded-full bg-zinc-500"
              />
            </div>
          </div>

        </div>

      </div>

      {/* ─── THE COST OF SILENCE (EMOTIONAL KEYNOTE SECTION) ─── */}
      <div 
        ref={emotionalContainerRef} 
        className="relative w-full z-10 overflow-hidden"
        style={{ backgroundColor: '#050505' }}
      >
        <div 
          ref={emotionalSectionRef} 
          className="relative w-full h-screen flex flex-col items-center justify-center transition-colors duration-1000"
          style={{ backgroundColor: emotionalState >= 3 ? '#000000' : '#050505' }}
        >
          {/* Grid and noise overlays matching the premium aesthetic */}
          <div className="absolute inset-0 bg-transparent opacity-10 cinematic-grid pointer-events-none" />
          <div className="absolute inset-0 bg-transparent opacity-30 cinematic-noise pointer-events-none" />
          
          {/* Ambient accent stage light glow for State 6 & 7 */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div 
              className={`absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[70%] aspect-square rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.12)_0%,rgba(79,70,229,0)_70%)] blur-[100px] transition-opacity duration-1000 ${
                emotionalState >= 6 ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>

          <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {emotionalState === 1 && (
                <motion.div
                  key="state-1"
                  initial={{ opacity: 0, filter: 'blur(15px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(15px)' }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center text-center space-y-4"
                >
                  <span className="text-[9px] font-mono tracking-[0.2em] text-zinc-550 uppercase">The Cost of Silence // 01</span>
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-white leading-tight">
                    One student misses class.
                  </h2>
                </motion.div>
              )}

              {emotionalState === 2 && (
                <motion.div
                  key="state-2"
                  initial={{ opacity: 0, filter: 'blur(15px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(15px)' }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center text-center space-y-4"
                >
                  <span className="text-[9px] font-mono tracking-[0.2em] text-zinc-550 uppercase">The Cost of Silence // 02</span>
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-white leading-tight">
                    Nobody notices.
                  </h2>
                </motion.div>
              )}

              {emotionalState === 3 && (
                <motion.div
                  key="state-3"
                  initial={{ opacity: 0, filter: 'blur(15px)', scale: 0.98 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', scale: 1.01 }}
                  exit={{ opacity: 0, filter: 'blur(15px)', scale: 1.03 }}
                  transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center text-center space-y-4"
                >
                  <span className="text-[9px] font-mono tracking-[0.2em] text-zinc-550 uppercase">The Cost of Silence // 03</span>
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-white leading-tight">
                    Nobody follows up.
                  </h2>
                </motion.div>
              )}

              {emotionalState === 4 && (
                <motion.div
                  key="state-4"
                  initial={{ opacity: 0, filter: 'blur(15px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(15px)' }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center text-center space-y-8"
                >
                  <div className="space-y-4">
                    <span className="text-[9px] font-mono tracking-[0.2em] text-zinc-550 uppercase">The Cost of Silence // 04</span>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-white leading-tight">
                      The parent remains unaware.
                    </h2>
                  </div>
                  
                  {/* Subtle silent timeline */}
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                    className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 pt-4"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-zinc-650" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                      </svg>
                      <span className="text-xs font-mono text-zinc-550 line-through decoration-zinc-700/60 tracking-wider">No notifications</span>
                    </div>
                    <div className="hidden sm:block h-[1px] w-8 bg-zinc-800" />
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-zinc-650" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                      </svg>
                      <span className="text-xs font-mono text-zinc-550 line-through decoration-zinc-700/60 tracking-wider">No communication</span>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {emotionalState === 5 && (
                <motion.div
                  key="state-5"
                  initial={{ opacity: 0, filter: 'blur(20px)', scale: 0.96 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                  exit={{ opacity: 0, filter: 'blur(20px)' }}
                  transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center text-center space-y-4"
                >
                  <span className="text-[9px] font-mono tracking-[0.2em] text-zinc-550 uppercase">The Cost of Silence // 05</span>
                  <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-none">
                    The student disengages.
                  </h2>
                </motion.div>
              )}

              {emotionalState === 6 && (
                <motion.div
                  key="state-6"
                  initial={{ opacity: 0, filter: 'blur(15px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(15px)' }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center text-center w-full max-w-md"
                >
                  <span className="text-[9px] font-mono tracking-[0.2em] text-[#4F46E5] font-bold uppercase mb-4">The Cost of Silence // 06</span>
                  <h2 className="text-4xl md:text-5xl font-light tracking-tight text-white leading-tight mb-8">
                    <span className="text-[#4F46E5] font-bold">AttendAI</span> intervenes.
                  </h2>
                  
                  {/* Beautiful vertical flow timeline */}
                  <div className="relative flex flex-col items-center w-full mt-2 pb-6">
                    {/* Connecting line */}
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: 'calc(100% - 24px)' }}
                      transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.2 }}
                      className="absolute top-4 w-[1px] bg-gradient-to-b from-[#4F46E5] via-[#4F46E5]/50 to-[#22C55E]"
                    />

                    {/* Nodes container */}
                    <motion.div 
                      variants={{
                        hidden: { opacity: 0 },
                        show: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.25,
                            delayChildren: 0.3
                          }
                        }
                      }}
                      initial="hidden"
                      animate="show"
                      className="w-full space-y-8 z-10"
                    >
                      {[
                        { title: 'Absent Student', sub: 'Anomaly flagged automatically', color: 'text-white/80', dotColor: 'bg-white/40 border-white/20' },
                        { title: 'Parent Notified', sub: 'Secure telemetry dispatched', color: 'text-[#4F46E5]', dotColor: 'bg-[#4F46E5] shadow-[0_0_10px_rgba(79,70,229,0.5)] border-[#4F46E5]' },
                        { title: 'AI Follow-Up', sub: 'Conversational agent dials outbound', color: 'text-[#4F46E5]', dotColor: 'bg-[#4F46E5] shadow-[0_0_10px_rgba(79,70,229,0.5)] border-[#4F46E5]' },
                        { title: 'Reason Logged', sub: 'Verbal response categorized live', color: 'text-[#4F46E5]', dotColor: 'bg-[#4F46E5] shadow-[0_0_10px_rgba(79,70,229,0.5)] border-[#4F46E5]' },
                        { title: 'Issue Resolved', sub: 'Dashboard ledger sync complete', color: 'text-[#22C55E]', dotColor: 'bg-[#22C55E] shadow-[0_0_10px_rgba(34,197,94,0.5)] border-[#22C55E]' }
                      ].map((node, index) => (
                        <motion.div 
                          key={index}
                          variants={{
                            hidden: { opacity: 0, y: 10, filter: 'blur(5px)' },
                            show: { opacity: 1, y: 0, filter: 'blur(0px)' }
                          }}
                          className="flex items-center gap-6 justify-center"
                        >
                          <div className="w-1/2 text-right">
                            <span className={`text-[11px] font-mono tracking-widest uppercase font-bold ${node.color}`}>
                              {node.title}
                            </span>
                          </div>
                          
                          <div className="relative flex items-center justify-center">
                            <div className={`w-3.5 h-3.5 rounded-full border-2 ${node.dotColor} z-10 transition-all duration-500`} />
                          </div>

                          <div className="w-1/2 text-left">
                            <span className="text-[8.5px] font-mono text-zinc-500 tracking-wider">
                              {node.sub}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {emotionalState === 7 && (
                <motion.div
                  key="state-7"
                  initial={{ opacity: 0, filter: 'blur(20px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(20px)' }}
                  transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center text-center space-y-6 max-w-4xl px-4"
                >
                  <span className="text-[9px] font-mono tracking-[0.2em] text-[#4F46E5] font-bold uppercase">The Cost of Silence // Final</span>
                  <h2 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-tight font-sans">
                    No absent student<br />
                    goes unnoticed.
                  </h2>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-xs md:text-sm font-mono text-white tracking-[0.25em] uppercase pt-2"
                  >
                    Because attendance should trigger action.
                  </motion.p>

                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
                    className="pt-8"
                  >
                    <Link 
                      href={dashLink}
                      className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-[9px] font-mono tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95"
                    >
                      Access Roster Portal
                    </Link>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stepper indicator dots like Apple keynote/slideshow style */}
          <div className="absolute bottom-10 flex gap-2.5 z-20">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <div 
                key={num}
                className={`h-1 rounded-full transition-all duration-500 ${
                  emotionalState === num 
                    ? 'w-6 bg-white' 
                    : num === 6 || num === 7 
                      ? 'w-1.5 bg-[#4F46E5]/40' 
                      : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>

        </div>
      </div>

      {/* Bottom Footer Section (revealed naturally when scrolling past the locked hero) */}
      <footer className="relative w-full py-16 bg-[#070707] border-t border-white/[0.04] z-20 flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-center gap-2">
            <div className="w-5.5 h-5.5 rounded bg-gradient-to-tr from-[#4F46E5] to-[#06B6D4] flex items-center justify-center">
              <span className="text-[8px] font-black text-white font-mono">A</span>
            </div>
            <span className="font-extrabold text-[10px] font-mono tracking-widest text-white uppercase">AttendAI</span>
          </div>
          <p className="text-zinc-500 text-xs font-light max-w-md mx-auto">
            Autonomous attendance tracking, absence anomaly detection, and conversational parent safety inquiries in one integrated ecosystem.
          </p>
          <div className="flex justify-center gap-8 text-[10px] font-mono text-zinc-650">
            <a href="#" className="hover:text-white transition-colors">STATUS: OPERATIONAL</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">API INTEGRATIONS</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">PRIVACY LEDGER</a>
          </div>
          <div className="text-[9px] font-mono text-zinc-700 pt-4">
            © {new Date().getFullYear()} AttendAI Technologies Inc. All telemetry encrypted.
          </div>
        </div>
      </footer>
    </div>
  );
}
