import { NextResponse } from 'next/server';
import dbConnect, { isMockDb } from '@/lib/db';
import { Batch } from '@/lib/models/Batch';
import { Student } from '@/lib/models/Student';
import { Attendance } from '@/lib/models/Attendance';
import { mockDbHelper } from '@/lib/mockDb';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const batchId = resolvedParams.id;

    if (isMockDb()) {
      const rawBatches = mockDbHelper.getBatches();
      const batchDetails = rawBatches.find(b => b._id === batchId);

      if (!batchDetails) {
        return NextResponse.json({ success: false, error: 'Batch not found' }, { status: 404 });
      }

      const allReports = mockDbHelper.getReports(batchId);
      
      // Calculate daily history for the batch
      const dailyHistory = [];
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const day = new Date();
        day.setDate(day.getDate() - i);
        const start = new Date(day);
        start.setHours(0, 0, 0, 0);
        const end = new Date(day);
        end.setHours(23, 59, 59, 999);

        // Fetch logs manually for this batch from mockDbHelper since we need specific filtering
        const allAttendance = mockDbHelper.getAttendance(); // this gets all mock attendance
        const logsOnDay = allAttendance.filter((a: any) => {
          const time = new Date(a.timestamp).getTime();
          return a.studentId && a.studentId.batchId && a.studentId.batchId._id === batchId && time >= start.getTime() && time <= end.getTime();
        });

        const dayPresent = logsOnDay.filter((a: any) => a.status === 'PRESENT' || a.status === 'LATE').length;
        const totalStudents = allReports.length;
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
        // consistent pseudo-random rate based on batch ID length and day
        const baseRate = 75 + ((batchId.length * 3 + i * 7) % 20); 
        monthlyHistory.push({
          date: (d.getMonth() + 1) + '/' + d.getDate(),
          rate: baseRate
        });
      }

      const quarterlyHistory = [];
      for (let i = 11; i >= 0; i--) {
        const baseRate = 70 + ((batchId.length * 5 + i * 3) % 25);
        quarterlyHistory.push({
          date: 'Week ' + (12 - i),
          rate: baseRate
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          batchDetails,
          dailyHistory,
          monthlyHistory,
          quarterlyHistory,
          studentReports: allReports
        }
      });
    }

    // Real DB implementation
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return NextResponse.json({ success: false, error: 'Batch not found' }, { status: 404 });
    }

    const students = await Student.find({ batchId });
    const studentIds = students.map(s => s._id);

    // 1. Daily History (Last 7 days)
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
        timestamp: { $gte: startOfDay, $lte: endOfDay },
        studentId: { $in: studentIds }
      });

      const dayPresent = logsOnDay.filter(log => log.status === 'PRESENT' || log.status === 'LATE').length;
      const rate = studentIds.length > 0 ? Math.round((dayPresent / studentIds.length) * 100) : 0;

      dailyHistory.push({
        date: weekdays[day.getDay()] + ' ' + (day.getMonth() + 1) + '/' + day.getDate(),
        present: dayPresent,
        rate
      });
    }

    // 2. Student Reports (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const monthLogs = await Attendance.find({
      timestamp: { $gte: thirtyDaysAgo },
      studentId: { $in: studentIds }
    });

    const studentReports = students.map(student => {
      const logs = monthLogs.filter(log => log.studentId.toString() === student._id.toString());
      const present = logs.filter(log => log.status === 'PRESENT' || log.status === 'LATE').length;
      const absent = logs.filter(log => log.status === 'ABSENT').length;
      const rate = logs.length > 0 ? Math.round((present / logs.length) * 100) : 100;

      return {
        _id: student._id,
        studentId: student.studentId,
        name: student.name,
        course: student.course,
        batchName: batch.name,
        present,
        absent,
        total: logs.length,
        rate
      };
    });

    const monthlyHistory = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);
      const logsOnDay = await Attendance.find({
        timestamp: { $gte: startOfDay, $lte: endOfDay },
        studentId: { $in: studentIds }
      });
      const dayPresent = logsOnDay.filter(log => log.status === 'PRESENT' || log.status === 'LATE').length;
      const rate = studentIds.length > 0 ? Math.round((dayPresent / studentIds.length) * 100) : 0;
      monthlyHistory.push({
        date: (d.getMonth() + 1) + '/' + d.getDate(),
        rate
      });
    }

    const quarterlyHistory = [];
    for (let i = 11; i >= 0; i--) {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - (i * 7 + 7));
      const endOfWeek = new Date();
      endOfWeek.setDate(endOfWeek.getDate() - (i * 7));
      const logsOnWeek = await Attendance.find({
        timestamp: { $gte: startOfWeek, $lte: endOfWeek },
        studentId: { $in: studentIds }
      });
      const expectedLogs = studentIds.length * 7;
      const weekPresent = logsOnWeek.filter(log => log.status === 'PRESENT' || log.status === 'LATE').length;
      const rate = expectedLogs > 0 ? Math.round((weekPresent / expectedLogs) * 100) : 0;
      quarterlyHistory.push({
        date: 'Week ' + (12 - i),
        rate
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        batchDetails: batch,
        dailyHistory,
        monthlyHistory,
        quarterlyHistory,
        studentReports
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
