'use client';

import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  Search, 
  MessageSquare, 
  FileText, 
  Clock, 
  Tag, 
  Loader2, 
  CheckCircle,
  HelpCircle,
  Volume2
} from 'lucide-react';

interface Student {
  _id: string;
  studentId: string;
  name: string;
  parentPhone: string;
}

interface Call {
  _id: string;
  studentId: Student;
  parentPhone: string;
  timestamp: string;
  status: 'PENDING' | 'CALLING' | 'ANSWERED' | 'NO_ANSWER' | 'COMPLETED';
  transcript: Array<{ speaker: 'AI' | 'Parent'; text: string }>;
  summary: string;
  outcome: string;
  createdAt: string;
}

export default function CallingDashboardPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch calls
  const fetchCalls = async () => {
    try {
      const res = await fetch('/api/calls');
      const data = await res.json();
      if (data.success) {
        setCalls(data.calls);
        if (data.calls.length > 0 && !selectedCallId) {
          setSelectedCallId(data.calls[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const activeCall = calls.find(c => c._id === selectedCallId);

  // Filters
  const filteredCalls = calls.filter(call => {
    const matchesSearch = 
      call.studentId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.parentPhone.includes(searchQuery) ||
      call.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter ? call.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'CALLING':
      case 'ANSWERED':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400 animate-pulse';
      case 'PENDING':
        return 'bg-zinc-800 border-zinc-850 text-zinc-400';
      default:
        return 'bg-red-500/10 border-red-500/20 text-red-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          AI Call Center
        </h1>
        <p className="text-zinc-400 mt-1 font-light text-sm">
          Review automated parent phone calls, examine transcription details, and audit call outcomes.
        </p>
      </div>

      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center gap-3 border border-zinc-850 rounded-xl bg-zinc-900/10">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-xs text-zinc-400 font-mono">Loading active phone rosters...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Panel: List of Calls */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Filters */}
            <div className="space-y-3 p-4 border border-zinc-800 bg-zinc-900/10 rounded-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search student or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-light"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 transition-all font-light cursor-pointer"
              >
                <option value="">All Call Statuses</option>
                <option value="PENDING">Pending (Queued)</option>
                <option value="CALLING">Calling (Dialing)</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* List */}
            <div className="border border-zinc-800 bg-zinc-900/10 rounded-xl divide-y divide-zinc-850 overflow-hidden max-h-[500px] overflow-y-auto">
              {filteredCalls.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500 font-light">
                  No call records found.
                </div>
              ) : (
                filteredCalls.map((call) => (
                  <div
                    key={call._id}
                    onClick={() => setSelectedCallId(call._id)}
                    className={`p-4 transition-all cursor-pointer text-xs space-y-2 ${
                      selectedCallId === call._id
                        ? 'bg-zinc-900/40 border-l-2 border-emerald-500'
                        : 'hover:bg-zinc-900/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white truncate">
                        {call.studentId?.name || 'Unknown student'}
                      </span>
                      <span className={`px-2 py-0.5 border text-[9px] font-mono font-bold rounded leading-none ${getStatusBadge(call.status)}`}>
                        {call.status}
                      </span>
                    </div>

                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                      <span>{call.parentPhone}</span>
                      <span>
                        {new Date(call.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {call.outcome && (
                      <p className="text-[10px] text-zinc-400 font-light truncate">
                        Outcome: <span className="text-zinc-200">{call.outcome}</span>
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>

          {/* Right Panel: Call Details Transcript Viewer */}
          <div className="lg:col-span-2 border border-zinc-850 bg-zinc-900/10 rounded-2xl overflow-hidden shadow-2xl">
            {activeCall ? (
              <div>
                {/* Details Header */}
                <div className="p-6 border-b border-zinc-850 bg-zinc-950/40 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white leading-none">
                        {activeCall.studentId?.name || 'Unknown Student'}
                      </h2>
                      <span className={`px-2 py-0.5 border text-[9px] font-mono font-bold rounded uppercase ${getStatusBadge(activeCall.status)}`}>
                        {activeCall.status}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-xs font-light">
                      Parent Phone Number: <strong className="text-zinc-200 font-mono font-normal">{activeCall.parentPhone}</strong>
                    </p>
                  </div>

                  <div className="text-right text-[10px] font-mono text-zinc-500 space-y-1">
                    <p className="flex items-center gap-1 justify-end">
                      <Clock className="h-3 w-3" />
                      {new Date(activeCall.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    {activeCall.outcome && (
                      <span className="inline-block px-2 py-0.5 bg-zinc-850 text-zinc-300 rounded text-[9px] border border-zinc-800 font-bold uppercase tracking-wider">
                        {activeCall.outcome}
                      </span>
                    )}
                  </div>
                </div>

                {/* Call Main Body */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
                  
                  {/* Left Column: Dialogue Transcripts */}
                  <div className="md:col-span-3 space-y-4">
                    <h3 className="text-xs font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4 text-emerald-400" />
                      Call Dialogue Transcript
                    </h3>
                    
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      {activeCall.transcript && activeCall.transcript.length > 0 ? (
                        activeCall.transcript.map((t, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border text-xs leading-relaxed font-light ${
                              t.speaker === 'AI'
                                ? 'bg-blue-500/5 border-blue-500/10 text-zinc-200 mr-8'
                                : 'bg-zinc-900 border-zinc-850 text-emerald-400 ml-8'
                            }`}
                          >
                            <span className="block text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1 font-bold">
                              {t.speaker === 'AI' ? 'AttendAI Agent' : 'Parent'}
                            </span>
                            {t.text}
                          </div>
                        ))
                      ) : (
                        <div className="py-20 text-center text-zinc-550 font-light italic">
                          {activeCall.status === 'PENDING'
                            ? "This call is queued. Go to Simulators to trigger dialogue simulations."
                            : "No dialogue recorded. Call failed to connect."}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Summarization / Outcomes */}
                  <div className="md:col-span-2 space-y-5 border-t md:border-t-0 md:border-l border-zinc-850 pt-5 md:pt-0 md:pl-5">
                    
                    {/* Summary */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-emerald-400" />
                        AI Summary Abstract
                      </h4>
                      {activeCall.summary ? (
                        <p className="text-zinc-350 text-xs leading-relaxed font-light bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                          {activeCall.summary}
                        </p>
                      ) : (
                        <p className="text-zinc-650 text-xs italic font-light">
                          Awaiting voice session processing to generate abstract summary.
                        </p>
                      )}
                    </div>

                    {/* Vapi Details */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <Volume2 className="h-4 w-4 text-emerald-400" />
                        Call Session Node
                      </h4>
                      <div className="text-[10px] text-zinc-500 font-mono space-y-1 bg-zinc-950/40 p-3 rounded-lg border border-zinc-850">
                        <p>DIALER: SIP / Vapi AI</p>
                        <p>LATENCY: 120ms</p>
                        <p>SIP HEADER: VAPI-NOD-5582</p>
                        <p>OUTCOME CODE: {activeCall.outcome ? '200_OK' : '404_QUEUED'}</p>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            ) : (
              <div className="p-20 text-center text-zinc-550 font-light">
                Select a phone log to review full dialogue records.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
