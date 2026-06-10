'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  UserPlus, 
  Phone, 
  User, 
  Tag,
  AlertCircle,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface Student {
  _id: string;
  studentId: string;
  name: string;
  photoUrl: string;
  parentName: string;
  parentPhone: string;
  batchId: {
    _id: string;
    name: string;
    course: string;
    timeSlot: string;
  } | string;
  course: string;
  qrCodeData: string;
}

interface Batch {
  _id: string;
  name: string;
  course: string;
  timeSlot: string;
}

export default function StudentDirectoryPage() {
  const { data: session } = useSession();
  const isReadOnly = false;

  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('');

  // Form Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form Fields
  const [formStudentId, setFormStudentId] = useState('');
  const [formName, setFormName] = useState('');
  const [formParentName, setFormParentName] = useState('');
  const [formParentPhone, setFormParentPhone] = useState('');
  const [formBatchId, setFormBatchId] = useState('');
  const [formCourse, setFormCourse] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch batches
      const batchRes = await fetch('/api/batches');
      const batchData = await batchRes.json();
      if (batchData.success) {
        setBatches(batchData.batches);
      }

      // Fetch students with filters
      let studentUrl = '/api/students';
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedBatchFilter) params.append('batchId', selectedBatchFilter);
      if (params.toString()) studentUrl += `?${params.toString()}`;

      const studentRes = await fetch(studentUrl);
      const studentData = await studentRes.json();
      if (studentData.success) {
        setStudents(studentData.students);
      }
    } catch (error) {
      console.error('Error fetching student directory data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, selectedBatchFilter]);

  // Open Modal
  const openCreateModal = () => {
    setModalMode('CREATE');
    setSelectedStudent(null);
    setFormStudentId(`STD${Math.floor(100 + Math.random() * 900)}`);
    setFormName('');
    setFormParentName('');
    setFormParentPhone('');
    setFormBatchId(batches[0]?._id || '');
    setFormCourse(batches[0]?.course || '');
    setFormError('');
    setIsOpen(true);
  };

  const openEditModal = (student: Student) => {
    setModalMode('EDIT');
    setSelectedStudent(student);
    setFormStudentId(student.studentId);
    setFormName(student.name);
    setFormParentName(student.parentName);
    setFormParentPhone(student.parentPhone);
    const bid = typeof student.batchId === 'object' ? student.batchId._id : student.batchId;
    setFormBatchId(bid);
    setFormCourse(student.course);
    setFormError('');
    setIsOpen(isOpen || true);
  };

  // Auto-set course when batch is selected
  const handleBatchChange = (bId: string) => {
    setFormBatchId(bId);
    const selected = batches.find(b => b._id === bId);
    if (selected) {
      setFormCourse(selected.course);
    }
  };

  // Save changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    if (!formStudentId || !formName || !formParentName || !formParentPhone || !formBatchId || !formCourse) {
      setFormError('All fields are required.');
      setFormLoading(false);
      return;
    }

    try {
      const payload = {
        studentId: formStudentId,
        name: formName,
        parentName: formParentName,
        parentPhone: formParentPhone,
        batchId: formBatchId,
        course: formCourse,
      };

      const url = modalMode === 'CREATE' ? '/api/students' : `/api/students/${selectedStudent?._id}`;
      const method = modalMode === 'CREATE' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsOpen(false);
        fetchData();
      } else {
        setFormError(data.error || 'Failed to save student profile.');
      }
    } catch (error) {
      setFormError('Connection issue. Try again later.');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete student
  const handleDelete = async (id: string) => {
    if (isReadOnly) return;
    if (!confirm('Are you sure you want to remove this student? All attendance records will be archived.')) return;

    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || 'Failed to delete student.');
      }
    } catch (error) {
      alert('Failed to delete student due to a connection issue.');
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Student Directory
          </h1>
          <p className="text-zinc-400 mt-1 font-light text-sm">
            Register students, manage academic batches, and generate individual QR ID cards.
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold font-mono uppercase tracking-wider bg-white hover:bg-zinc-200 text-black rounded-lg transition-all shadow-md cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Student
          </button>
        )}
      </div>

      {/* Control Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-3 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by student name, ID, or parent name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/40 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all font-light"
          />
        </div>

        {/* Batch Filter */}
        <div>
          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(e.target.value)}
            className="w-full bg-zinc-900/40 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500 transition-all font-light cursor-pointer"
          >
            <option value="">All Batches</option>
            {batches.map((batch) => (
              <option key={batch._id} value={batch._id}>
                {batch.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Section */}
      <div className="border border-zinc-800 bg-zinc-900/10 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-xs text-zinc-400 font-mono">Syncing database registers...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-600">
              <UserPlus className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">No Students Found</h3>
              <p className="text-zinc-500 text-sm mt-1 max-w-md mx-auto font-light">
                {searchTerm || selectedBatchFilter
                  ? "No records matching your search queries or filter choices are registered in the system."
                  : "Start populating your coaching institute by adding your very first student."}
              </p>
            </div>
            {searchTerm || selectedBatchFilter ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBatchFilter('');
                }}
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
                  <th className="py-4 px-6 font-medium">Student Info</th>
                  <th className="py-4 px-6 font-medium">Student ID</th>
                  <th className="py-4 px-6 font-medium">Batch Assigned</th>
                  <th className="py-4 px-6 font-medium">Course Category</th>
                  <th className="py-4 px-6 font-medium">Parent Contact</th>
                  <th className="py-4 px-6 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 bg-zinc-900/10">
                {students.map((student) => {
                  const studentBatch = typeof student.batchId === 'object' ? student.batchId : null;
                  return (
                    <tr key={student._id} className="hover:bg-zinc-900/30 transition-colors group">
                      {/* Name & Avatar */}
                      <td className="py-4.5 px-6 font-medium text-white flex items-center gap-3">
                        <div className="h-8.5 w-8.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          {student.name.charAt(0)}
                        </div>
                        <span className="font-semibold">{student.name}</span>
                      </td>

                      {/* ID */}
                      <td className="py-4.5 px-6 font-mono text-xs text-zinc-400 select-all">
                        {student.studentId}
                      </td>

                      {/* Batch */}
                      <td className="py-4.5 px-6">
                        <span className="text-zinc-300">
                          {studentBatch ? studentBatch.name : 'Unknown Batch'}
                        </span>
                        {studentBatch && (
                          <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">
                            {studentBatch.timeSlot}
                          </span>
                        )}
                      </td>

                      {/* Course */}
                      <td className="py-4.5 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-800 border border-zinc-850 text-zinc-300">
                          <Tag className="h-3 w-3 text-zinc-500" />
                          {student.course}
                        </span>
                      </td>

                      {/* Parent */}
                      <td className="py-4.5 px-6 text-xs space-y-0.5">
                        <div className="text-zinc-200 font-medium">{student.parentName}</div>
                        <div className="text-zinc-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {student.parentPhone}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4.5 px-6 text-right">
                        <div className="inline-flex gap-2">
                          <Link
                            href={`/dashboard/students/${student._id}`}
                            className="p-1.5 hover:text-emerald-400 text-zinc-500 hover:bg-zinc-800/80 rounded transition-all cursor-pointer"
                            title="View student records"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                          {!isReadOnly && (
                            <>
                              <button
                                onClick={() => openEditModal(student)}
                                className="p-1.5 hover:text-emerald-400 text-zinc-500 hover:bg-zinc-800/80 rounded transition-all cursor-pointer"
                                title="Edit profile"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(student._id)}
                                className="p-1.5 hover:text-red-400 text-zinc-500 hover:bg-zinc-850/80 rounded transition-all cursor-pointer"
                                title="Delete profile"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                <User className="h-5 w-5 text-emerald-400" />
                {modalMode === 'CREATE' ? 'Register New Student' : 'Modify Student Details'}
              </h2>
              <p className="text-zinc-400 text-xs mt-1 font-light">
                Configure student information and course tracks. A unique QR token is generated automatically.
              </p>
            </div>

            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg mb-5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 font-light text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Student ID</label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === 'EDIT'}
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    className="w-full bg-zinc-950/70 border border-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
                    placeholder="e.g. STD001"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Aman Gupta"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Batch Assignment</label>
                  <select
                    value={formBatchId}
                    onChange={(e) => handleBatchChange(e.target.value)}
                    className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {batches.map((batch) => (
                      <option key={batch._id} value={batch._id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Course Tracking</label>
                  <input
                    type="text"
                    required
                    disabled
                    value={formCourse}
                    className="w-full bg-zinc-950/50 border border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-zinc-500 font-medium"
                    placeholder="IIT-JEE Prep"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Parent Name</label>
                  <input
                    type="text"
                    required
                    value={formParentName}
                    onChange={(e) => setFormParentName(e.target.value)}
                    className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Ramesh Gupta"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Parent Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formParentPhone}
                    onChange={(e) => setFormParentPhone(e.target.value)}
                    className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. +919876543210"
                  />
                </div>
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
                  {modalMode === 'CREATE' ? 'Register' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
