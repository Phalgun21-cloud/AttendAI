'use client';

import React from 'react';
import { Users, LayoutGrid, QrCode, PhoneOutgoing, TrendingUp, Check, Shield, CircleDot, Clock } from 'lucide-react';

export default function BentoFeatures() {
  return (
    <section className="py-24 relative bg-zinc-50/30">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
            Modular Intelligence
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 mt-4">
            Everything you need. <br />
            <span className="text-zinc-500 font-light">Engineered with absolute precision.</span>
          </h2>
          <p className="text-zinc-500 text-sm font-light mt-4">
            Ditch the old spreadsheets. AttendAI offers a unified workspace that bridges physical attendance and automated communications.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Student Directory (Span 2 on MD/LG) */}
          <div className="group md:col-span-2 p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between overflow-hidden relative min-h-[340px]">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4 max-w-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-800">Student Directory</h3>
                  <p className="text-zinc-500 text-xs font-light mt-1.5 leading-relaxed">
                    A clean, filterable student registry. Keep parent phone contacts, course logs, and active RFID credentials organized in a single repository.
                  </p>
                </div>
              </div>

              {/* Graphical Student List Mockup */}
              <div className="w-full md:w-64 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3 shrink-0">
                <div className="flex items-center justify-between border-b border-zinc-150 pb-2">
                  <span className="text-[9px] font-mono text-zinc-400 uppercase">Recent Registrations</span>
                  <span className="text-[8px] bg-green-50 text-green-600 border border-green-150 px-1.5 py-0.5 rounded font-mono font-semibold">Active</span>
                </div>
                
                {[
                  { name: 'Aarav Sharma', id: 'ATT-042', batch: 'NEET A' },
                  { name: 'Priya Patel', id: 'ATT-089', batch: 'NEET B' },
                  { name: 'Rohan Das', id: 'ATT-115', batch: 'JEE Main' }
                ].map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-zinc-150 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-extrabold text-emerald-800">
                        {s.name[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-zinc-800 text-[10px] leading-tight">{s.name}</h4>
                        <span className="text-[8px] text-zinc-400 font-mono">ID: {s.id}</span>
                      </div>
                    </div>
                    <span className="text-[8px] bg-zinc-50 text-zinc-500 border border-zinc-200 px-1.5 py-0.5 rounded font-mono">{s.batch}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Batch Management (Span 1) */}
          <div className="group p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[340px]">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-800">Batch Scheduler</h3>
                <p className="text-zinc-500 text-xs font-light mt-1.5 leading-relaxed">
                  Group student cohorts into designated slots. Track batch-level occupancy rates and customize course timelines.
                </p>
              </div>
            </div>

            {/* Timetable schedule preview */}
            <div className="mt-6 border border-zinc-200 rounded-2xl bg-zinc-50 p-4 space-y-2">
              <div className="flex items-center justify-between text-[8px] font-mono text-zinc-400 uppercase pb-1 border-b border-zinc-150">
                <span>Roster Slot</span>
                <span>Capacity</span>
              </div>
              <div className="bg-white px-2.5 py-2 border border-zinc-150 rounded-lg flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span className="text-[9px] font-bold text-zinc-700">NEET Achievers A</span>
                </div>
                <span className="text-[8px] font-mono text-zinc-400">42/50 Enrolled</span>
              </div>
              <div className="bg-white px-2.5 py-2 border border-zinc-150 rounded-lg flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span className="text-[9px] font-bold text-zinc-700">JEE Core Batch B</span>
                </div>
                <span className="text-[8px] font-mono text-zinc-400">18/30 Enrolled</span>
              </div>
            </div>
          </div>

          {/* Card 3: QR Generator (Span 1) */}
          <div className="group p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[360px] overflow-hidden relative">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-800">QR ID Card Generator</h3>
                <p className="text-zinc-500 text-xs font-light mt-1.5 leading-relaxed">
                  Bulk generate and download high-resolution print-ready student ID cards with secure attendance-tracking barcodes.
                </p>
              </div>
            </div>

            {/* High-fidelity Card Graphic */}
            <div className="mt-6 relative flex justify-center">
              <div className="w-56 h-36 bg-zinc-900 border border-zinc-850 rounded-2xl p-4 flex flex-col justify-between text-white shadow-lg relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                {/* Header line */}
                <div className="flex items-center justify-between">
                  <span className="text-[7px] font-mono font-bold tracking-widest text-zinc-300">ATTENDAI</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[5px] text-zinc-500 tracking-wider">SECURE ID</span>
                  </div>
                </div>
                {/* Details */}
                <div className="my-2">
                  <h5 className="text-[10px] font-bold tracking-wide">Aarav Sharma</h5>
                  <span className="text-[6px] text-emerald-600 font-mono">ID: ATT-2026-042</span>
                </div>
                {/* Footer and Mock Barcode */}
                <div className="flex items-end justify-between border-t border-zinc-800 pt-1.5">
                  <div className="text-[5px] text-zinc-500 font-mono">
                    <p>COURSE: NEET CORE</p>
                    <p>PARENT: A. SHARMA</p>
                  </div>
                  {/* Mock Barcode visual */}
                  <div className="w-16 h-6 bg-white border border-zinc-700 p-0.5 flex items-center justify-center rounded">
                    <div className="w-full h-full flex gap-[1px]">
                      {[1.5, 3, 1, 2, 1.5, 1, 3, 2, 1.5, 1, 2, 1.5].map((w, i) => (
                        <span key={i} style={{ width: `${w}px` }} className="h-full bg-black shrink-0" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: AI calling logs queue (Span 2) */}
          <div className="group md:col-span-2 p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[360px]">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4 max-w-sm">
                <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600">
                  <PhoneOutgoing className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-zinc-800">AI Call Automation</h3>
                    <span className="text-[8px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Automated</span>
                  </div>
                  <p className="text-zinc-500 text-xs font-light mt-1.5 leading-relaxed">
                    Whenever an absence is recorded, AttendAI activates an automated outbound phone agent. Parents receive a real-time call, and the resulting transcript updates the attendance logs.
                  </p>
                </div>
              </div>

              {/* Call logs dashboard panel mockup */}
              <div className="w-full md:w-72 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-2.5 shrink-0">
                <div className="flex items-center justify-between text-[8px] font-mono text-zinc-400 uppercase pb-1.5 border-b border-zinc-150">
                  <span>Parent Call Outbox</span>
                  <span>Dial Queue</span>
                </div>

                {[
                  { parent: 'Mr. Das', phone: '+91 98765-43210', status: 'Completed', time: '17:34', color: 'bg-green-100 text-green-700 border-green-200' },
                  { parent: 'Mrs. Sen', phone: '+91 98765-88990', status: 'Calling', time: '17:35', color: 'bg-emerald-100 text-emerald-800 border-emerald-200 animate-pulse' },
                  { parent: 'Mr. Khan', phone: '+91 98765-11223', status: 'Queued', time: 'Pending', color: 'bg-zinc-100 text-zinc-500 border-zinc-200' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-2 border border-zinc-150 rounded-lg flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-[8px] text-zinc-500">
                        <Clock className="w-3 h-3" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-zinc-800 text-[9px] leading-tight">{item.parent}</h4>
                        <span className="text-[7px] text-zinc-400 font-mono">{item.phone}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <span className="text-[7px] text-zinc-400 font-mono">{item.time}</span>
                      <span className={`text-[7px] border px-1.5 py-0.5 rounded font-semibold font-mono ${item.color}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 5: Analytics & Reports (Span 1) */}
          <div className="group p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[350px]">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-800">Analytics & Reports</h3>
                <p className="text-zinc-500 text-xs font-light mt-1.5 leading-relaxed">
                  Generate PDF reports of weekly attendance, inspect absentee trends, and track student check-in ratios.
                </p>
              </div>
            </div>

            {/* High-fidelity SVG Charts Mockup */}
            <div className="mt-6 bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex items-center justify-between gap-4">
              {/* Mini Line Chart */}
              <div className="flex-1 flex flex-col justify-between h-20">
                <div className="flex items-center justify-between">
                  <span className="text-[7px] font-mono text-zinc-400 uppercase">Avg Attendance</span>
                  <span className="text-[9px] font-bold text-zinc-700">94.2%</span>
                </div>
                {/* SVG Line path */}
                <svg className="w-full h-10 text-emerald-600 mt-2" viewBox="0 0 100 40">
                  <defs>
                    <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#064e3b" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#064e3b" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0 35 Q 20 20 40 30 T 80 10 T 100 5" fill="none" stroke="#064e3b" strokeWidth="2" />
                  <path d="M 0 35 Q 20 20 40 30 T 80 10 T 100 5 L 100 40 L 0 40 Z" fill="url(#glow)" />
                  <circle cx="100" cy="5" r="2" fill="#064e3b" />
                </svg>
              </div>

              {/* Mini Donut Chart */}
              <div className="w-16 h-16 flex items-center justify-center relative shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-zinc-200"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-600"
                    strokeDasharray="92, 100"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-[8px] font-bold text-zinc-700 leading-none">92%</span>
                  <span className="text-[5px] text-zinc-400 font-light mt-0.5">Rate</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Feature Highlights Footer */}
        <div className="mt-16 pt-8 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          {[
            { title: 'Military-grade encryption', desc: 'Secure storage of student rosters and phone credentials.' },
            { title: 'Zero Hardware Required', desc: 'Works with your phone, computer, or a standard barcode scanner.' },
            { title: 'Instant Broadcast APIs', desc: 'Notify thousands of parents within seconds during emergency drills.' }
          ].map((item, idx) => (
            <div key={idx} className="space-y-1">
              <h4 className="text-xs font-bold text-zinc-800 flex items-center justify-center sm:justify-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {item.title}
              </h4>
              <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
