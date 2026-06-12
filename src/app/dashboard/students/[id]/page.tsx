'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Loader2, 
  User, 
  Phone, 
  Tag,
  Percent,
  PhoneCall,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  X
} from 'lucide-react';

interface TranscriptItem {
  speaker: 'AI' | 'Parent';
  text: string;
}

interface CallLog {
  _id: string;
  date: string;
  status: string;
  summary: string;
  outcome: string;
  transcript: TranscriptItem[];
}

interface AttendanceRecord {
  _id: string;
  date: string;
  status: string;
}

interface StudentDetail {
  studentDetails: {
    name: string;
    studentId: string;
    parentName: string;
    parentPhone: string;
    course: string;
    batchName: string;
  };
  attendanceRate: number;
  totalCalls: number;
  attendanceRecords: AttendanceRecord[];
  callLogs: CallLog[];
}

export default function StudentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [data, setData] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/students/${id}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch student details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStudentData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-xs text-zinc-400 font-mono">Loading student records...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-20 text-center space-y-4">
        <div className="inline-flex p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-600">
          <User className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-zinc-900">Student Not Found</h3>
          <p className="text-zinc-500 text-sm mt-1 max-w-md mx-auto font-light">
            The student profile you are looking for does not exist or has been removed.
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/students')}
          className="text-xs text-emerald-400 font-mono hover:underline cursor-pointer"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  const { studentDetails, attendanceRate, totalCalls, attendanceRecords, callLogs } = data;

  // Helper to find a call log for a specific date
  const getCallForDate = (dateStr: string) => {
    const targetDate = new Date(dateStr);
    return callLogs.find(log => {
      const logDate = new Date(log.date);
      return logDate.getDate() === targetDate.getDate() &&
             logDate.getMonth() === targetDate.getMonth() &&
             logDate.getFullYear() === targetDate.getFullYear();
    });
  };

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div>
        <button 
          onClick={() => router.push('/dashboard/students')}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-emerald-400 transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Directory
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-2xl">
              {studentDetails.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
                {studentDetails.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                <span className="inline-flex items-center gap-1.5 text-sm text-zinc-400 font-mono">
                  ID: {studentDetails.studentId}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-zinc-400">
                  <Tag className="h-4 w-4" />
                  {studentDetails.course} ({studentDetails.batchName})
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-zinc-400">
                  <Phone className="h-4 w-4" />
                  {studentDetails.parentName} ({studentDetails.parentPhone})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-zinc-850 bg-zinc-900/10 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Overall Attendance
            </span>
            <Percent className="h-4.5 w-4.5 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold tracking-tight text-zinc-900 font-mono leading-none">
              {attendanceRate}%
            </span>
          </div>
        </div>

        <div className="border border-zinc-850 bg-zinc-900/10 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Parent Calls Triggered
            </span>
            <PhoneCall className="h-4.5 w-4.5 text-blue-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold tracking-tight text-zinc-900 font-mono leading-none">
              {totalCalls}
            </span>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="border border-zinc-800 bg-zinc-900/10 rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-zinc-850">
          <h3 className="text-sm font-semibold text-zinc-900 font-mono uppercase tracking-wider">
            Recent Attendance & Call Logs
          </h3>
          <p className="text-zinc-500 text-xs mt-0.5 font-light">
            Review the last 30 days of attendance. Access the AI call transcripts directly for any absences.
          </p>
        </div>
        
        {attendanceRecords.length === 0 ? (
          <div className="p-10 text-center text-zinc-500 text-sm font-light">
            No attendance records found for this student.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/60 border-b border-zinc-850 text-xs font-mono uppercase text-zinc-500 tracking-wider">
                <tr>
                  <th className="py-4 px-6 font-medium">Date</th>
                  <th className="py-4 px-6 font-medium text-center">Status</th>
                  <th className="py-4 px-6 font-medium text-right">Related Call Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 bg-zinc-900/10">
                {attendanceRecords.map((record) => {
                  const d = new Date(record.date);
                  const isAbsent = record.status === 'ABSENT';
                  const relatedCall = isAbsent ? getCallForDate(record.date) : null;

                  return (
                    <tr key={record._id} className="hover:bg-zinc-900/30 transition-colors group">
                      {/* Date */}
                      <td className="py-4.5 px-6 font-medium text-zinc-900">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700">
                            <span className="text-[10px] text-zinc-500 uppercase leading-none mt-1">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                            <span className="text-sm font-bold text-zinc-900 leading-none mt-1">{d.getDate()}</span>
                          </div>
                          <span className="text-zinc-400 font-light text-xs">
                            {d.toLocaleDateString('en-US', { weekday: 'long' })}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4.5 px-6 text-center">
                        {record.status === 'PRESENT' ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                            <CheckCircle className="h-3.5 w-3.5" /> PRESENT
                          </div>
                        ) : record.status === 'LATE' ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
                            <Clock className="h-3.5 w-3.5" /> LATE
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                            <XCircle className="h-3.5 w-3.5" /> ABSENT
                          </div>
                        )}
                      </td>

                      {/* Related Call Log */}
                      <td className="py-4.5 px-6 text-right">
                        {isAbsent ? (
                          relatedCall ? (
                            <button
                              onClick={() => setSelectedCall(relatedCall)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 rounded-md transition-all text-xs font-mono uppercase tracking-wider cursor-pointer"
                            >
                              <PhoneCall className="h-3.5 w-3.5" />
                              View Call
                            </button>
                          ) : (
                            <span className="text-xs text-zinc-500 font-light italic">
                              No call recorded
                            </span>
                          )
                        ) : (
                          <span className="text-zinc-600">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Call Details Overlay Modal */}
      {selectedCall && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[600px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 flex items-start justify-between bg-zinc-900/50">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 flex items-center gap-2">
                  <PhoneCall className="h-5 w-5 text-blue-400" />
                  AI Call Log Details
                </h2>
                <p className="text-zinc-400 text-xs mt-1 font-light">
                  Date: {new Date(selectedCall.date).toLocaleString()} | Status: <span className="font-mono text-zinc-300">{selectedCall.status}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedCall(null)}
                className="text-zinc-400 hover:text-white transition-all cursor-pointer p-1 bg-zinc-800 hover:bg-zinc-700 rounded-full"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto font-light text-sm space-y-6">
              
              {/* Outcome & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                  <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Outcome</span>
                  <p className="text-zinc-300">{selectedCall.outcome || 'N/A'}</p>
                </div>
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                  <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Summary</span>
                  <p className="text-zinc-300">{selectedCall.summary || 'No summary generated.'}</p>
                </div>
              </div>

              {/* Transcript */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-zinc-400" />
                  Full Transcript
                </h3>
                
                <div className="space-y-4">
                  {selectedCall.transcript && selectedCall.transcript.length > 0 ? (
                    selectedCall.transcript.map((line, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col ${line.speaker === 'AI' ? 'items-start' : 'items-end'}`}
                      >
                        <span className="text-[10px] font-mono text-zinc-500 mb-1 px-1">
                          {line.speaker === 'AI' ? 'AttendAI Agent' : 'Parent'}
                        </span>
                        <div 
                          className={`px-4 py-2.5 rounded-2xl max-w-[85%] ${
                            line.speaker === 'AI' 
                              ? 'bg-zinc-800 text-zinc-200 rounded-tl-sm' 
                              : 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-sm'
                          }`}
                        >
                          {line.text}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-6 border border-dashed border-zinc-800 rounded-xl text-zinc-500 italic">
                      No transcript available for this call.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
