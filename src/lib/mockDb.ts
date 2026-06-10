import bcrypt from 'bcryptjs';

// Global memory store
let mockUsers: any[] = [];
let mockBatches: any[] = [];
let mockStudents: any[] = [];
let mockAttendance: any[] = [];
let mockCalls: any[] = [];

// Seed Initial Data in-memory
export function seedMockDb() {
  const hashedPassword = bcrypt.hashSync('password123', 10);

  mockUsers = [
    { _id: 'u1', name: 'Phalgun (Super Admin)', email: 'superadmin@attendee.com', password: hashedPassword, role: 'SUPER_ADMIN' }
  ];

  mockBatches = [
    { _id: 'b1', name: 'IIT-JEE Master Batch A', course: 'IIT-JEE Prep', timeSlot: '08:00 AM - 11:00 AM' },
    { _id: 'b2', name: 'NEET Achievers Batch B', course: 'NEET Prep', timeSlot: '11:30 AM - 02:30 PM' },
    { _id: 'b3', name: 'Foundation Tenth Grade C', course: 'Class 10 Board', timeSlot: '04:00 PM - 06:00 PM' },
  ];

  mockStudents = [
    { _id: 's1', studentId: 'STD001', name: 'Aman Gupta', parentName: 'Ramesh Gupta', parentPhone: '+919876543210', batchId: 'b1', course: 'IIT-JEE Prep', qrCodeData: 'QR-STD001' },
    { _id: 's2', studentId: 'STD002', name: 'Sneha Sharma', parentName: 'Sunita Sharma', parentPhone: '+919876543211', batchId: 'b1', course: 'IIT-JEE Prep', qrCodeData: 'QR-STD002' },
    { _id: 's3', studentId: 'STD003', name: 'Rohit Kumar', parentName: 'Vijay Kumar', parentPhone: '+919876543212', batchId: 'b2', course: 'NEET Prep', qrCodeData: 'QR-STD003' },
    { _id: 's4', studentId: 'STD004', name: 'Priya Patel', parentName: 'Dinesh Patel', parentPhone: '+919876543213', batchId: 'b2', course: 'NEET Prep', qrCodeData: 'QR-STD004' },
    { _id: 's5', studentId: 'STD005', name: 'Aditya Singh', parentName: 'Karan Singh', parentPhone: '+919876543214', batchId: 'b3', course: 'Class 10 Board', qrCodeData: 'QR-STD005' },
    { _id: 's6', studentId: 'STD006', name: 'Ishita Sen', parentName: 'Anil Sen', parentPhone: '+919876543215', batchId: 'b3', course: 'Class 10 Board', qrCodeData: 'QR-STD006' },
  ];

  // Seed historical attendance (last 7 days)
  const today = new Date();
  mockAttendance = [];
  mockCalls = [];

  for (let i = 7; i > 0; i--) {
    const logDate = new Date();
    logDate.setDate(today.getDate() - i);
    if (logDate.getDay() === 0 || logDate.getDay() === 6) continue; // skip weekends

    for (const student of mockStudents) {
      const rand = Math.random();
      let status = 'PRESENT';
      let source = 'QR';

      if (rand < 0.15) {
        status = 'ABSENT';
      } else if (rand < 0.25) {
        status = 'LATE';
        source = 'MANUAL';
      }

      const scanTime = new Date(logDate);
      scanTime.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0);

      mockAttendance.push({
        _id: `a_${student._id}_${i}`,
        studentId: student._id,
        timestamp: scanTime,
        status,
        source
      });

      if (status === 'ABSENT' && Math.random() < 0.8) {
        const callTime = new Date(scanTime);
        callTime.setHours(callTime.getHours() + 1);

        mockCalls.push({
          _id: `c_${student._id}_${i}`,
          studentId: student._id,
          parentPhone: student.parentPhone,
          timestamp: callTime,
          status: 'COMPLETED',
          transcript: [
            { speaker: 'AI', text: `Hello, this is Attendee calling from the Coaching Institute. We noticed that ${student.name} is absent from class today.` },
            { speaker: 'Parent', text: `Yes, thank you for letting me know. They are not feeling well today.` },
            { speaker: 'AI', text: `Understood, we hope they recover quickly. The class recordings and notes will be shared. Thank you.` }
          ],
          summary: `Automated call to verify absence. Parent confirmed student is unwell.`,
          outcome: `Parent notified (Student unwell)`,
          createdAt: callTime
        });
      }
    }
  }

  // Today's attendance
  const todayDatePresent1 = new Date();
  todayDatePresent1.setHours(8, 15, 0);
  mockAttendance.push({
    _id: 'a_today_1',
    studentId: 's1', // Aman
    timestamp: todayDatePresent1,
    status: 'PRESENT',
    source: 'QR'
  });

  const todayDatePresent2 = new Date();
  todayDatePresent2.setHours(8, 30, 0);
  mockAttendance.push({
    _id: 'a_today_2',
    studentId: 's3', // Rohit
    timestamp: todayDatePresent2,
    status: 'PRESENT',
    source: 'RFID'
  });

  const todayDatePresent3 = new Date();
  todayDatePresent3.setHours(8, 45, 0);
  mockAttendance.push({
    _id: 'a_today_3',
    studentId: 's5', // Aditya
    timestamp: todayDatePresent3,
    status: 'PRESENT',
    source: 'MANUAL'
  });
}

// Auto seed once at import
seedMockDb();

// Helper functions that mimic Mongoose operations
export const mockDbHelper = {
  // Users
  getUserByEmail: (email: string) => {
    return mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  // Batches
  getBatches: () => {
    return mockBatches;
  },
  createBatch: (name: string, course: string, timeSlot: string) => {
    const batch = { _id: `b${mockBatches.length + 1}`, name, course, timeSlot };
    mockBatches.push(batch);
    return batch;
  },

  // Students
  getStudents: (search = '', batchId = '') => {
    return mockStudents.filter(s => {
      const matchesSearch = !search || 
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.studentId.toLowerCase().includes(search.toLowerCase()) ||
        s.parentName.toLowerCase().includes(search.toLowerCase());
      
      const matchesBatch = !batchId || s.batchId === batchId;
      return matchesSearch && matchesBatch;
    }).map(s => ({
      ...s,
      batchId: mockBatches.find(b => b._id === s.batchId) || s.batchId
    }));
  },
  createStudent: (studentId: string, name: string, photoUrl: string, parentName: string, parentPhone: string, batchId: string, course: string) => {
    const student = {
      _id: `s${mockStudents.length + 1}`,
      studentId,
      name,
      photoUrl,
      parentName,
      parentPhone,
      batchId,
      course,
      qrCodeData: `QR-${studentId}`
    };
    mockStudents.push(student);
    return student;
  },
  updateStudent: (id: string, name: string, photoUrl: string, parentName: string, parentPhone: string, batchId: string, course: string) => {
    const idx = mockStudents.findIndex(s => s._id === id);
    if (idx === -1) return null;
    mockStudents[idx] = { ...mockStudents[idx], name, photoUrl, parentName, parentPhone, batchId, course };
    return mockStudents[idx];
  },
  deleteStudent: (id: string) => {
    const idx = mockStudents.findIndex(s => s._id === id);
    if (idx === -1) return false;
    mockStudents.splice(idx, 1);
    return true;
  },

  // Attendance
  getAttendance: (dateStr?: string) => {
    let start = new Date();
    start.setHours(0, 0, 0, 0);
    let end = new Date();
    end.setHours(23, 59, 59, 999);

    if (dateStr) {
      start = new Date(dateStr);
      start.setHours(0, 0, 0, 0);
      end = new Date(dateStr);
      end.setHours(23, 59, 59, 999);
    }

    return mockAttendance.filter(a => {
      const time = new Date(a.timestamp).getTime();
      return time >= start.getTime() && time <= end.getTime();
    }).map(a => ({
      ...a,
      studentId: mockStudents.map(s => ({
        ...s,
        batchId: mockBatches.find(b => b._id === s.batchId) || s.batchId
      })).find(s => s._id === a.studentId)
    })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
  logAttendance: (studentId: string, source: string, status: string) => {
    const student = mockStudents.find(s => s.studentId === studentId || s.qrCodeData === studentId);
    if (!student) return null;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingIdx = mockAttendance.findIndex(a => 
      a.studentId === student._id && 
      (a.date ? new Date(a.date).getTime() === startOfDay.getTime() : new Date(a.timestamp).getTime() >= startOfDay.getTime() && new Date(a.timestamp).getTime() <= endOfDay.getTime())
    );

    if (existingIdx !== -1) {
      mockAttendance[existingIdx].outTime = new Date();
      mockAttendance[existingIdx].timestamp = new Date();
      mockAttendance[existingIdx].status = 'PRESENT';
      mockAttendance[existingIdx].source = source || 'MANUAL';
      return mockAttendance[existingIdx];
    }

    const log = {
      _id: `a_new_${mockAttendance.length + 1}`,
      studentId: student._id,
      date: startOfDay,
      inTime: new Date(),
      timestamp: new Date(),
      status: 'PARTIAL',
      source: source || 'QR'
    };
    mockAttendance.push(log);
    return log;
  },
  detectAbsentees: () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysScans = mockAttendance.filter(a => {
      const time = new Date(a.timestamp).getTime();
      return time >= startOfDay.getTime() && time <= endOfDay.getTime();
    });

    const presentStudentIds = new Set(
      todaysScans
        .filter(a => a.status === 'PRESENT' || a.status === 'LATE' || a.status === 'PARTIAL')
        .map(a => a.studentId)
    );

    const absentStudentIds = new Set(
      todaysScans
        .filter(a => a.status === 'ABSENT')
        .map(a => a.studentId)
    );

    const detectedAbsentees = [];
    const callsQueued = [];

    for (const student of mockStudents) {
      if (!presentStudentIds.has(student._id)) {
        detectedAbsentees.push(student);

        // Mark ABSENT in DB if not already
        if (!absentStudentIds.has(student._id)) {
          mockAttendance.push({
            _id: `a_abs_${student._id}_today`,
            studentId: student._id,
            date: startOfDay,
            timestamp: new Date(),
            status: 'ABSENT',
            source: 'MANUAL'
          });
        }

        // Queue call if not already
        const existingCall = mockCalls.find(c => 
          c.studentId === student._id &&
          new Date(c.createdAt || c.timestamp).getTime() >= startOfDay.getTime() &&
          new Date(c.createdAt || c.timestamp).getTime() <= endOfDay.getTime()
        );

        if (!existingCall) {
          const call = {
            _id: `c_queued_${mockCalls.length + 1}`,
            studentId: student._id,
            parentPhone: student.parentPhone,
            timestamp: new Date(),
            status: 'PENDING',
            transcript: [],
            summary: '',
            outcome: '',
            createdAt: new Date(),
            smsSent: true
          };
          mockCalls.push(call);
          callsQueued.push(call);
        }
      }
    }

    return { detectedAbsentees, callsQueued };
  },

  // Calls
  getCalls: () => {
    return mockCalls.map(c => ({
      ...c,
      studentId: mockStudents.find(s => s._id === c.studentId) || c.studentId
    })).sort((a, b) => new Date(b.createdAt || b.timestamp).getTime() - new Date(a.createdAt || a.timestamp).getTime());
  },
  updateCallSimulation: (id: string, status: string, transcript?: any[], summary?: string, outcome?: string) => {
    const idx = mockCalls.findIndex(c => c._id === id);
    if (idx === -1) return null;
    mockCalls[idx] = {
      ...mockCalls[idx],
      status,
      ...(transcript !== undefined && { transcript }),
      ...(summary !== undefined && { summary }),
      ...(outcome !== undefined && { outcome })
    };
    return mockCalls[idx];
  },

  // Dashboard Stats
  getDashboardStats: () => {
    const totalStudents = mockStudents.length;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todaysLogs = mockAttendance.filter(a => {
      const time = new Date(a.timestamp).getTime();
      return time >= startOfToday.getTime() && time <= endOfToday.getTime();
    });

    const presentToday = todaysLogs.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const markedAbsentToday = todaysLogs.filter(a => a.status === 'ABSENT').length;
    const unmarked = Math.max(0, totalStudents - todaysLogs.length);
    const absentToday = markedAbsentToday + unmarked;

    const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;

    const attendanceBreakdown = [
      { name: 'Present', value: todaysLogs.filter(a => a.status === 'PRESENT').length },
      { name: 'Late', value: todaysLogs.filter(a => a.status === 'LATE').length },
      { name: 'Absent', value: absentToday }
    ];

    const todaysCalls = mockCalls.filter(c => {
      const time = new Date(c.createdAt || c.timestamp).getTime();
      return time >= startOfToday.getTime() && time <= endOfToday.getTime();
    });
    const callsToday = todaysCalls.length;

    const callOutcomes = [
      { name: 'Answered', value: todaysCalls.filter(c => c.status === 'COMPLETED' && c.outcome === 'Answered').length || Math.floor(callsToday * 0.4) },
      { name: 'Voicemail', value: todaysCalls.filter(c => c.status === 'COMPLETED' && c.outcome === 'Voicemail').length || Math.floor(callsToday * 0.3) },
      { name: 'Failed', value: todaysCalls.filter(c => c.status === 'FAILED').length || Math.floor(callsToday * 0.1) },
      { name: 'Queued', value: todaysCalls.filter(c => c.status === 'QUEUED' || c.status === 'CALLING').length || (callsToday - Math.floor(callsToday * 0.8)) }
    ];

    // Daily History
    const dailyHistory = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const start = new Date(day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);

      const logsOnDay = mockAttendance.filter(a => {
        const time = new Date(a.timestamp).getTime();
        return time >= start.getTime() && time <= end.getTime();
      });

      const dayPresent = logsOnDay.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
      const rate = totalStudents > 0 ? Math.round((dayPresent / totalStudents) * 100) : 0;

      dailyHistory.push({
        date: weekdays[day.getDay()] + ' ' + (day.getMonth() + 1) + '/' + day.getDate(),
        present: dayPresent,
        rate
      });
    }

    const monthlyHistory = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const baseRate = 80 + (i % 15);
      monthlyHistory.push({
        date: (d.getMonth() + 1) + '/' + d.getDate(),
        rate: baseRate
      });
    }

    const quarterlyHistory = [];
    for (let i = 11; i >= 0; i--) {
      const baseRate = 75 + (i % 20);
      quarterlyHistory.push({
        date: 'Week ' + (12 - i),
        rate: baseRate
      });
    }

    // Batch Stats
    const batchStats = mockBatches.map(batch => {
      const batchStudents = mockStudents.filter(s => s.batchId === batch._id);
      const studentIds = batchStudents.map(s => s._id);

      const presentInBatch = todaysLogs.filter(a => 
        studentIds.includes(a.studentId) && (a.status === 'PRESENT' || a.status === 'LATE')
      ).length;

      const rate = studentIds.length > 0 ? Math.round((presentInBatch / studentIds.length) * 100) : 0;

      return {
        name: batch.name.replace(' Batch', ''),
        present: presentInBatch,
        total: studentIds.length,
        rate
      };
    });

    const recentScans = todaysLogs.slice(0, 5).map(a => {
      const stud = mockStudents.find(s => s._id === a.studentId);
      return {
        id: a._id,
        studentName: stud?.name || 'Unknown',
        studentId: stud?.studentId || '',
        timestamp: a.timestamp,
        status: a.status,
        source: a.source
      };
    });

    const recentCalls = mockCalls.slice(0, 5).map(c => {
      const stud = mockStudents.find(s => s._id === c.studentId);
      return {
        id: c._id,
        studentName: stud?.name || 'Unknown',
        phone: c.parentPhone,
        status: c.status,
        outcome: c.outcome || 'Call Queued',
        timestamp: c.createdAt || c.timestamp
      };
    });

    return {
      totalStudents,
      presentToday,
      absentToday,
      attendanceRate,
      aiCallsMade: callsToday,
      attendanceBreakdown,
      callOutcomes,
      dailyHistory,
      monthlyHistory,
      quarterlyHistory,
      batchStats,
      recentScans,
      recentCalls
    };
  },

  // Reports
  getReports: (batchId = '', startDateStr = '', endDateStr = '') => {
    let start = new Date();
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    let end = new Date();
    end.setHours(23, 59, 59, 999);

    if (startDateStr) {
      start = new Date(startDateStr);
      start.setHours(0, 0, 0, 0);
    }
    if (endDateStr) {
      end = new Date(endDateStr);
      end.setHours(23, 59, 59, 999);
    }

    const filteredStudents = batchId 
      ? mockStudents.filter(s => s.batchId === batchId)
      : mockStudents;

    const studentIds = filteredStudents.map(s => s._id);
    const inRangeLogs = mockAttendance.filter(a => {
      const time = new Date(a.timestamp).getTime();
      return studentIds.includes(a.studentId) && time >= start.getTime() && time <= end.getTime();
    });

    return filteredStudents.map(student => {
      const studentLogs = inRangeLogs.filter(a => a.studentId === student._id);
      const present = studentLogs.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
      const absent = studentLogs.filter(a => a.status === 'ABSENT').length;
      const rate = studentLogs.length > 0 ? Math.round((present / studentLogs.length) * 100) : 100;

      return {
        _id: student._id,
        studentId: student.studentId,
        name: student.name,
        course: student.course,
        batchName: mockBatches.find(b => b._id === student.batchId)?.name || 'Master Batch',
        present,
        absent,
        total: studentLogs.length,
        rate
      };
    });
  }
};
