'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Props {
  isLoggedIn: boolean;
}

// ╔══════════════════════════════════════════════╗
// ║  PALETTE — Emerald & Graphite                ║
// ║  BG:      #f4f7f5  (soft mint mist)          ║
// ║  PRIMARY: #064e3b  (deep emerald green)      ║
// ║  ACCENT:  #374151  (charcoal graphite)       ║
// ╚══════════════════════════════════════════════╝
const T = {
  bg:          '#f4f7f5',
  card:        '#ffffff',
  teal:        '#064e3b',   // primary = deep emerald
  tealDark:    '#022c22',   // darker emerald for gradients
  tealSoft:    'rgba(6,78,59,0.07)',
  tealBorder:  'rgba(6,78,59,0.2)',
  amber:       '#374151',   // accent = charcoal graphite
  amberSoft:   'rgba(55,65,81,0.09)',
  amberBorder: 'rgba(55,65,81,0.28)',
  text:        '#111827',
  muted:       '#4b5563',
  border:      '#e2e8f0',
  line:        '#cbd5e1',
};

const STATS = [
  { value: '98.4%', label: 'Avg Attendance Rate' },
  { value: '2.3s',  label: 'Avg Scan Time'       },
  { value: '40k+',  label: 'Students Tracked'    },
  { value: '12k+',  label: 'AI Calls Made'       },
];

const FEATURES = [
  { icon: '🎓', title: 'Student Directory',     desc: 'Centralised registry with parent contacts, course history, and RFID credentials.',               accent: T.teal  },
  { icon: '📋', title: 'Batch Scheduler',       desc: 'Assign students to time-slot rosters and track cohort occupancy in real-time.',                  accent: T.amber },
  { icon: '🪪', title: 'QR ID Card Generator', desc: 'Bulk-generate print-ready student ID cards with embedded attendance barcodes.',                  accent: T.teal  },
  { icon: '📞', title: 'AI Voice Call Center', desc: 'Autonomous phone agents detect absences and make conversational parent calls automatically.',     accent: T.amber, flagship: true },
  { icon: '📊', title: 'Analytics & Reports',  desc: 'Attendance trends, absentee heatmaps, and batch performance — with downloadable PDF reports.',   accent: T.teal  },
  { icon: '🤖', title: 'Simulator Sandbox',    desc: 'Run an interactive mock of your full attendance pipeline — from card scan to parent call.',       accent: T.amber },
];

const HOW_STEPS = [
  { step: '01', icon: '🪪', label: 'Student scans card',  desc: 'RFID/barcode scanner registers entry in real-time.' },
  { step: '02', icon: '🔔', label: 'Absent flag raised',  desc: 'System detects missing students after cut-off.' },
  { step: '03', icon: '📞', label: 'AI dials parent',     desc: 'Voice agent makes a natural conversational call.' },
  { step: '04', icon: '✅', label: 'Outcome logged',      desc: 'Transcript & result saved to student record.' },
];

const ROWS = [
  { name: 'Aarav Sharma', status: 'Present',                    time: '17:02', dot: '#059669' },
  { name: 'Priya Patel',  status: 'Late',                       time: '17:19', dot: T.amber  },
  { name: 'Rohan Das',    status: 'Absent — AI Calling Parent', time: '—',     dot: '#dc2626' },
  { name: 'Ananya Rao',   status: 'Present',                    time: '17:01', dot: '#059669' },
];

function useCountUp(target: string, go: boolean) {
  const [v, setV] = useState('0');
  useEffect(() => {
    if (!go) return;
    const n = parseFloat(target.replace(/[^0-9.]/g, ''));
    const sfx = target.replace(/[0-9.]/g, '');
    if (isNaN(n)) { setV(target); return; }
    let cur = 0, s = 0; const steps = 60, ms = 1800 / steps;
    const t = setInterval(() => {
      s++; cur = Math.min(cur + n / steps, n);
      setV((Number.isInteger(n) ? Math.round(cur) : cur.toFixed(1)) + sfx);
      if (s >= steps) clearInterval(t);
    }, ms);
    return () => clearInterval(t);
  }, [go, target]);
  return v;
}

function StatCard({ value, label, go }: { value: string; label: string; go: boolean }) {
  const d = useCountUp(value, go);
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: '1 1 180px', minWidth: 160, padding: '32px 24px', textAlign: 'center',
        borderRadius: 18,
        background: hov ? T.teal : T.card,
        border: `1.5px solid ${hov ? T.teal : T.border}`,
        boxShadow: hov ? `0 16px 48px rgba(6,78,59,.22)` : '0 2px 12px rgba(26,26,24,.05)',
        transition: 'all .28s cubic-bezier(.34,1.56,.64,1)',
        transform: hov ? 'translateY(-5px)' : 'none',
        cursor: 'default',
      }}
    >
      <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1, color: hov ? '#fff' : T.teal }}>{d}</div>
      <div style={{ marginTop: 8, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: hov ? 'rgba(255,255,255,.72)' : T.muted }}>{label}</div>
    </div>
  );
}

export default function HomePageClient({ isLoggedIn }: Props) {
  const [go, setGo] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const dashLink = isLoggedIn ? '/dashboard' : '/login';
  // --- BACKGROUND CAROUSEL STATE ---
  const [bgSlide, setBgSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setBgSlide(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  // --- INTERACTIVE SIMULATOR STATE ---
  const [simState, setSimState] = useState<'idle' | 'scanning' | 'alert' | 'calling' | 'connected' | 'completed'>('idle');
  const [roster, setRoster] = useState([
    { name: 'Aarav Sharma', time: '—', status: 'Pending', color: '#6b7280' },
    { name: 'Priya Patel', time: '—', status: 'Pending', color: '#6b7280' },
    { name: 'Rohan Das', time: '—', status: 'Pending', color: '#6b7280' },
    { name: 'Ananya Rao', time: '—', status: 'Pending', color: '#6b7280' },
  ]);
  const [logs, setLogs] = useState<string[]>([
    'System standby. Awaiting RFID scan initialization...'
  ]);
  const [transcript, setTranscript] = useState<{ speaker: 'AI' | 'Parent'; text: string }[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<'AI' | 'Parent' | 'none'>('none');

  const logEndRef = useRef<HTMLDivElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const simTimeouts = useRef<NodeJS.Timeout[]>([]);

  // Auto-scroll logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollTop = logEndRef.current.scrollHeight;
    }
  }, [logs]);

  // Auto-scroll transcripts
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollTop = transcriptEndRef.current.scrollHeight;
    }
  }, [transcript]);

  const clearTimeouts = () => {
    simTimeouts.current.forEach(clearTimeout);
    simTimeouts.current = [];
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const startScans = () => {
    clearTimeouts();
    setSimState('scanning');
    setLogs(['[System Ready] Initiating Morning Attendance Session...']);
    setRoster([
      { name: 'Aarav Sharma', time: '—', status: 'Pending', color: '#6b7280' },
      { name: 'Priya Patel', time: '—', status: 'Pending', color: '#6b7280' },
      { name: 'Rohan Das', time: '—', status: 'Pending', color: '#6b7280' },
      { name: 'Ananya Rao', time: '—', status: 'Pending', color: '#6b7280' },
    ]);
    setTranscript([]);
    setActiveSpeaker('none');

    const t1 = setTimeout(() => {
      setRoster(prev => [
        { name: 'Aarav Sharma', time: '08:52 AM', status: 'Present', color: '#059669' },
        prev[1], prev[2], prev[3]
      ]);
      addLog('Scanner: RFID UID #2049 scanned. Aarav Sharma marked Present.');
    }, 1200);

    const t2 = setTimeout(() => {
      setRoster(prev => [
        prev[0], prev[1], prev[2],
        { name: 'Ananya Rao', time: '08:55 AM', status: 'Present', color: '#059669' }
      ]);
      addLog('Scanner: RFID UID #2088 scanned. Ananya Rao marked Present.');
    }, 2400);

    const t3 = setTimeout(() => {
      setRoster(prev => [
        prev[0],
        { name: 'Priya Patel', time: '08:58 AM', status: 'Late', color: T.amber },
        prev[2], prev[3]
      ]);
      addLog('Scanner: RFID UID #2071 scanned. Priya Patel marked Late.');
    }, 3600);

    const t4 = setTimeout(() => {
      setSimState('alert');
      setRoster(prev => [
        prev[0], prev[1],
        { name: 'Rohan Das', time: '—', status: 'Absent', color: '#dc2626' },
        prev[3]
      ]);
      addLog('System: Session cut-off reached. Rohan Das flagged ABSENT (Unexcused).');
      addLog('AI Action Engine: Alert queued. Ready to dispatch voice agent.');
    }, 5000);

    simTimeouts.current.push(t1, t2, t3, t4);
  };

  const startAICall = () => {
    setSimState('calling');
    addLog('AI Call Hub: Deploying autonomous voice agent...');
    addLog('AI Call Hub: Dialing parent contact (Mr. Das: +91 98765-XXXXX)...');

    const t1 = setTimeout(() => {
      setSimState('connected');
      addLog('AI Call Hub: Connection established. Live voice stream active.');
      setActiveSpeaker('AI');
      setTranscript(prev => [...prev, { speaker: 'AI', text: 'Hello, this is the AttendAI assistant calling from Coaching Hub. Rohan hasn\'t arrived for class today. Is everything okay?' }]);
    }, 1800);

    const t2 = setTimeout(() => {
      setActiveSpeaker('Parent');
      setTranscript(prev => [...prev, { speaker: 'Parent', text: 'Hi! Yes, Rohan has a high fever today, so we are keeping him home. I am sorry for not letting you know sooner.' }]);
    }, 5200);

    const t3 = setTimeout(() => {
      setActiveSpeaker('AI');
      setTranscript(prev => [...prev, { speaker: 'AI', text: 'Understood. I hope Rohan recovers quickly! I will mark his absence as Excused Sick in the system roster.' }]);
    }, 9500);

    const t4 = setTimeout(() => {
      setActiveSpeaker('Parent');
      setTranscript(prev => [...prev, { speaker: 'Parent', text: 'Thank you so much. That is very helpful!' }]);
    }, 13000);

    const t5 = setTimeout(() => {
      setActiveSpeaker('none');
      setSimState('completed');
      setRoster(prev => [
        prev[0], prev[1],
        { name: 'Rohan Das', time: '—', status: 'Excused (Sick)', color: '#374151' },
        prev[3]
      ]);
      addLog('AI Call Hub: Call completed successfully.');
      addLog('System Database: Rohan Das status updated to: Excused (Sick).');
    }, 15000);

    simTimeouts.current.push(t1, t2, t3, t4, t5);
  };

  const resetSim = () => {
    clearTimeouts();
    setSimState('idle');
    setRoster([
      { name: 'Aarav Sharma', time: '—', status: 'Pending', color: '#6b7280' },
      { name: 'Priya Patel', time: '—', status: 'Pending', color: '#6b7280' },
      { name: 'Rohan Das', time: '—', status: 'Pending', color: '#6b7280' },
      { name: 'Ananya Rao', time: '—', status: 'Pending', color: '#6b7280' },
    ]);
    setLogs([
      'System standby. Awaiting RFID scan initialization...'
    ]);
    setTranscript([]);
    setActiveSpeaker('none');
  };

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setGo(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => {
      obs.disconnect();
      clearTimeouts();
    };
  }, []);

  return (
    <div style={{
      height: '100vh',
      overflowY: 'scroll',
      scrollSnapType: 'y mandatory',
      scrollBehavior: 'smooth',
      background: T.bg,
      color: T.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
      overflowX: 'hidden',
    }}>

      <style>{`
        @keyframes up    { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink { 0%,100%{opacity:.35} 50%{opacity:1} }
        @keyframes wave-pulse {
          0%, 100% { transform: scaleY(0.25); }
          50% { transform: scaleY(1); }
        }

        .a1{animation:up .7s .05s cubic-bezier(.16,1,.3,1) both}
        .a2{animation:up .7s .18s cubic-bezier(.16,1,.3,1) both}
        .a3{animation:up .7s .30s cubic-bezier(.16,1,.3,1) both}
        .a4{animation:up .7s .44s cubic-bezier(.16,1,.3,1) both}
        .a5{animation:up .7s .60s cubic-bezier(.16,1,.3,1) both}

        .btn-teal{
          display:inline-flex;align-items:center;gap:8px;
          padding:14px 34px;border-radius:100px;
          background:${T.teal};color:#fff;
          font-weight:700;font-size:14px;letter-spacing:.02em;
          text-decoration:none;border:none;cursor:pointer;
          box-shadow:0 4px 24px rgba(6,78,59,.32);
          transition:transform .2s,box-shadow .2s;
        }
        .btn-teal:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 8px 36px rgba(6,78,59,.48);}

        .btn-outline{
          display:inline-flex;align-items:center;gap:8px;
          padding:13px 28px;border-radius:100px;
          background:transparent;color:${T.teal};
          font-weight:600;font-size:14px;letter-spacing:.02em;
          text-decoration:none;cursor:pointer;
          border:1.5px solid ${T.teal};
          transition:all .2s;
        }
        .btn-outline:hover{background:${T.teal};color:#fff;transform:translateY(-2px);}

        .nav-a{
          color:${T.muted};font-size:13px;font-weight:500;
          text-decoration:none;padding:6px 14px;border-radius:8px;
          transition:color .18s,background .18s;
        }
        .nav-a:hover{color:${T.teal};background:${T.tealSoft};}

        .feat-card{transition:transform .28s cubic-bezier(.34,1.56,.64,1),box-shadow .28s,border-color .28s;cursor:default;}
        .feat-card:hover{transform:translateY(-7px) scale(1.012);}
        .step-card{transition:transform .24s,box-shadow .24s;cursor:default;}
        .step-card:hover{transform:translateY(-4px);box-shadow:0 12px 36px rgba(6,78,59,.12);}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${T.line};border-radius:99px}
        .feat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          width: 100%;
        }
        @media (max-width: 900px) {
          .feat-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .feat-grid {
            grid-template-columns: 1fr;
          }
        }
        .scroll-section {
          scroll-snap-align: start;
          scroll-snap-stop: always;
          scroll-margin-top: 60px;
          min-height: calc(100vh - 60px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          box-sizing: border-box;
          padding: 40px 28px !important;
        }
        #cta.scroll-section {
          padding-bottom: 0px !important;
        }

        .wave-bar {
          width: 4px;
          height: 32px;
          border-radius: 4px;
          transform-origin: center;
          transition: background-color 0.3s;
        }
        .wave-bar.active {
          animation: wave-pulse 1.1s ease-in-out infinite;
        }
        .wave-bar:nth-child(2) { animation-delay: 0.1s; }
        .wave-bar:nth-child(3) { animation-delay: 0.2s; }
        .wave-bar:nth-child(4) { animation-delay: 0.3s; }
        .wave-bar:nth-child(5) { animation-delay: 0.4s; }
        .wave-bar:nth-child(6) { animation-delay: 0.15s; }
        .wave-bar:nth-child(7) { animation-delay: 0.25s; }
        .wave-bar:nth-child(8) { animation-delay: 0.35s; }
        .wave-bar:nth-child(9) { animation-delay: 0.45s; }
        .wave-bar:nth-child(10) { animation-delay: 0.05s; }

        .log-terminal::-webkit-scrollbar {
          width: 4px;
        }
        .log-terminal::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
        }
        .log-terminal::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
        }
      `}</style>

      {/* ══════ NAVBAR ══════ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: `${T.bg}dd`,
        backdropFilter: 'blur(20px)',
        borderBottom: `1.5px solid ${T.border}`,
      }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, background: T.teal,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 15, color: '#fff',
              boxShadow: `0 3px 12px rgba(6,78,59,.38)`,
            }}>A</div>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', color: T.text }}>AttendAI</span>
          </div>

          <div style={{ display: 'flex', gap: 2 }}>
            <a href="#features" className="nav-a">Features</a>
            <a href="#how"      className="nav-a">How It Works</a>
            <a href="#cta"      className="nav-a">Get Started</a>
          </div>

          {isLoggedIn ? (
            <Link href="/dashboard" className="btn-teal" style={{ padding: '9px 20px', fontSize: 13 }}>Dashboard →</Link>
          ) : (
            <Link href="/login" className="btn-teal" style={{ padding: '9px 22px', fontSize: 13 }}>Sign In</Link>
          )}
        </div>
      </nav>

      {/* ══════ HERO ══════ */}
      <section className="scroll-section" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Ambient background carousel */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center',
          pointerEvents: 'none', zIndex: 0, overflow: 'hidden'
        }}>
          {/* Slide 1: Student Roster Outline */}
          <div style={{
            position: 'absolute', width: 780, height: 440, borderRadius: 24, border: `2px dashed ${T.teal}`,
            opacity: bgSlide === 0 ? 0.05 : 0, transition: 'opacity 1s ease-in-out',
            display: 'flex', flexDirection: 'column', gap: 12, padding: 24, boxSizing: 'border-box'
          }}>
            <div style={{ width: 140, height: 16, background: T.teal, borderRadius: 4 }} />
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, borderBottom: `1px dashed ${T.teal}`, paddingBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.teal }} />
                <div style={{ width: 120, height: 12, background: T.teal, borderRadius: 3 }} />
                <div style={{ width: 80, height: 10, background: T.teal, borderRadius: 2, marginLeft: 'auto' }} />
                <div style={{ width: 40, height: 16, background: T.teal, borderRadius: 10 }} />
              </div>
            ))}
          </div>

          {/* Slide 2: AI Voice Waveform Outline */}
          <div style={{
            position: 'absolute', width: 780, height: 440, borderRadius: 24, border: `2px dashed ${T.amber}`,
            opacity: bgSlide === 1 ? 0.05 : 0, transition: 'opacity 1s ease-in-out',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 24, boxSizing: 'border-box'
          }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', border: `3px dashed ${T.amber}` }} />
            <div style={{ width: 180, height: 16, background: T.amber, borderRadius: 4 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 60 }}>
              {[30, 45, 60, 35, 50, 25, 40, 55, 30, 45].map((h, i) => (
                <div key={i} style={{ width: 6, height: h, background: T.amber, borderRadius: 3 }} />
              ))}
            </div>
            <div style={{ width: 320, height: 40, border: `1.5px dashed ${T.amber}`, borderRadius: 12 }} />
          </div>

          {/* Slide 3: Analytics SVG Chart Outline */}
          <div style={{
            position: 'absolute', width: 780, height: 440, borderRadius: 24, border: `2px dashed ${T.teal}`,
            opacity: bgSlide === 2 ? 0.05 : 0, transition: 'opacity 1s ease-in-out',
            display: 'flex', gap: 24, padding: 24, boxSizing: 'border-box', alignItems: 'flex-end'
          }}>
            <div style={{ flex: 1, display: 'flex', gap: 14, height: '100%', alignItems: 'flex-end' }}>
              {[120, 240, 180, 300, 220, 280, 160].map((h, i) => (
                <div key={i} style={{ flex: 1, height: h, background: T.teal, borderRadius: '4px 4px 0 0' }} />
              ))}
            </div>
            <div style={{ width: 200, height: 200, borderRadius: '50%', border: `16px dashed ${T.teal}`, boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* Eyebrow badge */}
        <div className="a1" style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '6px 16px', borderRadius: 100, marginBottom: 16,
          background: T.tealSoft, border: `1.5px solid ${T.tealBorder}`,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.teal, display: 'block', animation: 'blink 2s infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.teal }}>
            Next-Gen Institute Management
          </span>
        </div>

        {/* Headline */}
        <h1 className="a2" style={{
          fontSize: 'clamp(32px,5.5vw,64px)', fontWeight: 900,
          letterSpacing: '-0.045em', lineHeight: 1.02,
          margin: '0 auto 12px', maxWidth: 820, color: T.text,
        }}>
          Perfect Attendance.{' '}
          <br />
          <span style={{ color: T.teal }}>Zero Effort.</span>
        </h1>

        {/* Sub */}
        <p className="a3" style={{
          fontSize: 15, fontWeight: 400, lineHeight: 1.65,
          color: T.muted, maxWidth: 520, margin: '0 auto 20px',
        }}>
          AI-powered attendance tracking, autonomous voice call agents, and real-time analytics — built for coaching institutes that demand excellence.
        </p>

        {/* CTAs */}
        <div className="a4" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
          <Link href={dashLink} className="btn-teal">Get Started Free →</Link>
          <a href="#features" className="btn-outline">▶ Explore Features</a>
        </div>

        {/* Interactive Sandbox Simulator Card */}
        <div className="a5" style={{ marginTop: 20, display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div style={{
            width: '100%', maxWidth: 860,
            background: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(20px)',
            border: `1.5px solid ${T.border}`,
            borderRadius: 20, padding: '12px 14px',
            boxShadow: '0 20px 48px rgba(6,78,59,0.06), 0 2px 8px rgba(26,26,24,.03)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Top glass border line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${T.teal}, ${T.amber})`, borderRadius: '20px 20px 0 0' }} />

            {/* Sandbox Header / Chrome Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 8, borderBottom: `1.5px solid ${T.border}` }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#f97316','#facc15','#4ade80'].map((c,i) => <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'block' }} />)}
              </div>
              <span style={{ fontSize: 10.5, color: T.teal, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                ⚡ AttendAI Live Simulator
              </span>

              {/* Action Buttons in Header to save height */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {simState === 'idle' && (
                  <button 
                    onClick={startScans}
                    className="btn-teal"
                    style={{ padding: '4px 12px', fontSize: 10.5, borderRadius: 8, height: 26, boxShadow: 'none' }}
                  >
                    🪪 Run RFID Scans
                  </button>
                )}
                
                {simState === 'scanning' && (
                  <button 
                    disabled
                    className="btn-teal"
                    style={{ padding: '4px 12px', fontSize: 10.5, borderRadius: 8, height: 26, opacity: 0.8, cursor: 'not-allowed', background: T.tealDark, boxShadow: 'none' }}
                  >
                    ⏳ Scanning...
                  </button>
                )}

                {simState === 'alert' && (
                  <button 
                    onClick={startAICall}
                    className="btn-teal"
                    style={{ padding: '4px 12px', fontSize: 10.5, borderRadius: 8, height: 26, background: '#dc2626', boxShadow: '0 2px 8px rgba(220,38,38,0.25)' }}
                  >
                    📞 Trigger AI Call
                  </button>
                )}

                {(simState === 'calling' || simState === 'connected') && (
                  <button 
                    disabled
                    className="btn-teal"
                    style={{ padding: '4px 12px', fontSize: 10.5, borderRadius: 8, height: 26, opacity: 0.8, cursor: 'not-allowed', background: T.amber, boxShadow: 'none' }}
                  >
                    🤖 Call Active...
                  </button>
                )}

                {simState === 'completed' && (
                  <button 
                    onClick={resetSim}
                    className="btn-outline"
                    style={{ padding: '3px 12px', fontSize: 10.5, borderRadius: 8, height: 26 }}
                  >
                    🔄 Reset Sandbox
                  </button>
                )}

                {/* Status Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: simState !== 'idle' ? '#ef4444' : '#059669', display: 'block', animation: 'blink 1.5s infinite' }} />
                  <span style={{ fontSize: 9.5, color: simState !== 'idle' ? '#ef4444' : '#059669', fontWeight: 800, textTransform: 'uppercase' }}>
                    {simState === 'idle' ? 'Standby' : simState === 'completed' ? 'Done' : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Split Grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              
              {/* LEFT COLUMN: Operations Logging */}
              <div style={{ flex: '1 1 320px', height: 120, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Operations Log Feed</span>
                  <span style={{ fontSize: 9, color: T.muted, fontFamily: 'monospace' }}>logs: {logs.length}</span>
                </div>
                <div 
                  ref={logEndRef}
                  className="log-terminal"
                  style={{
                    height: 120,
                    background: '#111827',
                    borderRadius: 12,
                    padding: '8px 10px',
                    fontFamily: '"Fira Code", "Courier New", monospace',
                    fontSize: 10.5,
                    lineHeight: 1.4,
                    color: '#9ca3af',
                    overflowY: 'auto',
                    textAlign: 'left',
                    border: '1.5px solid #1f2937',
                  }}
                >
                  {logs.map((log, idx) => {
                    let col = '#e5e7eb';
                    if (log.includes('Scanner:')) col = '#34d399'; // green
                    if (log.includes('System:')) col = '#f87171'; // red
                    if (log.includes('AI Action') || log.includes('AI Call') || log.includes('Database:')) col = '#67e8f9'; // cyan
                    return (
                      <div key={idx} style={{ color: col, marginBottom: 3, wordBreak: 'break-word' }}>
                        {log}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT COLUMN: Database View / Phone Screen */}
              <div style={{ flex: '1.2 1 380px', height: 120, display: 'flex', flexDirection: 'column' }}>
                
                {/* Condition: Show roster database when not call active */}
                {simState !== 'calling' && simState !== 'connected' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Live Student Directory
                      </span>
                      <span style={{ fontSize: 9.5, fontWeight: 800, padding: '1.5px 6px', borderRadius: 100, background: T.tealSoft, color: T.teal }}>
                        Batch A-1
                      </span>
                    </div>

                    {/* Roster grid layout to save height */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 8,
                      flexGrow: 1,
                      alignContent: 'center'
                    }}>
                      {roster.map((student, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '6px 10px', borderRadius: 8,
                          background: student.status === 'Absent' ? 'rgba(220,38,38,0.03)' : T.bg,
                          border: `1px solid ${student.status === 'Absent' ? 'rgba(220,38,38,0.15)' : T.border}`,
                          transition: 'all 0.3s ease',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{
                              width: 22, height: 22, borderRadius: '50%',
                              background: `${student.color}15`, border: `1.5px solid ${student.color}35`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 10, fontWeight: 800, color: student.color,
                            }}>{student.name[0]}</div>
                            <span style={{ fontSize: 11.5, fontWeight: 700, color: T.text }}>{student.name.split(' ')[0]}</span>
                          </div>
                          <span style={{
                            padding: '1.5px 6px', borderRadius: 100, fontSize: 9.5, fontWeight: 800,
                            background: `${student.color}12`, color: student.color,
                            border: `1px solid ${student.color}25`,
                          }}>
                            {student.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  
                  /* Condition: Call Active Smartphone Screen */
                  <div style={{
                    background: '#0f172a',
                    border: '1.5px solid #1f2937',
                    borderRadius: 12,
                    padding: 10,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    color: '#fff',
                    boxShadow: '0 4px 18px rgba(6,78,59,0.12)',
                  }}>
                    {/* Compact Call Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: 'rgba(52,211,153,0.1)', border: '1.5px solid #059669',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 900, color: '#34d399',
                        }}>R</div>
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#f8fafc' }}>Parent of Rohan</span>
                          <span style={{ fontSize: 9, color: '#94a3b8', marginLeft: 6 }}>
                            {simState === 'calling' ? 'Ringing...' : 'Active'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Audio waveform */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 20 }}>
                        {[...Array(6)].map((_, idx) => (
                          <div 
                            key={idx} 
                            className={`wave-bar ${activeSpeaker !== 'none' ? 'active' : ''}`}
                            style={{ 
                              width: 3,
                              height: 16,
                              background: activeSpeaker === 'AI' ? '#10b981' : activeSpeaker === 'Parent' ? '#fbbf24' : '#475569'
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Single message bubble */}
                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', padding: '4px 0' }}>
                      {transcript.length === 0 ? (
                        <div style={{ color: '#475569', fontSize: 10.5, fontStyle: 'italic', textAlign: 'center' }}>
                          Connecting voice stream...
                        </div>
                      ) : (
                        (() => {
                          const lastMsg = transcript[transcript.length - 1];
                          return (
                            <div 
                              style={{
                                alignSelf: lastMsg.speaker === 'AI' ? 'flex-start' : 'flex-end',
                                maxWidth: '95%',
                                background: lastMsg.speaker === 'AI' ? '#064e3b' : '#334155',
                                border: `1px solid ${lastMsg.speaker === 'AI' ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: lastMsg.speaker === 'AI' ? '8px 8px 8px 2px' : '8px 8px 2px 8px',
                                padding: '6px 10px',
                                textAlign: 'left',
                                animation: 'up 0.3s ease-out both'
                              }}
                            >
                              <div style={{ fontSize: 8.5, fontWeight: 800, color: lastMsg.speaker === 'AI' ? '#34d399' : '#fbbf24', textTransform: 'uppercase', marginBottom: 1 }}>
                                {lastMsg.speaker === 'AI' ? 'AttendAI Agent' : 'Parent (Mr. Das)'}
                              </div>
                              <div style={{ fontSize: 10.5, color: '#f1f5f9', lineHeight: 1.3 }}>
                                {lastMsg.text}
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ STATS ══════ */}
      <section ref={ref} className="scroll-section" style={{ background: '#fff', borderTop: `1.5px solid ${T.border}`, borderBottom: `1.5px solid ${T.border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '6px 16px', borderRadius: 100, marginBottom: 16,
            background: T.tealSoft, border: `1.5px solid ${T.tealBorder}`,
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.teal }}>Our Scale</span>
          </div>
          <h2 style={{ fontSize: 'clamp(24px,4.5vw,38px)', fontWeight: 800, letterSpacing: '-0.03em', color: T.text, margin: 0 }}>
            Proven numbers. Dynamic results.
          </h2>
        </div>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', width: '100%' }}>
          {STATS.map((s, i) => <StatCard key={i} value={s.value} label={s.label} go={go} />)}
        </div>
      </section>

      {/* ══════ FEATURES ══════ */}
      <section id="features" className="scroll-section" style={{ background: T.bg }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '6px 16px', borderRadius: 100, marginBottom: 12,
              background: T.amberSoft, border: `1.5px solid ${T.amberBorder}`,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.amber }}>All Modules</span>
            </div>
            <h2 style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, letterSpacing: '-0.03em', color: T.text, margin: '0 0 8px' }}>
              One platform.{' '}
              <span style={{ color: T.muted, fontWeight: 400 }}>Every tool you need.</span>
            </h2>
            <p style={{ fontSize: 13.5, color: T.muted, maxWidth: 420, margin: '0 auto' }}>
              A tightly integrated suite eliminating manual work across every stage of attendance management.
            </p>
          </div>

          {/* Grid */}
          <div className="feat-grid">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="feat-card"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: T.card,
                  border: `1.5px solid ${hovered === i ? f.accent : T.border}`,
                  borderRadius: 16, padding: '18px 20px',
                  position: 'relative', overflow: 'hidden',
                  boxShadow: hovered === i ? `0 12px 36px ${f.accent}12` : '0 2px 8px rgba(26,26,24,.04)',
                }}
              >
                {/* Top accent line */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: f.accent,
                  opacity: hovered === i ? 1 : 0,
                  transition: 'opacity .22s',
                  borderRadius: '16px 16px 0 0',
                }} />

                {f.flagship && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    padding: '2px 8px', borderRadius: 100, fontSize: 8.5,
                    fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
                    background: `${T.amber}15`, color: T.amber, border: `1px solid ${T.amber}30`,
                  }}>Flagship</div>
                )}

                <div style={{
                  width: 38, height: 38, borderRadius: 10, fontSize: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: hovered === i ? `${f.accent}12` : T.bg,
                  border: `1.5px solid ${hovered === i ? `${f.accent}35` : T.border}`,
                  marginBottom: 12, transition: 'all .22s',
                }}>{f.icon}</div>

                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: T.text, marginBottom: 5, letterSpacing: '-0.01em' }}>{f.title}</h3>
                <p style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section id="how" className="scroll-section" style={{ background: '#fff', borderTop: `1.5px solid ${T.border}` }}>
        <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '6px 16px', borderRadius: 100, marginBottom: 18,
            background: T.tealSoft, border: `1.5px solid ${T.tealBorder}`,
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.teal }}>The Flow</span>
          </div>
          <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 800, letterSpacing: '-0.03em', color: T.text, marginBottom: 56 }}>
            From scan to parent call in{' '}
            <span style={{ color: T.teal }}>seconds.</span>
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, justifyContent: 'center', alignItems: 'center' }}>
            {HOW_STEPS.map((item, i) => (
              <React.Fragment key={i}>
                <div className="step-card" style={{
                  flex: '0 0 auto', width: 186,
                  padding: '26px 16px', textAlign: 'center',
                  background: T.bg, border: `1.5px solid ${T.border}`,
                  borderRadius: 20,
                }}>
                  <div style={{ fontSize: 30, marginBottom: 12 }}>{item.icon}</div>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', color: T.amber, textTransform: 'uppercase', marginBottom: 7 }}>{item.step}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.65 }}>{item.desc}</div>
                </div>
                {i < 3 && (
                  <div style={{ width: 36, textAlign: 'center', color: T.line, fontSize: 20, flexShrink: 0 }}>→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ CTA & FOOTER ══════ */}
      <section id="cta" className="scroll-section" style={{
        background: `linear-gradient(135deg, ${T.teal} 0%, ${T.tealDark} 55%, #111827 100%)`,
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        paddingTop: '60px',
        paddingLeft: '28px',
        paddingRight: '28px',
      }}>
        {/* Dot pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '30px 30px', pointerEvents: 'none',
        }} />
        {/* Amber accent circle */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-60px',
          width: 340, height: 340, borderRadius: '50%',
          background: `radial-gradient(circle, ${T.amber}30 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* Dummy spacer to balance flex space-between */}
        <div style={{ height: 20 }} />

        {/* Centered CTA content */}
        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '6px 16px', borderRadius: 100, marginBottom: 20,
            background: 'rgba(255,255,255,.12)', border: '1.5px solid rgba(255,255,255,.28)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fbbf24', display: 'block', animation: 'blink 2s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.9)' }}>
              Ready to automate
            </span>
          </div>

          <h2 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', marginBottom: 12, lineHeight: 1.1 }}>
            Upgrade your institute today.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.68)', lineHeight: 1.7, marginBottom: 32, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
            Join the growing network of coaching centers that trust AttendAI to handle every absence, every call, every report — automatically.
          </p>

          <Link href={dashLink} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 32px', borderRadius: 100,
            background: '#fff', color: T.teal,
            fontWeight: 800, fontSize: 14, textDecoration: 'none',
            boxShadow: '0 4px 24px rgba(0,0,0,.18)',
            transition: 'transform .2s, box-shadow .2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-2px) scale(1.02)'; (e.currentTarget as HTMLElement).style.boxShadow='0 8px 36px rgba(0,0,0,.26)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform=''; (e.currentTarget as HTMLElement).style.boxShadow='0 4px 24px rgba(0,0,0,.18)'; }}
          >
            Access Platform →
          </Link>
        </div>

        {/* Footer inside CTA at the bottom */}
        <footer style={{
          width: 'calc(100% + 56px)',
          margin: '40px -28px 0',
          padding: '24px 28px',
          background: '#111827',
          borderTop: '1.5px solid #1f2937',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 10,
        }}>
          <div style={{
            width: '100%',
            maxWidth: 1140,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: T.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, color: '#fff' }}>A</div>
              <span style={{ fontWeight: 800, fontSize: 14, color: '#f3f4f6', letterSpacing: '-0.01em' }}>AttendAI</span>
            </div>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
              © {new Date().getFullYear()} AttendAI. All rights reserved.
            </p>
          </div>
        </footer>
      </section>

    </div>
  );
}
