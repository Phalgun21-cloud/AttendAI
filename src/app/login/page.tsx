'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Bell, 
  CheckCircle2, 
  Phone, 
  AlertCircle, 
  Lock, 
  Mail, 
  TrendingUp, 
  Cpu, 
  Wifi, 
  ArrowRight,
  Database
} from 'lucide-react';

const MOCK_EVENTS = [
  { time: '09:44:12', msg: 'Rohan Sen: Gate_01 check-in anomaly detected', type: 'error' },
  { time: '09:44:18', msg: 'Outbound AI Voice Call established with Mrs. Sen', type: 'call' },
  { time: '09:44:32', msg: 'AI Speech-to-Text: "He is sick today with fever" parsed', type: 'ai' },
  { time: '09:44:35', msg: 'Roster status: Rohan Sen set to EXCUSED (Medical)', type: 'success' },
  { time: '09:44:40', msg: 'Database synced: Gate roster ledger updated (latency 6.4ms)', type: 'system' },
  { time: '09:45:02', msg: 'Rahul Verma: Proximity RFID tap confirmed at Gate_02', type: 'success' },
  { time: '09:45:05', msg: 'WhatsApp notification sent: Parent of Rahul Verma', type: 'notify' },
  { time: '09:45:15', msg: 'Kabir Mehta: Proximity RFID tap confirmed at Gate_01', type: 'success' },
  { time: '09:45:18', msg: 'WhatsApp notification sent: Parent of Kabir Mehta', type: 'notify' },
];

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [email, setEmail] = useState('superadmin@attendee.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamic telemetry logs
  const [logs, setLogs] = useState(MOCK_EVENTS.slice(0, 4));

  // Magnetic button state
  const [magneticPos, setMagneticPos] = useState({ x: 0, y: 0 });

  // Cursor follow light state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Rotate logs
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => {
        const nextIndex = (MOCK_EVENTS.findIndex(e => e.msg === prev[0].msg) + 1) % MOCK_EVENTS.length;
        return [MOCK_EVENTS[nextIndex], ...prev.slice(0, 3)];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Track cursor movement on background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Redirect if authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleMagneticMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - (left + width / 2);
    const y = e.clientY - (top + height / 2);
    setMagneticPos({ x: x * 0.35, y: y * 0.35 });
  };

  const handleMagneticLeave = () => {
    setMagneticPos({ x: 0, y: 0 });
  };

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#09090B]">
        <div className="flex flex-col items-center gap-3">
          <Activity className="h-6 w-6 animate-spin text-[#4F46E5]" />
          <p className="text-[11px] text-[#A1A1AA] font-mono tracking-widest uppercase">Initializing AttendAI...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-screen w-screen bg-[#09090B] text-[#FAFAFA] font-sans overflow-hidden select-none"
    >
      {/* Dynamic Cursor Spotlight Effect */}
      <div 
        className="absolute pointer-events-none w-[450px] h-[450px] rounded-full bg-[#4F46E5]/4 blur-[100px] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out z-0 hidden lg:block"
        style={{ left: mousePos.x, top: mousePos.y }}
      />

      {/* Grid overlay for OS dashboard structure */}
      <div className="absolute inset-0 bg-transparent opacity-[0.03] cinematic-grid pointer-events-none z-0" />
      <div className="absolute inset-0 bg-transparent opacity-[0.1] cinematic-noise pointer-events-none z-0" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-10 h-screen w-full">
        {/* LEFT COLUMN: Telemetry Engine (60%) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between p-10 border-r border-white/[0.04] relative overflow-hidden bg-radial from-[#111113]/20 via-[#09090B] to-[#09090B]">
          
          {/* Top Row: Brand Header */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-[#4F46E5] to-[#06B6D4] flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-[10px] font-black text-white font-mono">A</span>
            </div>
            <div>
              <span className="font-extrabold text-[11px] font-mono tracking-widest text-[#FAFAFA] uppercase">
                Attend<span className="text-[#4F46E5]">AI</span>
              </span>
              <span className="text-[7.5px] font-mono text-[#A1A1AA]/50 tracking-wider uppercase ml-2 px-1.5 py-0.5 rounded border border-white/[0.04] bg-white/[0.02]">
                Telemetry Engine Online
              </span>
            </div>
          </div>

          {/* Middle Row: Grid of Live Telemetry Previews */}
          <div className="grid grid-cols-12 gap-5 my-auto max-w-3xl w-full">
            
            {/* Widget 1: Attendance Health Card (6 cols) */}
            <div className="col-span-6 bg-[#111113]/80 border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between min-h-[140px] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#4F46E5]/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-mono text-[#A1A1AA] uppercase tracking-wider">Attendance Rate</span>
                <span className="text-[8px] font-mono text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-1.5 py-0.5 rounded font-bold">
                  OPTIMAL
                </span>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold tracking-tight text-[#FAFAFA]">94.8%</span>
                  <span className="text-[10px] font-mono text-[#22C55E] flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" /> +1.2%
                  </span>
                </div>
                <p className="text-[9.5px] text-[#A1A1AA] font-light mt-1">Average rate across all 8 synchronizing gateways.</p>
              </div>
            </div>

            {/* Widget 2: AI Call Activity Card (6 cols) */}
            <div className="col-span-6 bg-[#111113]/80 border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between min-h-[140px] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#06B6D4]/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-mono text-[#A1A1AA] uppercase tracking-wider">AI Voice Channel #8492</span>
                <span className="text-[8px] font-mono text-[#4F46E5] bg-[#4F46E5]/10 border border-[#4F46E5]/20 px-1.5 py-0.5 rounded font-bold flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#4F46E5] animate-ping" />
                  DIALING
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-white block">Rohan Sen (Parent)</span>
                  <span className="text-[7.5px] font-mono text-[#A1A1AA]/60">+91 98XXX XXX10</span>
                </div>
                {/* Audio Wave Visualizer */}
                <div className="flex items-center gap-1 h-7 pt-1 flex-shrink-0">
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, 24, 4] }}
                      transition={{
                        duration: 0.8 + Math.random() * 0.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.08
                      }}
                      className="w-[2.5px] rounded-full bg-[#4F46E5]"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Widget 3: Live Interactive Timeline Log (12 cols) */}
            <div className="col-span-12 bg-[#111113]/80 border border-white/[0.06] rounded-xl p-5 shadow-xl">
              <div className="flex justify-between items-center border-b border-white/[0.04] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#4F46E5]" />
                  <span className="text-[9px] font-mono text-[#FAFAFA] uppercase tracking-widest font-bold">Real-Time Activity Timeline</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[7px] text-[#A1A1AA]">
                  <span className="flex items-center gap-1">
                    <Wifi className="h-2 w-2 text-[#22C55E]" /> GATEWAYS_ONLINE
                  </span>
                  <span>|</span>
                  <span className="flex items-center gap-1">
                    <Database className="h-2 w-2 text-indigo-400" /> DB_CONNECTED
                  </span>
                </div>
              </div>

              {/* Rolling Log entries */}
              <div className="space-y-2.5 min-h-[140px] flex flex-col justify-start">
                <AnimatePresence initial={false}>
                  {logs.map((log) => {
                    let indicatorBg = 'bg-[#A1A1AA]';
                    let textClass = 'text-[#FAFAFA]/90';
                    if (log.type === 'error') {
                      indicatorBg = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]';
                      textClass = 'text-rose-400';
                    } else if (log.type === 'call') {
                      indicatorBg = 'bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.6)]';
                    } else if (log.type === 'ai') {
                      indicatorBg = 'bg-[#06B6D4] shadow-[0_0_8px_rgba(6,182,212,0.6)]';
                    } else if (log.type === 'success') {
                      indicatorBg = 'bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.6)]';
                    } else if (log.type === 'notify') {
                      indicatorBg = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]';
                    }

                    return (
                      <motion.div
                        key={log.msg}
                        initial={{ opacity: 0, x: -15, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: 15, filter: 'blur(4px)' }}
                        transition={{ duration: 0.4 }}
                        className="flex items-center gap-4 text-left p-2 rounded bg-[#09090B]/60 border border-white/[0.02]"
                      >
                        <span className="text-[7.5px] font-mono text-[#A1A1AA]/60 flex-shrink-0 w-12">
                          {log.time}
                        </span>
                        <div className={`w-1.5 h-1.5 rounded-full ${indicatorBg} flex-shrink-0`} />
                        <span className={`text-[8.5px] font-mono leading-none tracking-wide flex-1 truncate ${textClass}`}>
                          {log.msg}
                        </span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

          </div>

          {/* Bottom Row: OS Status & Decryption Hint */}
          <div className="flex justify-between items-center font-mono text-[7.5px] text-[#A1A1AA]/50 border-t border-white/[0.04] pt-4">
            <span>SECURE TELEMETRY CHANNEL 84-A // AES_256</span>
            <span>SYSTEM STATE: ACTIVE (ROSTER DEPLOYED)</span>
          </div>

        </div>

        {/* RIGHT COLUMN: Glassmorphic Access Portal (40%) */}
        <div className="col-span-1 lg:col-span-4 flex flex-col justify-center items-center px-6 md:px-12 relative overflow-hidden bg-[#09090B]">
          
          {/* Spotlight for Mobile / Right Side background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#4F46E5]/3 rounded-full blur-[80px] pointer-events-none z-0" />

          {/* Login Card Wrapper */}
          <div className="w-full max-w-[380px] z-10">
            
            {/* Minimal Header */}
            <div className="mb-8 text-left animate-fade-in">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#FAFAFA] font-sans">
                Welcome Back
              </h2>
              <p className="text-xs text-[#A1A1AA] font-light mt-1.5">
                Access your attendance command center.
              </p>
            </div>

            {/* Glass Container */}
            <div className="bg-[#111113]/55 backdrop-blur-xl border border-white/[0.08] p-6 md:p-8 rounded-2xl shadow-2xl relative">
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5 p-3.5 bg-[#E11D48]/10 border border-[#E11D48]/20 text-[#E11D48] text-[9px] font-mono rounded-lg"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <div className="space-y-4">
                  
                  {/* Email Field */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-mono uppercase tracking-wider text-[#A1A1AA]">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A1A1AA]/50" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#09090B] border border-white/[0.08] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/40 transition-all rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-white outline-none font-light"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[8px] font-mono uppercase tracking-wider text-[#A1A1AA]">Password</label>
                      <Link
                        href="/forgot-password"
                        className="text-[8px] font-mono uppercase tracking-wider text-[#A1A1AA]/60 hover:text-white transition-all"
                      >
                        Forgot?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A1A1AA]/50" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#09090B] border border-white/[0.08] focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/40 transition-all rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-white outline-none font-light"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                </div>

                {/* Magnetic Access Platform Button */}
                <div className="pt-2">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    onMouseMove={handleMagneticMove}
                    onMouseLeave={handleMagneticLeave}
                    animate={{ x: magneticPos.x, y: magneticPos.y }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-[9px] font-mono tracking-widest uppercase py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-500/10 active:scale-98 transition-colors duration-200"
                  >
                    {loading ? (
                      <>
                        <Activity className="h-3.5 w-3.5 animate-spin text-white" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Access Platform
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </motion.button>
                </div>
              </form>

              {/* Seed Database Notice */}
              <div className="mt-6 pt-5 border-t border-white/[0.04] text-center">
                <p className="text-[7.5px] font-mono text-[#A1A1AA]/50 leading-normal">
                  Evaluation Hint: Pre-populated defaults are loaded above. If empty, run <span className="text-indigo-400 font-bold">/api/seed</span> in browser first.
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>
    </motion.div>
  );
}
