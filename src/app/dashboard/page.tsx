'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Percent, 
  PhoneCall, 
  Loader2, 
  RefreshCw, 
  QrCode, 
  ArrowUpRight, 
  Radio
} from 'lucide-react';

// Dynamically import Recharts to prevent hydration issues on SSR
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  attendanceRate: number;
  aiCallsMade: number;
  dailyHistory: Array<{ date: string; present: number; rate: number }>;
  batchStats: Array<{ name: string; present: number; total: number; rate: number }>;
  recentScans: Array<{ id: string; studentName: string; studentId: string; timestamp: string; status: string; source: string }>;
  recentCalls: Array<{ id: string; studentName: string; phone: string; status: string; outcome: string; timestamp: string }>;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    
    // Auto refresh every 10 seconds to make the demo feel alive!
    const interval = setInterval(() => {
      fetchDashboardStats();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-xs text-zinc-400 font-mono">Assembling real-time database registries...</p>
      </div>
    );
  }

  const kpis = [
    { title: 'Total Roster', value: stats?.totalStudents || 0, icon: Users, desc: 'Students registered' },
    { title: 'Present Today', value: stats?.presentToday || 0, icon: CheckCircle, desc: 'Active in class', color: 'text-emerald-400' },
    { title: 'Absent Today', value: stats?.absentToday || 0, icon: XCircle, desc: 'Follow-ups pending', color: 'text-red-400' },
    { title: 'Attendance Rate', value: `${stats?.attendanceRate || 0}%`, icon: Percent, desc: 'Today\'s average', color: 'text-emerald-400' },
    { title: 'AI Follow-up Calls', value: stats?.aiCallsMade || 0, icon: PhoneCall, desc: 'Calls dispatched', color: 'text-blue-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-zinc-400 mt-1 font-light text-sm flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live coaching institute oversight — auto-syncing enabled.
          </p>
        </div>

        <button
          onClick={() => fetchDashboardStats(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center p-2 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          title="Refresh metrics"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {/* Grid of KPI metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="border border-zinc-850 bg-zinc-900/10 rounded-xl p-5 hover:border-zinc-800 transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <Icon className={`h-4.5 w-4.5 text-zinc-500 group-hover:text-zinc-300 transition-colors ${kpi.color || ''}`} />
              </div>
              <div className="mt-3">
                <span className="text-3xl font-bold tracking-tight text-white font-mono leading-none">
                  {kpi.value}
                </span>
                <span className="block text-[10px] text-zinc-500 font-light mt-1.5 leading-none">
                  {kpi.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Attendance Trend */}
        <div className="lg:col-span-2 border border-zinc-850 bg-zinc-900/10 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              Daily Attendance Trend
            </h3>
            <p className="text-zinc-500 text-xs mt-0.5 font-light">
              Class presentation rates tracked over the last 7 institute sessions.
            </p>
          </div>
          <div className="h-64 w-full">
            {stats && stats.dailyHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    stroke="#52525b" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#52525b" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false} 
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#fafafa', fontFamily: 'monospace', fontSize: '11px' }}
                    itemStyle={{ color: '#10b981', fontSize: '11px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRate)" 
                    name="Attendance Rate"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Batch Performance comparison */}
        <div className="border border-zinc-850 bg-zinc-900/10 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              Batch Performance
            </h3>
            <p className="text-zinc-500 text-xs mt-0.5 font-light">
              Current attendance rates split by academic stream batches.
            </p>
          </div>
          <div className="h-64 w-full">
            {stats && stats.batchStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.batchStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#52525b" 
                    fontSize={9} 
                    fontFamily="monospace"
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#52525b" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false} 
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#fafafa', fontFamily: 'monospace', fontSize: '11px' }}
                    itemStyle={{ color: '#10b981', fontSize: '11px' }}
                  />
                  <Bar 
                    dataKey="rate" 
                    fill="#18181b" 
                    stroke="#27272a" 
                    radius={[4, 4, 0, 0]}
                    name="Attendance %"
                  >
                    {/* Highlight the best batch or colorize */}
                    {stats.batchStats.map((entry, idx) => (
                      <rect key={idx} fill={entry.rate > 80 ? '#10b981' : '#27272a'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>
      </div>

      {/* Real-time Tickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Live Scans */}
        <div className="border border-zinc-850 bg-zinc-900/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
                Live Attendance Feed
              </h3>
              <p className="text-zinc-500 text-[11px] font-light mt-0.5">
                Logs streaming in from simulator terminals and QR inputs.
              </p>
            </div>
            <span className="text-[10px] font-mono bg-zinc-950 border border-zinc-850 px-2 py-0.5 text-zinc-500 rounded uppercase">
              Today
            </span>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {stats && stats.recentScans.length > 0 ? (
              stats.recentScans.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/40 border border-zinc-850 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">{scan.studentName}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      ID: {scan.studentId} • VIA {scan.source}
                    </div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold leading-none ${
                      scan.status === 'PRESENT' 
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        : scan.status === 'LATE'
                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                      {scan.status}
                    </span>
                    <span className="block text-[9px] text-zinc-500 font-mono mt-0.5">
                      {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-zinc-500 font-light border border-dashed border-zinc-800 rounded-lg">
                No scans received today yet. Run simulator to test logs.
              </div>
            )}
          </div>
        </div>

        {/* Live Call Center events */}
        <div className="border border-zinc-850 bg-zinc-900/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                <PhoneCall className="h-4.5 w-4.5 text-blue-400" />
                AI Call Tracker Feed
              </h3>
              <p className="text-zinc-500 text-[11px] font-light mt-0.5">
                Automated phone queues generated by the absentee engine.
              </p>
            </div>
            <span className="text-[10px] font-mono bg-zinc-950 border border-zinc-850 px-2 py-0.5 text-zinc-500 rounded uppercase">
              Active
            </span>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {stats && stats.recentCalls.length > 0 ? (
              stats.recentCalls.map((call) => (
                <div key={call.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/40 border border-zinc-850 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">{call.studentName}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      PHONE: {call.phone}
                    </div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold leading-none ${
                      call.status === 'COMPLETED' 
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        : call.status === 'CALLING'
                        ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400 animate-pulse'
                        : 'bg-zinc-800 border border-zinc-850 text-zinc-400'
                    }`}>
                      {call.status}
                    </span>
                    <span className="block text-[9px] text-zinc-500 truncate max-w-[120px] ml-auto font-mono mt-0.5">
                      {call.outcome}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-zinc-500 font-light border border-dashed border-zinc-800 rounded-lg">
                No calls queued. Absentees need to be generated to trigger calls.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
