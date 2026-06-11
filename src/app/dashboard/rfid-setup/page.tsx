'use client';

import { useState, useEffect, useRef } from 'react';
import { CreditCard, Save, CheckCircle2, User, Cpu, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Student {
  _id: string;
  studentId: string;
  name: string;
  batchName?: string;
  course: string;
  rfidCardId: string;
}

export default function RfidSetupPage() {
  const { data: session } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [scannedRfid, setScannedRfid] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const rfidInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  // Auto-focus the RFID input when a student is selected
  useEffect(() => {
    if (selectedStudent && rfidInputRef.current) {
      rfidInputRef.current.focus();
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/students');
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error('Failed to fetch students', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAssignRfid = async () => {
    if (!selectedStudent || !scannedRfid) {
      showToast('Please select a student and scan an RFID tag', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/students/${selectedStudent._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rfidCardId: scannedRfid })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`RFID assigned to ${selectedStudent.name} successfully!`, 'success');
        setScannedRfid('');
        setSelectedStudent(null);
        fetchStudents(); // Refresh the list
      } else {
        showToast(data.error || 'Failed to assign RFID', 'error');
      }
    } catch (err) {
      showToast('A network error occurred', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Keyboard wedge listener for the input field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAssignRfid();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-black min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <CreditCard className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Hardware RFID Enrollment</h1>
              <p className="text-zinc-400 text-sm mt-1">
                Map physical RFID card UIDs to enrolled students for seamless hardware attendance scanning.
              </p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Student Selection */}
          <div className="lg:col-span-7 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" /> 
              Select Student
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {students.map((student) => (
                  <div 
                    key={student._id}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedStudent?._id === student._id 
                        ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                        : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50'
                    }`}
                  >
                    <div>
                      <p className="text-white font-medium">{student.name}</p>
                      <p className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                        <span className="font-mono text-zinc-400">{student.studentId}</span>
                        <span>•</span>
                        <span>{student.course}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      {student.rfidCardId ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg text-[10px] font-medium font-mono uppercase tracking-wider border border-emerald-400/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Assigned
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-zinc-500 bg-zinc-800/50 px-2.5 py-1 rounded-lg text-[10px] font-medium font-mono uppercase tracking-wider border border-zinc-700/50">
                          Unassigned
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Hardware Scanner Input */}
          <div className="lg:col-span-5">
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" /> 
                Hardware Assignment
              </h2>

              {selectedStudent ? (
                <div className="space-y-6">
                  <div className="p-4 bg-black/40 border border-zinc-800 rounded-xl">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-mono mb-1">Target Student</p>
                    <p className="text-white font-semibold text-lg">{selectedStudent.name}</p>
                    <p className="text-zinc-400 text-sm font-mono">{selectedStudent.studentId}</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-zinc-300 block">
                      Awaiting Hardware Scan...
                    </label>
                    <input
                      ref={rfidInputRef}
                      type="text"
                      value={scannedRfid}
                      onChange={(e) => setScannedRfid(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Tap RFID Card to Reader..."
                      className="w-full bg-zinc-950/70 border border-emerald-500/30 rounded-xl px-4 py-3.5 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all placeholder:text-zinc-600 placeholder:font-sans"
                    />
                    <p className="text-[11px] text-zinc-500">
                      Ensure your USB RFID Reader is connected. Tapping a card will automatically populate the UID and save.
                    </p>
                  </div>

                  <button
                    onClick={handleAssignRfid}
                    disabled={saving || !scannedRfid}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-colors"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Assignment
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-800 rounded-xl bg-black/20">
                  <User className="w-10 h-10 text-zinc-600 mb-3" />
                  <p className="text-zinc-400 font-medium">No Student Selected</p>
                  <p className="text-zinc-600 text-xs mt-1 max-w-[200px]">
                    Please select a student from the list to assign an RFID card.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-2xl animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
