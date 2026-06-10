'use client';

import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { 
  FileText, 
  Download, 
  Loader2, 
  Calendar, 
  Clock, 
  Percent, 
  AlertTriangle,
  Award
} from 'lucide-react';

interface ReportRow {
  _id: string;
  studentId: string;
  name: string;
  course: string;
  batchName: string;
  present: number;
  absent: number;
  total: number;
  rate: number;
}

interface Batch {
  _id: string;
  name: string;
}

export default function ReportsPage() {
  const [reportRows, setReportRows] = useState<ReportRow[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState('');
  
  // Date range
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Set default dates: 30 days ago to today
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);

    // Fetch batches
    const fetchBatches = async () => {
      try {
        const res = await fetch('/api/batches');
        const data = await res.json();
        if (data.success) {
          setBatches(data.batches);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBatches();
  }, []);

  // Fetch report data
  const fetchReportData = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      let url = `/api/reports?startDate=${startDate}&endDate=${endDate}`;
      if (selectedBatch) {
        url += `&batchId=${selectedBatch}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setReportRows(data.reportData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedBatch, startDate, endDate]);

  // Aggregate metrics for summary
  const totalStudents = reportRows.length;
  const avgAttendance = totalStudents > 0 
    ? Math.round(reportRows.reduce((acc, row) => acc + row.rate, 0) / totalStudents)
    : 100;
  
  const lowAttendanceCount = reportRows.filter(r => r.rate < 75).length;

  // Export CSV function
  const handleExportCSV = () => {
    if (reportRows.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Student ID,Name,Course,Batch,Present Days,Absent Days,Total Tracked,Attendance Rate (%)\n';

    reportRows.forEach(row => {
      const line = `"${row.studentId}","${row.name}","${row.course}","${row.batchName}",${row.present},${row.absent},${row.total},${row.rate}`;
      csvContent += line + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AttendAI-Report-${startDate}-to-${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF function
  const handleExportPDF = () => {
    if (reportRows.length === 0) return;
    setPdfGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Header Layout
      doc.setFillColor(9, 9, 11);
      doc.rect(0, 0, 210, 45, 'F');

      doc.setFillColor(16, 185, 129);
      doc.rect(0, 45, 210, 2, 'F');

      doc.setTextColor(250, 250, 250);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('ATTENDAI ACADEMIC REPORT', 15, 20);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(160, 160, 160);
      doc.text(`DATE RANGE: ${startDate} to ${endDate}`, 15, 28);
      doc.text(`BATCH ROSTER: ${selectedBatch ? batches.find(b => b._id === selectedBatch)?.name : 'All batches'}`, 15, 33);
      doc.text(`COMPILED ON: ${new Date().toLocaleDateString()}`, 15, 38);

      // Summary Card elements
      doc.setDrawColor(220, 220, 220);
      doc.setFillColor(250, 250, 250);
      doc.rect(15, 55, 180, 25, 'FD');

      doc.setTextColor(50, 50, 50);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('REPORT SUMMARY METRICS', 20, 62);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Total Students: ${totalStudents}`, 20, 70);
      doc.text(`Average Attendance: ${avgAttendance}%`, 80, 70);
      doc.text(`Flagged Low Attendance (<75%): ${lowAttendanceCount}`, 140, 70);

      // Table grid header
      let currentY = 90;
      doc.setFillColor(39, 39, 42);
      doc.rect(15, currentY, 180, 8, 'F');

      doc.setTextColor(250, 250, 250);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('STUDENT ID', 18, currentY + 5.5);
      doc.text('NAME', 42, currentY + 5.5);
      doc.text('BATCH', 82, currentY + 5.5);
      doc.text('PRESENT', 132, currentY + 5.5);
      doc.text('ABSENT', 152, currentY + 5.5);
      doc.text('RATE (%)', 175, currentY + 5.5);

      // Table body
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      
      currentY += 8;

      for (let i = 0; i < reportRows.length; i++) {
        const row = reportRows[i];

        if (currentY > 270) {
          doc.addPage();
          currentY = 20;

          // Redraw header on new page
          doc.setFillColor(39, 39, 42);
          doc.rect(15, currentY, 180, 8, 'F');
          doc.setTextColor(250, 250, 250);
          doc.setFont('Helvetica', 'bold');
          doc.text('STUDENT ID', 18, currentY + 5.5);
          doc.text('NAME', 42, currentY + 5.5);
          doc.text('BATCH', 82, currentY + 5.5);
          doc.text('PRESENT', 132, currentY + 5.5);
          doc.text('ABSENT', 152, currentY + 5.5);
          doc.text('RATE (%)', 175, currentY + 5.5);
          doc.setFont('Helvetica', 'normal');
          doc.setTextColor(50, 50, 50);
          currentY += 8;
        }

        // Zebra lines background
        if (i % 2 === 0) {
          doc.setFillColor(245, 245, 247);
          doc.rect(15, currentY, 180, 8, 'F');
        }

        doc.text(row.studentId, 18, currentY + 5.5);
        doc.text(row.name.substring(0, 20), 42, currentY + 5.5);
        doc.text(row.batchName.replace(' Master Batch', '').replace(' Achievers Batch', '').substring(0, 25), 82, currentY + 5.5);
        doc.text(String(row.present), 132, currentY + 5.5);
        doc.text(String(row.absent), 152, currentY + 5.5);
        
        // Highlight low rate in red
        if (row.rate < 75) {
          doc.setTextColor(239, 68, 68);
          doc.setFont('Helvetica', 'bold');
        } else {
          doc.setTextColor(16, 185, 129);
          doc.setFont('Helvetica', 'bold');
        }
        doc.text(`${row.rate}%`, 175, currentY + 5.5);
        
        doc.setTextColor(50, 50, 50);
        doc.setFont('Helvetica', 'normal');

        // Draw outline line below row
        doc.setDrawColor(230, 230, 230);
        doc.line(15, currentY + 8, 195, currentY + 8);

        currentY += 8;
      }

      doc.save(`AttendAI-Roster-Report-${startDate}-to-${endDate}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Could not export PDF.');
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Institute Reports
          </h1>
          <p className="text-zinc-400 mt-1 font-light text-sm">
            Generate and export overall student attendance statistics and warnings for parent-teacher audits.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={reportRows.length === 0 || loading}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold font-mono uppercase tracking-wider border border-zinc-800 hover:border-zinc-700 bg-zinc-900/10 hover:bg-zinc-900/50 rounded-lg text-zinc-300 hover:text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          
          <button
            onClick={handleExportPDF}
            disabled={pdfGenerating || reportRows.length === 0 || loading}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold font-mono uppercase tracking-wider bg-white hover:bg-zinc-200 text-black rounded-lg transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {pdfGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-black" />
                Compiling...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 text-black" />
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Control Filter Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 border border-zinc-850 bg-zinc-900/10 rounded-xl items-end">
        {/* Start Date */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center gap-1">
            <Calendar className="h-3 w-3 text-zinc-500" />
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-light"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center gap-1">
            <Calendar className="h-3 w-3 text-zinc-500" />
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-all font-light"
          />
        </div>

        {/* Batch Filter */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">
            Filter Roster Batch
          </label>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 transition-all font-light cursor-pointer"
          >
            <option value="">All Batches</option>
            {batches.map((batch) => (
              <option key={batch._id} value={batch._id}>
                {batch.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sync Trigger button */}
        <button
          onClick={fetchReportData}
          className="w-full text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900/50 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
        >
          Re-Analyze Logs
        </button>
      </div>

      {/* Analytics Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Summary Card 1 */}
        <div className="border border-zinc-850 bg-zinc-900/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Average Attendance</span>
            <h3 className="text-2xl font-bold text-white font-mono mt-1 leading-none">
              {avgAttendance}%
            </h3>
          </div>
        </div>

        {/* Summary Card 2 */}
        <div className="border border-zinc-850 bg-zinc-900/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Low Attendance Alerts</span>
            <h3 className="text-2xl font-bold text-white font-mono mt-1 leading-none">
              {lowAttendanceCount}
            </h3>
          </div>
        </div>

        {/* Summary Card 3 */}
        <div className="border border-zinc-850 bg-zinc-900/10 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Total Evaluated</span>
            <h3 className="text-2xl font-bold text-white font-mono mt-1 leading-none">
              {totalStudents} Students
            </h3>
          </div>
        </div>

      </div>

      {/* Main Grid Preview Table */}
      <div className="border border-zinc-800 bg-zinc-900/10 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-xs text-zinc-400 font-mono">Compiling range parameters...</p>
          </div>
        ) : reportRows.length === 0 ? (
          <div className="p-20 text-center text-zinc-550 font-light">
            No report data available for the chosen parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-zinc-300">
              <thead className="bg-zinc-950/60 border-b border-zinc-850 text-xs font-mono uppercase text-zinc-500 tracking-wider">
                <tr>
                  <th className="py-4 px-6 font-medium">Student ID</th>
                  <th className="py-4 px-6 font-medium">Student Name</th>
                  <th className="py-4 px-6 font-medium">Batch Assigned</th>
                  <th className="py-4 px-6 font-medium">Present Days</th>
                  <th className="py-4 px-6 font-medium">Absent Days</th>
                  <th className="py-4 px-6 font-medium">Total Tracked</th>
                  <th className="py-4 px-6 font-medium">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 bg-zinc-900/10">
                {reportRows.map((row) => (
                  <tr key={row._id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-zinc-400">{row.studentId}</td>
                    <td className="py-4 px-6 font-semibold text-white">{row.name}</td>
                    <td className="py-4 px-6 text-zinc-400">{row.batchName}</td>
                    <td className="py-4 px-6 font-mono font-medium text-emerald-400">{row.present}</td>
                    <td className="py-4 px-6 font-mono font-medium text-red-400">{row.absent}</td>
                    <td className="py-4 px-6 font-mono text-zinc-500">{row.total}</td>
                    <td className="py-4 px-6">
                      <span className={`font-mono font-bold ${row.rate < 75 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {row.rate}%
                      </span>
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
