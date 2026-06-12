'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Cpu, 
  Terminal, 
  User, 
  CheckCircle, 
  PhoneCall, 
  AlertTriangle,
  Play, 
  Loader2, 
  Clock, 
  Volume2, 
  UserCheck, 
  UserX,
  Phone,
  Power
} from 'lucide-react';

interface Student {
  _id: string;
  studentId: string;
  name: string;
  parentPhone: string;
  qrCodeData: string;
  course: string;
}

interface Call {
  _id: string;
  studentId: Student;
  parentPhone: string;
  status: 'PENDING' | 'CALLING' | 'ANSWERED' | 'NO_ANSWER' | 'COMPLETED';
  transcript: Array<{ speaker: 'AI' | 'Parent'; text: string }>;
  summary: string;
  outcome: string;
}

interface ConsoleLog {
  time: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'db' | 'call';
}

export default function SimulatorPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  // Scan states
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSource, setSelectedSource] = useState<'QR' | 'RFID' | 'BIOMETRIC' | 'FACE' | 'MANUAL'>('QR');
  const [selectedStatus, setSelectedStatus] = useState<'PRESENT' | 'LATE'>('PRESENT');
  const [scanLoading, setScanLoading] = useState(false);

  // Absentee trigger state
  const [detectLoading, setDetectLoading] = useState(false);

  // Call simulation states
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [callProgressText, setCallProgressText] = useState('');
  const [simulatedTranscript, setSimulatedTranscript] = useState<Array<{ speaker: 'AI' | 'Parent'; text: string }>>([]);
  const [callStatus, setCallStatus] = useState<'IDLE' | 'DIALING' | 'TALKING' | 'FINISHED'>('IDLE');
  const [activeOutcome, setActiveOutcome] = useState('');
  const [activeSummary, setActiveSummary] = useState('');
  const [callScenario, setCallScenario] = useState<'UNWELL' | 'VACATION' | 'VOICEMAIL'>('UNWELL');

  // Terminal state
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Console logging helper
  const addLog = (message: string, type: ConsoleLog['type'] = 'info') => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + String(now.getMilliseconds()).padStart(3, '0');
    setLogs(prev => [...prev, { time: timeStr, message, type }]);
  };

  // Scroll to bottom of terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Initial load
  const loadInitialData = async () => {
    try {
      const studentRes = await fetch('/api/students');
      const studentData = await studentRes.json();
      if (studentData.success) {
        setStudents(studentData.students);
        if (studentData.students.length > 0) {
          setSelectedStudentId(studentData.students[0]._id);
        }
      }

      const callRes = await fetch('/api/calls');
      const callData = await callRes.json();
      if (callData.success) {
        setCalls(callData.calls);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    addLog('AttendAI Simulation Node Initialized.', 'info');
    addLog('Awaiting hardware inputs or engine events...', 'info');
  }, []);

  // Simulate hardware scan
  const handleSimulateScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    setScanLoading(true);
    const targetStudent = students.find(s => s._id === selectedStudentId);
    if (!targetStudent) return;

    addLog(`Hardware Terminal trigger: ${selectedSource} sensor read for ${targetStudent.name} (${targetStudent.studentId})`, 'info');

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: targetStudent.studentId,
          source: selectedSource,
          status: selectedStatus
        })
      });

      const data = await res.json();
      if (data.success) {
        addLog(`[DATABASE] Logged attendance: ${targetStudent.name} is ${selectedStatus}. LogId: ${data.log._id}`, 'db');
        addLog(`[MQTT/EVENT] Broadcast packet dispatched: student_scan_status_present`, 'success');
        
        // Confetti!
        confetti({
          particleCount: 50,
          spread: 40,
          origin: { y: 0.8 },
          colors: ['#064e3b', '#047857', '#ffffff']
        });
      } else {
        addLog(`[ERROR] Database validation failed: ${data.error}`, 'error');
      }
    } catch (err) {
      addLog(`[FATAL] Hardware handshake lost. Check connection.`, 'error');
    } finally {
      setScanLoading(false);
    }
  };

  // Run absentee engine
  const handleTriggerAbsenteeCheck = async () => {
    setDetectLoading(true);
    addLog('Executing Absentee Detection Engine (Trigger: Morning Cutoff Scheduled Event)...', 'info');
    
    try {
      const res = await fetch('/api/attendance/detect-absentees', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        addLog(`[ENGINE] Cross-referenced daily logs against registered rosters.`, 'info');
        addLog(`[DATABASE] Added ${data.absenteesCount} ABSENT logs in Attendance collection.`, 'db');
        addLog(`[CALL_QUEUE] Enqueued ${data.callsCount} PENDING parent follow-up phone calls.`, 'call');
        
        if (data.absenteesCount > 0) {
          addLog(`Absentees detected: ${data.absentees.map((s: any) => s.name).join(', ')}`, 'warning');
        } else {
          addLog(`Perfect attendance day! No absentees detected today.`, 'success');
        }
        
        // Reload calls list
        const callRes = await fetch('/api/calls');
        const callData = await callRes.json();
        if (callData.success) {
          setCalls(callData.calls);
        }
      } else {
        addLog(`[ERROR] Absentee engine execution halted: ${data.error}`, 'error');
      }
    } catch (err) {
      addLog(`[FATAL] Engine scheduler thread interrupted.`, 'error');
    } finally {
      setDetectLoading(false);
    }
  };

  // Dialog dialogues trees
  const scenarios = {
    UNWELL: {
      dialogue: [
        { speaker: 'AI', text: 'Hello, this is AttendAI calling from Coaching Institute. Am I speaking with the parent of student?' },
        { speaker: 'Parent', text: 'Yes, this is Ramesh Gupta. Is everything okay with Aman?' },
        { speaker: 'AI', text: 'Yes, everything is fine. We are just calling to verify Aman\'s absence. Aman was not in the morning batch class today.' },
        { speaker: 'Parent', text: 'Ah, yes. He caught a severe viral fever last night. He is resting now.' },
        { speaker: 'AI', text: 'Oh, we hope Aman gets well soon. We will share the class notes and lecture recordings so he does not miss out. Thank you.' },
        { speaker: 'Parent', text: 'That would be helpful. Thank you so much.' }
      ],
      outcome: 'Parent notified (Student unwell)',
      summary: 'Verified absence. Parent confirmed student is sick with fever. Shared online study support.'
    },
    VACATION: {
      dialogue: [
        { speaker: 'AI', text: 'Hello, this is AttendAI calling from Coaching Institute. Am I speaking with the parent of student?' },
        { speaker: 'Parent', text: 'Yes, this is Sneha\'s mother. How can I help you?' },
        { speaker: 'AI', text: 'We noticed Sneha was absent from the IIT-JEE lecture batch today. Is everything fine?' },
        { speaker: 'Parent', text: 'Yes, we are out of town attending a family wedding. She will be absent for 2 more days.' },
        { speaker: 'AI', text: 'Understood. We will mark her leave in the roster. Have a safe trip, and we expect her back on Monday.' },
        { speaker: 'Parent', text: 'Yes, thank you for checking.' }
      ],
      outcome: 'Parent notified (Family travel)',
      summary: 'Verified absence. Parent confirmed out of town for wedding. Marked leave until Monday.'
    },
    VOICEMAIL: {
      dialogue: [
        { speaker: 'AI', text: 'Hello, this is AttendAI calling from Coaching Institute. We noticed that student was absent today...' },
        { speaker: 'Parent', text: '[BEEP: Voicemail system. Please leave a message after the tone.]' },
        { speaker: 'AI', text: 'This is a reminder from Coaching Institute regarding student\'s absence today. Please call back to confirm. Thank you.' }
      ],
      outcome: 'No answer (Voicemail)',
      summary: 'Triggered automated dialer. Unreachable, left voicemail note.'
    }
  };

  // Run simulated call
  const triggerCallSimulation = async (call: Call) => {
    setActiveCall(call);
    setCallStatus('DIALING');
    setSimulatedTranscript([]);
    setCallProgressText(`Dialing parent phone ${call.parentPhone}...`);
    
    // Choose dialogue template based on active selection scenario
    const template = scenarios[callScenario];
    
    // Step 1: Dialing status
    addLog(`[SIP/VAPI] Dialing phone channel: ${call.parentPhone} (StudentID: ${call.studentId.studentId})`, 'call');
    
    // Update DB status to CALLING
    await fetch(`/api/calls/${call._id}/simulate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CALLING' })
    });

    setTimeout(async () => {
      // Step 2: Answered
      setCallStatus('TALKING');
      addLog(`[SIP/VAPI] Call Answered. Initializing AI Agent conversation tree...`, 'call');
      
      await fetch(`/api/calls/${call._id}/simulate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ANSWERED' })
      });

      // Render dialogue line-by-line
      let i = 0;
      const conversation = template.dialogue.map(item => ({
        speaker: item.speaker as 'AI' | 'Parent',
        text: item.text.replace('student', call.studentId.name)
      }));

      const printLine = () => {
        if (i < conversation.length) {
          const line = conversation[i];
          setSimulatedTranscript(prev => [...prev, line]);
          setCallProgressText(`AI speaking with Parent...`);
          addLog(`[AI CALL TRANSCRIPT] ${line.speaker}: ${line.text}`, 'call');
          i++;
          setTimeout(printLine, 2000);
        } else {
          // Completed
          finishCall();
        }
      };

      printLine();

      const finishCall = async () => {
        setCallStatus('FINISHED');
        setCallProgressText('Call Completed.');
        
        const finalOutcome = template.outcome;
        const finalSummary = template.summary.replace('student', call.studentId.name);
        
        setActiveOutcome(finalOutcome);
        setActiveSummary(finalSummary);

        // Update DB
        const res = await fetch(`/api/calls/${call._id}/simulate`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'COMPLETED',
            transcript: conversation,
            summary: finalSummary,
            outcome: finalOutcome
          })
        });

        const data = await res.json();
        if (data.success) {
          addLog(`[SIP/VAPI] Session hangup received. Call processed successfully.`, 'call');
          addLog(`[DATABASE] Call updated: status=COMPLETED, outcome="${finalOutcome}"`, 'db');
          
          // Confetti!
          confetti({
            particleCount: 40,
            spread: 30,
            colors: ['#064e3b', '#ffffff']
          });

          // Reload calls
          const callRes = await fetch('/api/calls');
          const callData = await callRes.json();
          if (callData.success) {
            setCalls(callData.calls);
          }
        }
      };

    }, 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          AttendAI Simulators
        </h1>
        <p className="text-zinc-400 mt-1 font-light text-sm">
          Simulate hardware events (QR/RFID card readers), trigger daily absentee check routines, and monitor AI-powered follow-up calls in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Device & Engine Simulator */}
        <div className="space-y-6 xl:col-span-2">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Device Simulator Card */}
            <div className="border border-zinc-800 bg-zinc-900/20 rounded-xl p-6 space-y-5">
              <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Cpu className="h-4.5 w-4.5 text-emerald-400" />
                Hardware Terminal Simulator
              </h2>
              
              <form onSubmit={handleSimulateScan} className="space-y-4 text-xs font-light">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Student Scan Target</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg px-2.5 py-2 text-zinc-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {students.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.studentId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Reader Channel</label>
                    <select
                      value={selectedSource}
                      onChange={(e: any) => setSelectedSource(e.target.value)}
                      className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg px-2 py-2 text-zinc-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="QR">QR Code Scanner</option>
                      <option value="RFID">RFID Card Swiper</option>
                      <option value="BIOMETRIC">Thumb Scanner</option>
                      <option value="FACE">Face Camera Sensor</option>
                      <option value="MANUAL">Faculty Manual entry</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Attendance State</label>
                    <select
                      value={selectedStatus}
                      onChange={(e: any) => setSelectedStatus(e.target.value)}
                      className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg px-2 py-2 text-zinc-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="PRESENT">Mark Present</option>
                      <option value="LATE">Mark Late</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={scanLoading || !selectedStudentId}
                  className="w-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs font-mono uppercase tracking-wide py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {scanLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />
                  ) : (
                    <Power className="h-3.5 w-3.5" />
                  )}
                  Simulate Reader Input
                </button>
              </form>
            </div>

            {/* Engine Trigger Card */}
            <div className="border border-zinc-800 bg-zinc-900/20 rounded-xl p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 text-amber-400" />
                  Absentee Detection Engine
                </h2>
                <p className="text-zinc-400 text-xs leading-relaxed font-light">
                  Coaching institutes enforce cutoff schedules (e.g., 9:15 AM). Clicking below simulates this scheduler check: it evaluates who hasn't scanned in today, registers them as absent, and automatically creates phone calling queues.
                </p>
              </div>

              <button
                onClick={handleTriggerAbsenteeCheck}
                disabled={detectLoading}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs font-mono uppercase tracking-wide py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {detectLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                ) : (
                  <Play className="h-3.5 w-3.5 text-amber-400" />
                )}
                Run Daily Cutoff Engine
              </button>
            </div>
          </div>

          {/* Bottom Terminal Log Box */}
          <div className="border border-zinc-800 bg-black rounded-xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
              <h3 className="text-xs font-semibold text-zinc-300 font-mono flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-emerald-400" />
                Live Node Console logs
              </h3>
              <button
                onClick={() => setLogs([])}
                className="text-[10px] text-zinc-650 hover:text-zinc-400 font-mono cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="h-60 overflow-y-auto font-mono text-[10px] space-y-1.5 scrollbar-thin select-text">
              {logs.map((log, index) => {
                const colors = {
                  info: 'text-zinc-500',
                  success: 'text-emerald-400',
                  warning: 'text-amber-400',
                  error: 'text-red-400',
                  db: 'text-purple-400',
                  call: 'text-blue-400'
                };
                return (
                  <div key={index} className="flex gap-2">
                    <span className="text-zinc-700 shrink-0">{log.time}</span>
                    <span className={colors[log.type] || 'text-zinc-300'}>{log.message}</span>
                  </div>
                );
              })}
              <div ref={terminalEndRef} />
            </div>
          </div>

        </div>

        {/* Right Column: AI Call Simulator Interface */}
        <div className="border border-zinc-800 bg-zinc-900/10 rounded-xl p-6 space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <PhoneCall className="h-4.5 w-4.5 text-blue-400" />
              AI Phone Call Simulator
            </h2>
            <p className="text-zinc-500 text-xs mt-1 font-light">
              Dial parent phone lines, generate simulated typewriter conversation, and log responses back to MongoDB.
            </p>
          </div>

          {/* Call Configuration scenario */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Pick Call Scenario</label>
            <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 border border-zinc-850 rounded-lg">
              <button
                type="button"
                onClick={() => setCallScenario('UNWELL')}
                disabled={callStatus !== 'IDLE'}
                className={`py-1.5 text-[9px] font-mono font-medium rounded transition-colors cursor-pointer ${
                  callScenario === 'UNWELL' ? 'bg-zinc-850 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Sick Fever
              </button>
              <button
                type="button"
                onClick={() => setCallScenario('VACATION')}
                disabled={callStatus !== 'IDLE'}
                className={`py-1.5 text-[9px] font-mono font-medium rounded transition-colors cursor-pointer ${
                  callScenario === 'VACATION' ? 'bg-zinc-850 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Wedding
              </button>
              <button
                type="button"
                onClick={() => setCallScenario('VOICEMAIL')}
                disabled={callStatus !== 'IDLE'}
                className={`py-1.5 text-[9px] font-mono font-medium rounded transition-colors cursor-pointer ${
                  callScenario === 'VOICEMAIL' ? 'bg-zinc-850 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Voicemail
              </button>
            </div>
          </div>

          {/* Phone Console Panel */}
          <div className="border border-zinc-850 bg-zinc-950/80 rounded-2xl p-5 min-h-[360px] flex flex-col justify-between relative overflow-hidden">
            
            {callStatus === 'IDLE' ? (
              // Empty State
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-4">
                <div className="w-12 h-12 rounded-full border border-zinc-800 bg-zinc-900/30 flex items-center justify-center text-zinc-500">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-zinc-300 font-mono">Device Console Idle</h4>
                  <p className="text-[10px] text-zinc-500 leading-normal max-w-[200px] mx-auto font-light">
                    Select a student call from the list below and click "Initiate Call" to begin voice simulation.
                  </p>
                </div>
              </div>
            ) : (
              // Active Call Console Screen
              <div className="flex-1 flex flex-col justify-between space-y-4">
                {/* Visualizer header */}
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div>
                    <h4 className="font-semibold text-white text-xs">{activeCall?.studentId.name}</h4>
                    <span className="text-[9px] font-mono text-zinc-500 block mt-0.5">
                      PARENTS: {activeCall?.parentPhone}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Volume2 className="h-3.5 w-3.5 text-blue-400 animate-bounce" />
                    <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest animate-pulse font-bold">
                      {callStatus}
                    </span>
                  </div>
                </div>

                {/* Conversation Scroller dialogue */}
                <div className="flex-1 overflow-y-auto max-h-[200px] pr-1 space-y-2.5 text-[11px] font-light leading-relaxed scrollbar-thin">
                  {simulatedTranscript.map((t, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border max-w-[85%] ${
                        t.speaker === 'AI'
                          ? 'bg-blue-500/5 border-blue-500/10 text-zinc-100 mr-auto'
                          : 'bg-zinc-900 border-zinc-850 text-emerald-400 ml-auto'
                      }`}
                    >
                      <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-0.5 leading-none">
                        {t.speaker === 'AI' ? 'AttendAI Agent' : 'Parent'}
                      </span>
                      {t.text}
                    </div>
                  ))}
                </div>

                {/* Progress bar info */}
                <div className="pt-2 border-t border-zinc-900 text-center space-y-2">
                  <p className="text-[10px] text-zinc-400 font-mono">{callProgressText}</p>
                  
                  {callStatus === 'FINISHED' && (
                    <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-lg text-left text-[10px] space-y-1.5 font-light">
                      <p><span className="text-zinc-500 font-semibold uppercase tracking-wider font-mono">Outcome:</span> <strong className="text-emerald-400 font-medium">{activeOutcome}</strong></p>
                      <p className="leading-relaxed"><span className="text-zinc-500 font-semibold uppercase tracking-wider font-mono">Summary:</span> {activeSummary}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Back Glow during calls */}
            {callStatus === 'DIALING' && (
              <div className="absolute inset-0 bg-blue-500/5 animate-pulse pointer-events-none" />
            )}
            {callStatus === 'TALKING' && (
              <div className="absolute inset-0 bg-emerald-500/2 pointer-events-none" />
            )}
          </div>

          {/* Queued Pending calls table list */}
          <div className="space-y-2.5">
            <h3 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Pending Voice Queue ({calls.filter(c => c.status === 'PENDING').length})
            </h3>
            
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {calls.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-550 border border-dashed border-zinc-800 rounded-lg">
                  Queue is empty. Mark absentees to see pending list.
                </div>
              ) : (
                calls.map((call) => (
                  <div key={call._id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-850 bg-zinc-950/20 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-white">{call.studentId?.name}</div>
                      <div className="text-[9px] text-zinc-500 font-mono">
                        PARENT: {call.parentPhone} • STATUS: {call.status}
                      </div>
                    </div>
                    {call.status === 'PENDING' ? (
                      <button
                        onClick={() => triggerCallSimulation(call)}
                        disabled={callStatus !== 'IDLE'}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold font-mono uppercase tracking-wider bg-white hover:bg-zinc-200 text-black rounded transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Dial
                      </button>
                    ) : (
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">
                        {call.status === 'COMPLETED' ? 'Completed' : 'Active'}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
