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

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Label,
  CartesianGrid
} from 'recharts';

interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  attendanceRate: number;
  aiCallsMade: number;
  dailyHistory: Array<{ date: string; present: number; rate: number }>;
  monthlyHistory: Array<{ date: string; rate: number }>;
  quarterlyHistory: Array<{ date: string; rate: number }>;
  attendanceBreakdown: Array<{ name: string; value: number }>;
  callOutcomes: Array<{ name: string; value: number }>;
  batchStats: Array<{ name: string; present: number; total: number; rate: number }>;
  absenteesByBatch: Array<{ name: string; value: number }>;
  recentScans: Array<{ id: string; studentName: string; studentId: string; timestamp: string; status: string; source: string }>;
  recentCalls: Array<{ id: string; studentName: string; phone: string; status: string; outcome: string; timestamp: string }>;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'daily' | 'monthly' | 'quarterly'>('daily');
  const [absenteesActiveName, setAbsenteesActiveName] = useState<string | null>(null);

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
        {/* Attendance Trend */}
        <div className="lg:col-span-2 border border-zinc-850 bg-zinc-900/10 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
                Attendance Trend
              </h3>
              <p className="text-zinc-500 text-xs mt-0.5 font-light">
                Class presentation rates tracked over different time periods.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              {(['daily', 'monthly', 'quarterly'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${timeRange === range
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
            {stats && stats[`${timeRange}History`].length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats[`${timeRange}History`]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                    type="linear"
                    dataKey="rate"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRate)"
                    name="Attendance Rate"
                    dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#18181b" }}
                    activeDot={{ r: 6, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Absentees by Batch Breakdown */}
        <div className="border border-zinc-850 bg-zinc-900/10 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              Absentees By Batch
            </h3>
            <p className="text-zinc-500 text-xs mt-0.5 font-light">
              Batch-wise breakdown of absent students.
            </p>
          </div>
          <div className="h-64 w-full flex flex-col">
            {stats && stats.absenteesByBatch ? (
              <>
                <div className="flex-1 w-full min-h-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Pie
                        data={stats.absenteesByBatch}
                        innerRadius={50}
                        outerRadius={66}
                        paddingAngle={6}
                        dataKey="value"
                        stroke="#18181b"
                        strokeWidth={3}
                        nameKey="name"
                        labelLine={false}
                        label={false}
                        onMouseEnter={(data: any) => setAbsenteesActiveName(data?.name || null)}
                        onMouseLeave={() => setAbsenteesActiveName(null)}
                      >
                        <Label
                          position="center"
                          content={(props: any) => {
                            const { viewBox } = props;
                            if (!viewBox || viewBox.cx === undefined || viewBox.cy === undefined) return null;
                            const { cx, cy } = viewBox;
                            const total = stats.absenteesByBatch.reduce((sum: number, item: any) => sum + item.value, 0);
                            return (
                              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                                <tspan x={cx} dy="-0.2em" fill="white" fontSize="28" fontWeight="bold" fontFamily="monospace">
                                  {total}
                                </tspan>
                                <tspan x={cx} dy="1.6em" fill="#71717a" fontSize="9" fontWeight="bold" letterSpacing="0.1em">
                                  TOTAL
                                </tspan>
                              </text>
                            );
                          }}
                        />
                        {stats.absenteesByBatch.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={['#f43f5e', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'][index % 6]}
                            fillOpacity={absenteesActiveName === null || absenteesActiveName === entry.name ? 1 : 0.3}
                            style={{
                              outline: 'none',
                              filter: absenteesActiveName === entry.name ? 'drop-shadow(0 0 10px rgba(255,255,255,0.15))' : 'none',
                              transition: 'all 0.3s ease'
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const total = stats.absenteesByBatch.reduce((sum: number, item: any) => sum + item.value, 0);
                            const percent = total > 0 ? (data.value / total) * 100 : 0;
                            const color = ['#f43f5e', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'][payload[0].payload.index || stats.absenteesByBatch.findIndex((b: any) => b.name === data.name) % 6];

                            return (
                              <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800/50 rounded-xl p-3.5 shadow-2xl z-50">
                                <div className="flex items-center gap-2.5 mb-1.5">
                                  <div className="w-2.5 h-2.5 rounded-full shadow-inner" style={{ backgroundColor: color }} />
                                  <p className="text-zinc-300 text-xs font-semibold tracking-wide">{data.name}</p>
                                </div>
                                <div className="flex items-end gap-3 pl-5">
                                  <p className="text-white text-2xl font-bold font-mono leading-none">
                                    {data.value} <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-normal">absent</span>
                                  </p>
                                  <p className="text-zinc-400 text-xs font-mono font-medium mb-0.5">
                                    {(percent).toFixed(1)}%
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Custom Legend Wrapper outside of Recharts */}
                <div className="w-full flex flex-wrap justify-center gap-2 pt-3 overflow-y-auto max-h-[88px] scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent pr-1">
                  {stats.absenteesByBatch.map((data: any, index: number) => {
                    if (data.value === 0) return null;
                    const total = stats.absenteesByBatch.reduce((sum: number, item: any) => sum + item.value, 0);
                    const percent = total > 0 ? (data.value / total) * 100 : 0;
                    const color = ['#f43f5e', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'][index % 6];
                    return (
                      <div
                        key={`legend-${index}`}
                        className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800/80 rounded-full px-2.5 py-1.5 cursor-default transition-all duration-200"
                        onMouseEnter={() => setAbsenteesActiveName(data.name)}
                        onMouseLeave={() => setAbsenteesActiveName(null)}
                        style={{
                          opacity: absenteesActiveName === null || absenteesActiveName === data.name ? 1 : 0.3,
                          boxShadow: absenteesActiveName === data.name ? `0 0 12px ${color}15` : 'none',
                          borderColor: absenteesActiveName === data.name ? `${color}40` : ''
                        }}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }} />
                        <span className="text-zinc-300 text-[10px] font-medium truncate max-w-[150px]">{data.name}</span>
                        <div className="flex items-center gap-1.5 pl-1.5 border-l border-zinc-800/80">
                          <span className="text-white text-[10px] font-bold">{data.value}</span>
                          <span className="text-zinc-500 text-[9px] font-mono">({percent.toFixed(0)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Batch Performance comparison */}
        <div className="lg:col-span-2 border border-zinc-850 bg-zinc-900/10 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              Batch Performance
            </h3>
            <p className="text-zinc-500 text-xs mt-0.5 font-light">
              30-day avg attendance rates split by academic stream batches.
            </p>
          </div>
          <div className="h-64 w-full">
            {stats && stats.batchStats && stats.batchStats.length > 0 ? (
              <div className="flex flex-col w-full gap-5 px-2 justify-center h-full">
                {stats.batchStats.map((batch, idx) => {
                  const isExcellent = batch.rate >= 80;
                  const isWarning = batch.rate >= 50 && batch.rate < 80;
                  
                  const colorClass = isExcellent 
                    ? 'from-emerald-500 to-emerald-400 shadow-emerald-500/40' 
                    : isWarning 
                    ? 'from-amber-500 to-amber-400 shadow-amber-500/40' 
                    : 'from-red-500 to-red-400 shadow-red-500/40';
                  
                  const textColor = isExcellent ? 'text-emerald-400' : isWarning ? 'text-amber-400' : 'text-red-400';

                  return (
                    <div key={idx} className="relative group">
                      <div className="flex justify-between items-end mb-2.5 px-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-tr ${colorClass} shadow-[0_0_10px_currentColor]`} />
                          <span className="text-xs font-semibold text-zinc-200 font-mono tracking-wide">{batch.name}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-xl font-black font-mono leading-none ${textColor}`}>{batch.rate}</span>
                          <span className="text-[10px] text-zinc-500 font-mono font-medium">%</span>
                        </div>
                      </div>
                      <div className="h-3.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/80 relative shadow-inner">
                        <div 
                          className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-1000 ease-out`}
                          style={{ width: `${batch.rate}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 translate-x-4 opacity-50"></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 font-mono text-sm">
                No batch data available
              </div>
            )}
          </div>
        </div>

        {/* AI Call Outcomes Breakdown */}
        <div className="border border-zinc-850 bg-zinc-900/10 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              Call Outcomes
            </h3>
            <p className="text-zinc-500 text-xs mt-0.5 font-light">
              Precise breakdown of recent follow-ups (Last 30 Days).
            </p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {stats && stats.callOutcomes && stats.callOutcomes.some((c: any) => c.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <linearGradient id="pieEmerald" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="pieAmber" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#d97706" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="pieRed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f87171" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="pieZinc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a1a1aa" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#52525b" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <Pie
                    data={stats.callOutcomes}
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="rgba(0,0,0,0)"
                    cornerRadius={8}
                  >
                    {stats.callOutcomes.map((entry, index) => {
                      const fills = ['url(#pieEmerald)', 'url(#pieAmber)', 'url(#pieRed)', 'url(#pieZinc)'];
                      return <Cell key={`cell-${index}`} fill={fills[index % fills.length]} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'rgba(9, 9, 11, 0.95)', backdropFilter: 'blur(10px)', border: '1px solid #27272a', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#fafafa', fontSize: '14px', fontWeight: '800', fontFamily: 'monospace' }}
                  />
                  <Legend 
                    verticalAlign="middle" 
                    align="right" 
                    layout="vertical"
                    iconType="circle"
                    iconSize={10}
                    wrapperStyle={{ fontSize: '12px', color: '#a1a1aa', fontFamily: 'monospace', paddingLeft: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 font-mono text-sm">
                No call data available
              </div>
            )}
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
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold leading-none ${scan.status === 'PRESENT'
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
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold leading-none ${call.status === 'COMPLETED'
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
