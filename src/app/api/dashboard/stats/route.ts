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

    let stats: any;
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

      // 4. Calls
      const todaysCalls = await Call.find({
        createdAt: { $gte: startOfToday, $lte: endOfToday }
      });
      const callsTodayCount = todaysCalls.length;

      const startOf30Days = new Date();
      startOf30Days.setDate(startOf30Days.getDate() - 30);
      startOf30Days.setHours(0, 0, 0, 0);

      const recentCallsData = await Call.find({
        createdAt: { $gte: startOf30Days, $lte: endOfToday }
      });

      const callOutcomes = [
        { name: 'Answered', value: recentCallsData.filter(c => c.status === 'COMPLETED' && c.outcome === 'Answered').length },
        { name: 'Voicemail', value: recentCallsData.filter(c => c.status === 'COMPLETED' && c.outcome === 'Voicemail').length },
        { name: 'Failed', value: recentCallsData.filter(c => c.status === 'FAILED').length },
        { name: 'Queued', value: recentCallsData.filter(c => c.status === 'QUEUED' || c.status === 'CALLING').length }
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

      // 5b. Monthly History (last 6 months)
      const monthlyHistory = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 5; i >= 0; i--) {
        const startOfMonth = new Date();
        startOfMonth.setMonth(startOfMonth.getMonth() - i);
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        endOfMonth.setHours(23, 59, 59, 999);

        const logsInMonth = await Attendance.find({
          timestamp: { $gte: startOfMonth, $lte: endOfMonth }
        });

        const dailyCounts: Record<string, number> = {};
        logsInMonth.forEach(log => {
          const d = new Date(log.timestamp);
          const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          if (!dailyCounts[dateKey]) dailyCounts[dateKey] = 0;
          if (log.status === 'PRESENT' || log.status === 'LATE') dailyCounts[dateKey]++;
        });

        const daysWithLogs = Object.keys(dailyCounts);
        let monthRate = 0;
        if (daysWithLogs.length > 0) {
          const sumOfRates = daysWithLogs.reduce((sum, key) => sum + (totalStudents > 0 ? (dailyCounts[key] / totalStudents) * 100 : 0), 0);
          monthRate = Math.round(sumOfRates / daysWithLogs.length);
        }

        monthlyHistory.push({
          date: monthNames[startOfMonth.getMonth()],
          rate: monthRate
        });
      }

      // 5c. Quarterly History (last 12 weeks)
      const quarterlyHistory = [];
      for (let i = 11; i >= 0; i--) {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - (i * 7 + 7));
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() - (i * 7));
        endOfWeek.setHours(23, 59, 59, 999);
        
        const logsOnWeek = await Attendance.find({
          timestamp: { $gte: startOfWeek, $lte: endOfWeek }
        });
        
        const dailyCounts: Record<string, number> = {};
        logsOnWeek.forEach(log => {
          const d = new Date(log.timestamp);
          const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          if (!dailyCounts[dateKey]) dailyCounts[dateKey] = 0;
          if (log.status === 'PRESENT' || log.status === 'LATE') dailyCounts[dateKey]++;
        });

        const daysWithLogs = Object.keys(dailyCounts);
        let weekRate = 0;
        if (daysWithLogs.length > 0) {
          const sumOfRates = daysWithLogs.reduce((sum, key) => sum + (totalStudents > 0 ? (dailyCounts[key] / totalStudents) * 100 : 0), 0);
          weekRate = Math.round(sumOfRates / daysWithLogs.length);
        }

        quarterlyHistory.push({
          date: 'Week ' + (12 - i),
          rate: weekRate
        });
      }

      // 6. Batch performance (last 30 days for better data visualization)
      const batches = await Batch.find({});
      const batchStats = [];
      const absenteesByBatch = [];

      const logsLast30Days = await Attendance.find({
        timestamp: { $gte: startOf30Days, $lte: endOfToday }
      });

      for (const batch of batches) {
        // Find students in this batch
        const batchStudents = await Student.find({ batchId: batch._id });
        const studentIds = batchStudents.map(s => s._id);

        // Find how many days this batch had logs
        const batchLogs = logsLast30Days.filter(log => studentIds.some(id => id.toString() === log.studentId.toString()));
        const presentLogs = batchLogs.filter(log => log.status === 'PRESENT' || log.status === 'LATE').length;
        
        // precise calculation based on active days
        const uniqueDays = new Set(batchLogs.map(log => new Date(log.timestamp).toISOString().split('T')[0])).size;
        const expectedLogs = studentIds.length * (uniqueDays || 1); // Avoid div by 0
        
        const rate = expectedLogs > 0 ? Math.round((presentLogs / expectedLogs) * 100) : 0;

        const name = batch.name.replace(' Batch', ''); // shorten name
        batchStats.push({
          name,
          present: presentLogs,
          total: studentIds.length,
          rate
        });

        // Absentees by batch (still keep today's absentees for the pie chart)
        const presentTodayInBatch = todaysLogs.filter(log => 
          studentIds.some(id => id.toString() === log.studentId.toString()) && 
          (log.status === 'PRESENT' || log.status === 'LATE')
        ).length;

        absenteesByBatch.push({
          name,
          value: studentIds.length - presentTodayInBatch
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
        absenteesByBatch,
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
