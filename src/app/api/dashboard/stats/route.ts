import { NextResponse } from 'next/server';
import dbConnect, { isMockDb } from '@/lib/db';
import { Student } from '@/lib/models/Student';
import { Attendance } from '@/lib/models/Attendance';
import { Call } from '@/lib/models/Call';
import { Batch } from '@/lib/models/Batch';
import { mockDbHelper } from '@/lib/mockDb';

export async function GET() {
  try {
    await dbConnect();

    let stats;
    if (isMockDb()) {
      stats = mockDbHelper.getDashboardStats();
    } else {
      // 1. Total Students count
      const totalStudents = await Student.countDocuments({});

      // 2. Today's date range
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      // 3. Attendance metrics today
      const todaysLogs = await Attendance.find({
        timestamp: { $gte: startOfToday, $lte: endOfToday }
      });

      const presentToday = todaysLogs.filter(log => log.status === 'PRESENT' || log.status === 'LATE').length;
      
      // Absent includes students who are explicitly marked ABSENT, plus anyone not marked present/late yet
      const markedAbsentToday = todaysLogs.filter(log => log.status === 'ABSENT').length;
      const unmarkedStudents = Math.max(0, totalStudents - todaysLogs.length);
      const absentToday = markedAbsentToday + unmarkedStudents;

      const attendanceBreakdown = [
        { name: 'Present', value: todaysLogs.filter(log => log.status === 'PRESENT').length },
        { name: 'Late', value: todaysLogs.filter(log => log.status === 'LATE').length },
        { name: 'Absent', value: absentToday }
      ];

      const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;

      // 4. Calls today
      const todaysCalls = await Call.find({
        createdAt: { $gte: startOfToday, $lte: endOfToday }
      });
      const callsTodayCount = todaysCalls.length;

      const callOutcomes = [
        { name: 'Answered', value: todaysCalls.filter(c => c.status === 'COMPLETED' && c.outcome === 'Answered').length },
        { name: 'Voicemail', value: todaysCalls.filter(c => c.status === 'COMPLETED' && c.outcome === 'Voicemail').length },
        { name: 'Failed', value: todaysCalls.filter(c => c.status === 'FAILED').length },
        { name: 'Queued', value: todaysCalls.filter(c => c.status === 'QUEUED' || c.status === 'CALLING').length }
      ];

      // 5. Daily Attendance history (last 7 working days)
      const dailyHistory = [];
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 6; i >= 0; i--) {
        const day = new Date();
        day.setDate(day.getDate() - i);
        
        const startOfDay = new Date(day);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(day);
        endOfDay.setHours(23, 59, 59, 999);

        const logsOnDay = await Attendance.find({
          timestamp: { $gte: startOfDay, $lte: endOfDay }
        });

        const dayPresent = logsOnDay.filter(log => log.status === 'PRESENT' || log.status === 'LATE').length;
        
        // Calculate rate for that day
        const dayRate = totalStudents > 0 ? Math.round((dayPresent / totalStudents) * 100) : 0;

        dailyHistory.push({
          date: weekdays[day.getDay()] + ' ' + (day.getMonth() + 1) + '/' + day.getDate(),
          present: dayPresent,
          rate: dayRate
        });
      }

      // 5b. Monthly History (last 30 days)
      const monthlyHistory = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const startOfDay = new Date(d);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(d);
        endOfDay.setHours(23, 59, 59, 999);
        const logsOnDay = await Attendance.find({
          timestamp: { $gte: startOfDay, $lte: endOfDay }
        });
        const dayPresent = logsOnDay.filter(log => log.status === 'PRESENT' || log.status === 'LATE').length;
        const dayRate = totalStudents > 0 ? Math.round((dayPresent / totalStudents) * 100) : 0;
        monthlyHistory.push({
          date: (d.getMonth() + 1) + '/' + d.getDate(),
          rate: dayRate
        });
      }

      // 5c. Quarterly History (last 12 weeks)
      const quarterlyHistory = [];
      for (let i = 11; i >= 0; i--) {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - (i * 7 + 7));
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() - (i * 7));
        const logsOnWeek = await Attendance.find({
          timestamp: { $gte: startOfWeek, $lte: endOfWeek }
        });
        const expectedLogs = totalStudents * 7;
        const weekPresent = logsOnWeek.filter(log => log.status === 'PRESENT' || log.status === 'LATE').length;
        const weekRate = expectedLogs > 0 ? Math.round((weekPresent / expectedLogs) * 100) : 0;
        quarterlyHistory.push({
          date: 'Week ' + (12 - i),
          rate: weekRate
        });
      }

      // 6. Batch performance today
      const batches = await Batch.find({});
      const batchStats = [];

      for (const batch of batches) {
        // Find students in this batch
        const batchStudents = await Student.find({ batchId: batch._id });
        const studentIds = batchStudents.map(s => s._id);

        // Present today in this batch
        const presentInBatch = todaysLogs.filter(log => 
          studentIds.some(id => id.toString() === log.studentId.toString()) && 
          (log.status === 'PRESENT' || log.status === 'LATE')
        ).length;

        const rate = studentIds.length > 0 ? Math.round((presentInBatch / studentIds.length) * 100) : 0;

        batchStats.push({
          name: batch.name.replace(' Batch', ''), // shorten name
          present: presentInBatch,
          total: studentIds.length,
          rate
        });
      }

      // 7. Recent activities (mix of recent scans and recent calls)
      const recentScans = await Attendance.find({
        timestamp: { $gte: startOfToday, $lte: endOfToday }
      })
        .sort({ timestamp: -1 })
        .limit(5)
        .populate('studentId');

      const recentCalls = await Call.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('studentId');

      stats = {
        totalStudents,
        presentToday,
        absentToday,
        attendanceRate,
        aiCallsMade: callsTodayCount,
        attendanceBreakdown,
        callOutcomes,
        dailyHistory,
        monthlyHistory,
        quarterlyHistory,
        batchStats,
        recentScans: recentScans.map((rs: any) => ({
          id: rs._id,
          studentName: rs.studentId?.name || 'Unknown',
          studentId: rs.studentId?.studentId || '',
          timestamp: rs.timestamp,
          status: rs.status,
          source: rs.source
        })),
        recentCalls: recentCalls.map((rc: any) => ({
          id: rc._id,
          studentName: rc.studentId?.name || 'Unknown',
          phone: rc.parentPhone,
          status: rc.status,
          outcome: rc.outcome || 'Call Queued',
          timestamp: rc.createdAt
        }))
      };
    }

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
