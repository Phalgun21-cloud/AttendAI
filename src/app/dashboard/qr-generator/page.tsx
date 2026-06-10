'use client';

import React, { useState, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';
import { Loader2, Barcode, FileText, CheckSquare, Square, Printer, CheckCircle2 } from 'lucide-react';

interface Student {
  _id: string;
  studentId: string;
  name: string;
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

export default function QrGeneratorPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState('');
  
  // Selection
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  
  // Pre-generated QR data URIs mapping studentId -> base64 QR Code
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Fetch batches & students
  useEffect(() => {
    const fetchInitData = async () => {
      setLoading(true);
      try {
        const batchRes = await fetch('/api/batches');
        const batchData = await batchRes.json();
        if (batchData.success) {
          setBatches(batchData.batches);
        }

        const studentRes = await fetch('/api/students');
        const studentData = await studentRes.json();
        if (studentData.success) {
          setStudents(studentData.students);
          // Select all by default
          setSelectedStudents(studentData.students.map((s: Student) => s._id));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitData();
  }, []);

  // Filter students based on Batch dropdown
  const filteredStudents = selectedBatch
    ? students.filter(s => {
        const bid = typeof s.batchId === 'object' ? s.batchId._id : s.batchId;
        return bid === selectedBatch;
      })
    : students;

  // Generate Barcodes for all filtered students
  useEffect(() => {
    const generateBarcodes = async () => {
      const barcodeMap: Record<string, string> = {};
      for (const student of filteredStudents) {
        try {
          const canvas = document.createElement('canvas');
          JsBarcode(canvas, student.studentId, {
            format: 'CODE128',
            displayValue: false,
            margin: 0,
            background: '#ffffff',
            lineColor: '#000000',
            width: 3,
            height: 50
          });
          barcodeMap[student._id] = canvas.toDataURL('image/png');
        } catch (err) {
          console.error('Barcode generation failed:', err);
        }
      }
      setQrCodes(prev => ({ ...prev, ...barcodeMap }));
    };

    if (filteredStudents.length > 0) {
      generateBarcodes();
    }
  }, [filteredStudents]);

  // Handle checking/toggling selections
  const toggleSelectStudent = (id: string) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const pageIds = filteredStudents.map(s => s._id);
    const allSelectedOnPage = pageIds.every(id => selectedStudents.includes(id));

    if (allSelectedOnPage) {
      // Unselect all students on the current filtered page
      setSelectedStudents(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      // Add all students on the current page that aren't already selected
      setSelectedStudents(prev => [...new Set([...prev, ...pageIds])]);
    }
  };

  // Generate and Download PDF containing selected ID cards
  const handleDownloadPDF = async () => {
    const selectedList = filteredStudents.filter(s => selectedStudents.includes(s._id));
    if (selectedList.length === 0) {
      alert('Please select at least one student to generate cards.');
      return;
    }

    setPdfGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // A4 dimensions: 210 x 297 mm
      // Let's draw standard cards of size 85mm x 55mm (landscape layout for student ID cards)
      // We can fit 8 cards on a single A4 page (2 columns, 4 rows)
      const cardWidth = 85;
      const cardHeight = 55;
      const startX = 15;
      const startY = 15;
      const gapX = 10;
      const gapY = 10;

      let col = 0;
      let row = 0;

      for (let i = 0; i < selectedList.length; i++) {
        const student = selectedList[i];
        const batchName = typeof student.batchId === 'object' ? student.batchId.name : 'Master Batch';

        if (i > 0 && i % 8 === 0) {
          doc.addPage();
          col = 0;
          row = 0;
        }

        const x = startX + col * (cardWidth + gapX);
        const y = startY + row * (cardHeight + gapY);

        // Draw Card Outline Border
        doc.setDrawColor(39, 39, 42); // zinc-800
        doc.setFillColor(9, 9, 11); // zinc-950 background
        doc.rect(x, y, cardWidth, cardHeight, 'FD');

        // Draw Top Header Banner
        doc.setFillColor(16, 185, 129); // emerald-500
        doc.rect(x, y, cardWidth, 4, 'F');

        // Draw Logo Text
        doc.setTextColor(250, 250, 250); // zinc-50
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('ATTENDEE', x + 5, y + 9);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(5);
        doc.setTextColor(160, 160, 160);
        doc.text('COACHING ID CARD', x + 5, y + 12);

        // Draw Student Information
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(250, 250, 250);
        doc.text(student.name, x + 5, y + 22);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(180, 180, 180);
        doc.text(`ID: ${student.studentId}`, x + 5, y + 27);
        doc.text(`Course: ${student.course}`, x + 5, y + 32);
        
        doc.setFontSize(6);
        doc.setTextColor(140, 140, 140);
        doc.text(`Batch: ${batchName.substring(0, 25)}`, x + 5, y + 38);
        doc.text(`Parent: ${student.parentName}`, x + 5, y + 43);
        doc.text(`Phone: ${student.parentPhone}`, x + 5, y + 48);

        // Draw Barcode image
        const barcodeBase64 = qrCodes[student._id];
        if (barcodeBase64) {
          doc.addImage(barcodeBase64, 'PNG', x + cardWidth - 36, y + 12, 30, 11);
        }

        // Barcode Border box
        doc.setDrawColor(80, 80, 80);
        doc.rect(x + cardWidth - 38, y + 10, 34, 15);

        // Footer marker
        doc.setFontSize(4);
        doc.setTextColor(80, 80, 80);
        doc.text('SECURE BARCODE IDENTIFICATION', x + cardWidth - 37, y + 28);

        col++;
        if (col >= 2) {
          col = 0;
          row++;
        }
      }

      doc.save(`Attendee-Cards-${selectedBatch ? 'Batch' : 'All'}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Make sure your browser supports download triggers.');
    } finally {
      setPdfGenerating(false);
    }
  };

  const selectedFilteredCount = filteredStudents.filter(s => selectedStudents.includes(s._id)).length;
  const isAllPageSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedStudents.includes(s._id));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Barcode ID Card Generator
          </h1>
          <p className="text-zinc-400 mt-1 font-light text-sm">
            Generate, customize, and bulk download print-ready student ID cards carrying secure attendance barcode credentials.
          </p>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={pdfGenerating || selectedFilteredCount === 0 || loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold font-mono uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-lg transition-all shadow-md cursor-pointer shrink-0"
        >
          {pdfGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-black" />
              Compiling PDF...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 text-black" />
              Download {selectedFilteredCount} ID Cards (PDF)
            </>
          )}
        </button>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Batch Select */}
        <div className="md:col-span-2">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">
            Filter by Batch Roster
          </label>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full bg-zinc-900/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500 transition-all font-light cursor-pointer"
          >
            <option value="">All Registered Students</option>
            {batches.map((batch) => (
              <option key={batch._id} value={batch._id}>
                {batch.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selection summary */}
        <div className="md:col-span-2 flex items-end justify-between py-2">
          <button
            onClick={toggleSelectAll}
            className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white font-mono uppercase tracking-wider cursor-pointer"
          >
            {isAllPageSelected ? (
              <CheckSquare className="h-4 w-4 text-emerald-400" />
            ) : (
              <Square className="h-4 w-4 text-zinc-600" />
            )}
            Select All in view ({filteredStudents.length})
          </button>

          <span className="text-xs text-zinc-500 font-light">
            Total Selected: <strong className="text-emerald-400 font-mono font-semibold">{selectedFilteredCount}</strong>
          </span>
        </div>
      </div>

      {/* Grid of cards */}
      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center gap-3 border border-zinc-850 rounded-xl bg-zinc-900/10">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-xs text-zinc-400 font-mono">Drawing secure cryptographic components...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-20 text-center border border-dashed border-zinc-800 rounded-xl">
          <Barcode className="h-8 w-8 text-zinc-650 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white">No Cards Available</h3>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto font-light mt-1">
            No students are currently enrolled in the selected batch. Register students in the Directory page first.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => {
            const isSelected = selectedStudents.includes(student._id);
            const batchName = typeof student.batchId === 'object' ? student.batchId.name : 'Master Batch';
            const batchSlot = typeof student.batchId === 'object' ? student.batchId.timeSlot : '';
            const qrImage = qrCodes[student._id];

            return (
              <div
                key={student._id}
                onClick={() => toggleSelectStudent(student._id)}
                className={`relative rounded-2xl border transition-all cursor-pointer select-none overflow-hidden ${
                  isSelected
                    ? 'border-emerald-500/40 bg-zinc-900/40 shadow-emerald-950/20 shadow-2xl scale-[1.01]'
                    : 'border-zinc-800/80 bg-zinc-900/10 hover:border-zinc-700/80'
                }`}
              >
                {/* Visual Card Wrapper */}
                <div className="p-5 space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center text-black font-extrabold text-[10px]">
                        A
                      </div>
                      <span className="text-[10px] font-bold text-white tracking-widest uppercase">Attendee</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-emerald" />
                      <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
                        SECURE ID
                      </span>
                    </div>
                  </div>

                  {/* Card Main Block */}
                  <div className="flex items-start justify-between gap-4">
                    {/* Details */}
                    <div className="space-y-3 flex-1 min-w-0">
                      <div>
                        <h4 className="font-bold text-white text-base truncate leading-snug">{student.name}</h4>
                        <span className="block font-mono text-[10px] text-emerald-400 uppercase tracking-wide mt-0.5">
                          ID: {student.studentId}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-zinc-400 font-light">
                        <p className="truncate">Course: <strong className="text-zinc-200 font-medium">{student.course}</strong></p>
                        <p className="text-[10px] text-zinc-500 truncate" title={batchName}>
                          Batch: {batchName}
                        </p>
                      </div>
                    </div>

                    {/* Barcode Container */}
                    <div className="shrink-0 w-32 h-16 border border-zinc-800 bg-white p-2 rounded-lg flex items-center justify-center relative group-hover:border-zinc-700 transition-colors">
                      {qrImage ? (
                        <img
                          src={qrImage}
                          alt="Student Barcode"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                      )}
                    </div>
                  </div>

                  {/* Card Footer Details */}
                  <div className="pt-2 border-t border-zinc-850 flex justify-between items-center text-[10px] font-mono text-zinc-500">
                    <div>
                      <p>PARENT: {student.parentName.toUpperCase()}</p>
                      <p className="mt-0.5">{student.parentPhone}</p>
                    </div>
                    {isSelected ? (
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[8px] font-bold tracking-widest uppercase">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-zinc-950 border border-zinc-850 text-zinc-650 rounded text-[8px] tracking-widest uppercase">
                        Queued
                      </span>
                    )}
                  </div>
                </div>

                {/* Selection Check Indicator in corner */}
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-black px-1.5 py-0.5 rounded-bl-lg">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
