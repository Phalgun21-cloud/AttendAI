'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Phone, Volume2, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface LogEntry {
  time: string;
  text: string;
  type: 'info' | 'success' | 'warn' | 'error';
}

interface ChatMessage {
  speaker: 'AI' | 'Parent' | 'System';
  text: string;
}

export default function InteractiveHero() {
  const [logs, setLogs] = useState<LogEntry[]>([
    { time: '17:30:00', text: 'System initialized. RFID/Barcode listener active.', type: 'info' },
    { time: '17:30:05', text: 'All batch rosters loaded. Awaiting card scanning...', type: 'info' }
  ]);
  const [callActive, setCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'dialing' | 'connected' | 'completed'>('idle');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanTarget, setScanTarget] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs & chat
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // Audio Beep generator using Web Audio API
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime); // high-pitched beep
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn('Web Audio not supported or blocked by user gesture:', e);
    }
  };

  const addLog = (text: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    setLogs(prev => [...prev, { time, text, type }]);
  };

  const handleScan = (name: string, id: string, isLate = false) => {
    if (isScanning || callActive) return;
    setIsScanning(true);
    setScanTarget(name);
    addLog(`Physical card scanner read input: ${id}`, 'info');
    
    setTimeout(() => {
      playBeep();
      addLog(`Identity confirmed: ${name} (ID: ${id})`, 'success');
      
      setTimeout(() => {
        if (isLate) {
          addLog(`${name} checked in LATE (5 PM NEET Batch)`, 'warn');
        } else {
          addLog(`${name} checked in PRESENT. Status uploaded.`, 'success');
        }
        setIsScanning(false);
        setScanTarget(null);
      }, 600);
    }, 400);
  };

  const triggerCallSimulation = () => {
    if (callActive || isScanning) return;
    setCallActive(true);
    setCallStatus('dialing');
    setChat([]);
    addLog('Batch check initiated for: 5:00 PM NEET Achievers.', 'info');
    
    setTimeout(() => {
      addLog('Student absent: Rohan Das (Parent: Mr. Alok Das, Phone: +91 98765 43210)', 'warn');
      addLog('Triggering AttendAI autonomous voice agent...', 'info');
      
      setTimeout(() => {
        setCallStatus('connected');
        addLog('Call connected. Initiating natural dialogue.', 'success');
        
        const conversation: ChatMessage[] = [
          { speaker: 'AI', text: 'Hello, I am the AttendAI assistant calling from Excellence Academy. We noticed Rohan did not check in for the 5:00 PM NEET batch today. Is everything okay?' },
          { speaker: 'Parent', text: 'Oh hello! Yes, actually he has a bit of fever today, so we decided to keep him home.' },
          { speaker: 'AI', text: 'Ah, I see. I hope he feels better soon. I will mark his absence as Excused for today so it does not affect his record. Do you need a copy of today\'s notes or homework sent over?' },
          { speaker: 'Parent', text: 'Oh, that would be very helpful, thank you so much.' },
          { speaker: 'AI', text: 'Perfect. I will have the coordinator share the study materials on WhatsApp. Take care, and goodbye!' },
          { speaker: 'System', text: 'Call completed. Duration: 48s. Recording archived.' }
        ];

        let index = 0;
        const interval = setInterval(() => {
          if (index < conversation.length) {
            setChat(prev => [...prev, conversation[index]]);
            if (conversation[index].speaker === 'System') {
              setCallStatus('completed');
              addLog('Parent update processed. Status updated to Excused (Sick Leave).', 'success');
              addLog('Homework package sent to parent via WhatsApp API.', 'info');
              clearInterval(interval);
            } else {
              addLog(`Speech stream [${conversation[index].speaker}]: "${conversation[index].text.substring(0, 30)}..."`, 'info');
            }
            index++;
          }
        }, 3200);
      }, 1500);
    }, 1200);
  };

  const resetSimulation = () => {
    setCallActive(false);
    setCallStatus('idle');
    setChat([]);
    setLogs([
      { time: '17:30:00', text: 'System initialized. RFID/Barcode listener active.', type: 'info' },
      { time: '17:30:05', text: 'All batch rosters loaded. Awaiting card scanning...', type: 'info' }
    ]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-16 p-1 bg-zinc-200/50 border border-zinc-200 rounded-[32px] shadow-2xl relative">
      {/* Decorative Top Accent */}
      <div className="absolute -top-3 left-10 px-3 py-1 bg-white border border-zinc-200 text-zinc-500 rounded-full text-[10px] font-semibold tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
        Interactive Live Sandbox
      </div>

      <div className="bg-white rounded-[28px] overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-100">
        
        {/* Left Interactive Panel: 5 columns */}
        <div className="lg:col-span-5 p-8 flex flex-col justify-between space-y-8 bg-zinc-50/50">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase">Step 1: Simulation Panel</span>
            <h3 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">Simulate Institute Events</h3>
            <p className="text-zinc-500 text-sm font-light mt-2 leading-relaxed">
              Experience the core triggers of the platform. Tap a student to scan their ID card, or trigger the AI voice response system for an absent student.
            </p>

            {/* Students roster scan buttons */}
            <div className="space-y-3 mt-6">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Mock Student Roster (Scan Cards)
              </label>
              
              <button
                disabled={isScanning || callActive}
                onClick={() => handleScan('Aarav Sharma', 'ATT-2026-042')}
                className="w-full text-left px-4 py-3 bg-white border border-zinc-200 hover:border-blue-500/50 hover:bg-blue-50/10 rounded-xl transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div>
                  <h4 className="font-semibold text-zinc-800 text-xs group-hover:text-blue-600 transition-colors">Aarav Sharma</h4>
                  <span className="text-[10px] text-zinc-400 font-mono">ID: ATT-2026-042 (NEET Batch)</span>
                </div>
                <span className="text-[10px] bg-zinc-100 group-hover:bg-blue-50 text-zinc-500 group-hover:text-blue-600 px-2.5 py-1 rounded-md font-mono transition-colors">Scan Card</span>
              </button>

              <button
                disabled={isScanning || callActive}
                onClick={() => handleScan('Priya Patel', 'ATT-2026-089', true)}
                className="w-full text-left px-4 py-3 bg-white border border-zinc-200 hover:border-orange-500/50 hover:bg-orange-50/10 rounded-xl transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div>
                  <h4 className="font-semibold text-zinc-800 text-xs group-hover:text-orange-600 transition-colors">Priya Patel</h4>
                  <span className="text-[10px] text-zinc-400 font-mono">ID: ATT-2026-089 (NEET Batch)</span>
                </div>
                <span className="text-[10px] bg-zinc-100 group-hover:bg-orange-50 text-zinc-500 group-hover:text-orange-600 px-2.5 py-1 rounded-md font-mono transition-colors">Scan (Late)</span>
              </button>
            </div>

            {/* AI Call Trigger button */}
            <div className="mt-8 pt-6 border-t border-zinc-100">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-3">
                Absentee Follow-up Automation
              </label>
              
              <button
                onClick={triggerCallSimulation}
                disabled={callActive || isScanning}
                className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 fill-current" />
                Simulate Absentee AI Call
              </button>
            </div>
          </div>

          {/* Sandbox Controls Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
            <span className="text-[10px] text-zinc-400 font-light flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${callActive ? 'bg-orange-500 animate-pulse' : isScanning ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
              {callActive ? 'AI Simulator Running' : isScanning ? 'Card Scanner Active' : 'System Ready'}
            </span>
            {(callActive || logs.length > 2) && (
              <button
                onClick={resetSimulation}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Demo
              </button>
            )}
          </div>
        </div>

        {/* Middle Activity Logger Panel: 3 columns */}
        <div className="lg:col-span-3 p-6 flex flex-col justify-between bg-zinc-50/20">
          <div className="h-full flex flex-col">
            <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Live Activity Logs</span>
            <div className="flex-1 mt-4 overflow-y-auto max-h-[360px] space-y-3 pr-1 font-mono text-[11px] leading-relaxed scrollbar-thin">
              {logs.map((log, idx) => (
                <div key={idx} className="border-b border-zinc-100/50 pb-2">
                  <span className="text-zinc-400">[{log.time}]</span>{' '}
                  <span className={
                    log.type === 'success' ? 'text-green-600 font-semibold' :
                    log.type === 'warn' ? 'text-orange-500 font-semibold' :
                    log.type === 'error' ? 'text-red-500 font-semibold' :
                    'text-zinc-600'
                  }>
                    {log.text}
                  </span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>

        {/* Right Phone Call Panel: 4 columns */}
        <div className="lg:col-span-4 p-8 flex flex-col justify-between bg-zinc-50/80 relative">
          <div className="flex-1 flex flex-col">
            <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase">Step 2: AI Voice Simulation</span>
            
            {/* Phone Screen Mockup */}
            <div className="flex-1 mt-4 border border-zinc-200 rounded-[24px] bg-white shadow-inner overflow-hidden flex flex-col justify-between max-h-[380px] min-h-[320px] relative">
              
              {/* Call Header */}
              <div className="bg-zinc-50 px-4 py-3.5 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-zinc-800 text-[11px] leading-none">AttendAI Caller</h5>
                    <span className="text-[8px] text-zinc-400 font-mono">Autonomous Voice Agent</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wider uppercase font-semibold ${
                  callStatus === 'dialing' ? 'bg-orange-100 text-orange-600 animate-pulse' :
                  callStatus === 'connected' ? 'bg-green-100 text-green-600 font-bold' :
                  callStatus === 'completed' ? 'bg-zinc-100 text-zinc-500' :
                  'bg-zinc-100 text-zinc-400'
                }`}>
                  {callStatus === 'idle' ? 'Standby' : callStatus}
                </span>
              </div>

              {/* Chat Dialog Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 max-h-[260px] scrollbar-thin">
                {chat.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <Volume2 className="w-8 h-8 text-zinc-300 mb-2" />
                    <p className="text-[11px] text-zinc-400 font-light max-w-[160px]">
                      Awaiting Absentee Voice Call simulation trigger.
                    </p>
                  </div>
                ) : (
                  chat.map((msg, idx) => {
                    if (msg.speaker === 'System') {
                      return (
                        <div key={idx} className="flex items-center justify-center gap-1 py-1 px-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-[10px] font-mono">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{msg.text}</span>
                        </div>
                      );
                    }

                    const isAI = msg.speaker === 'AI';
                    return (
                      <div key={idx} className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
                        <span className="text-[8px] text-zinc-400 font-mono mb-0.5">{msg.speaker}</span>
                        <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-xs leading-normal ${
                          isAI
                            ? 'bg-zinc-100 text-zinc-800 rounded-tl-sm'
                            : 'bg-blue-600 text-white rounded-tr-sm'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Voice waveform simulator */}
              {callStatus === 'connected' && (
                <div className="h-10 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-center gap-1 px-4">
                  <span className="text-[9px] text-zinc-400 font-mono tracking-wider uppercase mr-2 animate-pulse">Voice Stream:</span>
                  <div className="flex items-center gap-0.5 h-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => {
                      const delays = ['0.1s', '0.4s', '0.2s', '0.6s', '0.3s', '0.5s', '0.2s', '0.4s', '0.1s', '0.5s', '0.3s', '0.2s'];
                      return (
                        <span
                          key={i}
                          style={{ animationDelay: delays[i - 1] }}
                          className="w-0.5 bg-blue-500 animate-[pulse_1s_infinite_ease-in-out] h-full"
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
