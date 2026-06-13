'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Plus, 
  Search, 
  Loader2, 
  Layers, 
  Clock, 
  Users, 
  Percent,
  Tag,
  AlertCircle,
  X,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface BatchStat {
  _id: string;
  name: string;
  course: string;
  timeSlot: string;
  studentCount: number;
  attendanceRate: number;
}

export default function BatchDirectoryPage() {
  const { data: session } = useSession();
  const isReadOnly = false;

  const [batches, setBatches] = useState<BatchStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCourse, setFormCourse] = useState('');
  const [formTimeSlot, setFormTimeSlot] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/batches/stats');
      const data = await res.json();
      if (data.success) {
        setBatches(data.batches);
      }
    } catch (error) {
      console.error('Error fetching batch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredBatches = batches.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open Modal
  const openCreateModal = () => {
    setFormName('');
    setFormCourse('');
    setFormTimeSlot('08:00 AM - 11:00 AM');
    setFormError('');
    setIsOpen(true);
  };

  // Save new batch
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    if (!formName || !formCourse || !formTimeSlot) {
      setFormError('All fields are required.');
      setFormLoading(false);
      return;
    }

    try {
      const payload = {
        name: formName,
        course: formCourse,
        timeSlot: formTimeSlot,
      };

      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsOpen(false);
        fetchData(); // Refresh list to get new stats
      } else {
        setFormError(data.error || 'Failed to create batch.');
      }
    } catch (error) {
      setFormError('Connection issue. Try again later.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
            Batch Directory
          </h1>
          <p className="text-zinc-400 mt-1 font-light text-sm">
            Manage academic batches, course tracks, and monitor overall batch performance.
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold font-mono uppercase tracking-wider bg-white hover:bg-zinc-200 text-black rounded-lg transition-all shadow-md cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            New Batch
          </button>
        )}
      </div>

      {/* Control Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by batch name or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/40 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-light"
          />
        </div>
      </div>

      {/* Data Section */}
      <div className="border border-zinc-800 bg-zinc-900/10 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-xs text-zinc-400 font-mono">Syncing batch registries...</p>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-600">
              <Layers className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-zinc-900">No Batches Found</h3>
              <p className="text-zinc-500 text-sm mt-1 max-w-md mx-auto font-light">
                {searchTerm
                  ? "No batches matching your search query are registered in the system."
                  : "Start structuring your coaching institute by creating your first batch."}
              </p>
            </div>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-emerald-400 font-mono hover:underline cursor-pointer"
              >
                Clear active filters
              </button>
            ) : null}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/60 border-b border-zinc-850 text-xs font-mono uppercase text-zinc-500 tracking-wider">
                <tr>
                  <th className="py-4 px-6 font-medium">Batch Name</th>
                  <th className="py-4 px-6 font-medium">Course Category</th>
                  <th className="py-4 px-6 font-medium">Schedule</th>
                  <th className="py-4 px-6 font-medium text-center">Total Enrolled</th>
                  <th className="py-4 px-6 font-medium text-right">Today's Attendance</th>
                  <th className="py-4 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 bg-zinc-900/10">
                {filteredBatches.map((batch) => (
                  <tr key={batch._id} className="hover:bg-zinc-900/30 transition-colors group">
                    {/* Batch Name */}
                    <td className="py-4.5 px-6 font-medium text-zinc-900 flex items-center gap-3">
                      <div className="h-8.5 w-8.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        {batch.name.charAt(0)}
                      </div>
                      <span className="font-semibold">{batch.name}</span>
                    </td>

                    {/* Course */}
                    <td className="py-4.5 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-800 border border-zinc-850 text-zinc-700">
                        <Tag className="h-3 w-3 text-zinc-500" />
                        {batch.course}
                      </span>
                    </td>

                    {/* Schedule */}
                    <td className="py-4.5 px-6 text-xs text-zinc-500 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-zinc-500" />
                        {batch.timeSlot}
                      </div>
                    </td>

                    {/* Enrolled */}
                    <td className="py-4.5 px-6 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">
                        <Users className="h-3.5 w-3.5" />
                        {batch.studentCount}
                      </div>
                    </td>

                    {/* Attendance Rate */}
                    <td className="py-4.5 px-6 text-right">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                        batch.attendanceRate >= 80 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                          : batch.attendanceRate >= 50
                          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                          : 'bg-red-500/10 border border-red-500/20 text-red-400'
                      }`}>
                        {batch.attendanceRate}%
                      </div>
                    </td>
                    
                    {/* Actions */}
                    <td className="py-4.5 px-6 text-right">
                      <Link
                        href={`/dashboard/batches/${batch._id}`}
                        className="inline-flex p-1.5 hover:text-emerald-400 text-zinc-500 hover:bg-zinc-800/80 rounded transition-all cursor-pointer"
                        title="View batch details"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Overlay Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[500px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-7 relative">
            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4.5 top-4.5 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Title */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-400" />
                Register New Batch
              </h2>
              <p className="text-zinc-400 text-xs mt-1 font-light">
                Create a new academic track to assign students and monitor performance.
              </p>
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg mb-5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 font-light text-sm">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Batch Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
                  placeholder="e.g. IIT-JEE Master Batch A"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Course Track</label>
                <input
                  type="text"
                  required
                  value={formCourse}
                  onChange={(e) => setFormCourse(e.target.value)}
                  className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
                  placeholder="e.g. IIT-JEE Prep"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Time Slot</label>
                <input
                  type="text"
                  required
                  value={formTimeSlot}
                  onChange={(e) => setFormTimeSlot(e.target.value)}
                  className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
                  placeholder="e.g. 08:00 AM - 11:00 AM"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-mono uppercase tracking-wide transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-white text-black font-semibold text-xs font-mono uppercase tracking-wide hover:bg-zinc-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {formLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
