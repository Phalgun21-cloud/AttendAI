'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft,
  Loader2, 
  Layers, 
  Clock, 
  Users, 
  Percent,
  CheckCircle,
  XCircle,
  BookOpen
} from 'lucide-react';

const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

interface BatchDetail {
  batchDetails: {
    name: string;
    course: string;
    timeSlot: string;
  };
  dailyHistory: Array<{ date: string; present?: number; rate: number }>;
  monthlyHistory: Array<{ date: string; rate: number }>;
  quarterlyHistory: Array<{ date: string; rate: number }>;
  studentReports: Array<{
    _id: string;
    studentId: string;
    name: string;
    course: string;
    present: number;
    absent: number;
    total: number;
    rate: number;
  }>;
}

export default function BatchDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [data, setData] = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'daily' | 'monthly' | 'quarterly'>('daily');

  useEffect(() => {
    const fetchBatchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/batches/${id}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch batch details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBatchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-xs text-zinc-400 font-mono">Loading batch analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-20 text-center space-y-4">
        <div className="inline-flex p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-600">
          <BookOpen className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-zinc-900">Batch Not Found</h3>
          <p className="text-zinc-500 text-sm mt-1 max-w-md mx-auto font-light">
            The batch you are looking for does not exist or has been removed.
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/batches')}
          className="text-xs text-emerald-400 font-mono hover:underline cursor-pointer"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  const { batchDetails, dailyHistory, studentReports } = data;
  
  // Calculate average attendance for the batch based on student reports
  const totalStudents = studentReports.length;
  const avgAttendance = totalStudents > 0 
    ? Math.round(studentReports.reduce((acc, r) => acc + r.rate, 0) / totalStudents)
    : 0;

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div>
        <button 
          onClick={() => router.push('/dashboard/batches')}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-emerald-400 transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Directory
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
              {batchDetails.name}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="inline-flex items-center gap-1.5 text-sm text-zinc-400">
                <BookOpen className="h-4 w-4" />
                {batchDetails.course}
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-zinc-400 font-mono">
                <Clock className="h-4 w-4" />
                {batchDetails.timeSlot}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-zinc-850 bg-zinc-900/10 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Total Enrolled
            </span>
            <Users className="h-4.5 w-4.5 text-blue-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold tracking-tight text-zinc-900 font-mono leading-none">
              {totalStudents}
            </span>
          </div>
        </div>

        <div className="border border-zinc-850 bg-zinc-900/10 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Avg Batch Attendance
            </span>
            <Percent className="h-4.5 w-4.5 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold tracking-tight text-zinc-900 font-mono leading-none">
              {avgAttendance}%
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="border border-zinc-850 bg-zinc-900/10 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 font-mono uppercase tracking-wider">
              Batch Attendance Trend
            </h3>
            <p className="text-zinc-500 text-xs mt-0.5 font-light">
              Attendance percentage for this batch across different time periods.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
            {(['daily', 'monthly', 'quarterly'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        
        <div className="h-64 w-full">
          {data && data[`${timeRange}History`].length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data[`${timeRange}History`]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#064e3b" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#064e3b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="#4b5563" 
                  fontSize={10} 
                  fontFamily="monospace"
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#4b5563" 
                  fontSize={10} 
                  fontFamily="monospace"
                  tickLine={false} 
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  labelStyle={{ color: '#111827', fontFamily: 'monospace', fontSize: '11px' }}
                  itemStyle={{ color: '#064e3b', fontSize: '11px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#064e3b" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorRate)" 
                  name="Attendance Rate"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-zinc-500 font-mono">
              No historical data available.
            </div>
          )}
        </div>
      </div>

      {/* Student Reports Table */}
      <div className="border border-zinc-800 bg-zinc-900/10 rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-zinc-850">
          <h3 className="text-sm font-semibold text-zinc-900 font-mono uppercase tracking-wider">
            Student Attendance Reports
          </h3>
          <p className="text-zinc-500 text-xs mt-0.5 font-light">
            Individual student metrics over the last 30 days for {batchDetails.name}.
          </p>
        </div>
        
        {studentReports.length === 0 ? (
          <div className="p-10 text-center text-zinc-500 text-sm font-light">
            No students are currently enrolled in this batch.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/60 border-b border-zinc-850 text-xs font-mono uppercase text-zinc-500 tracking-wider">
                <tr>
                  <th className="py-4 px-6 font-medium">Student Name</th>
                  <th className="py-4 px-6 font-medium">Student ID</th>
                  <th className="py-4 px-6 font-medium text-center">Days Present</th>
                  <th className="py-4 px-6 font-medium text-center">Days Absent</th>
                  <th className="py-4 px-6 font-medium text-right">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 bg-zinc-900/10">
                {studentReports.map((student) => (
                  <tr key={student._id} className="hover:bg-zinc-900/30 transition-colors group">
                    <td className="py-4.5 px-6 font-medium text-zinc-900 flex items-center gap-3">
                      <div className="h-8.5 w-8.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        {student.name.charAt(0)}
                      </div>
                      <span className="font-semibold">{student.name}</span>
                    </td>
                    
                    <td className="py-4.5 px-6 font-mono text-xs text-zinc-400">
                      {student.studentId}
                    </td>

                    <td className="py-4.5 px-6 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {student.present}
                      </div>
                    </td>

                    <td className="py-4.5 px-6 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                        <XCircle className="h-3.5 w-3.5" />
                        {student.absent}
                      </div>
                    </td>

                    <td className="py-4.5 px-6 text-right">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                        student.rate >= 80 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                          : student.rate >= 50
                          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                          : 'bg-red-500/10 border border-red-500/20 text-red-400'
                      }`}>
                        {student.rate}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
