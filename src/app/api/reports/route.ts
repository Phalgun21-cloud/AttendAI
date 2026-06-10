import { NextResponse } from 'next/server';
import dbConnect, { isMockDb } from '@/lib/db';
import { Student } from '@/lib/models/Student';
import { Attendance } from '@/lib/models/Attendance';
import { mockDbHelper } from '@/lib/mockDb';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams = new URL(request.url).searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId') || '';
    const startDateStr = searchParams.get('startDate') || '';
    const endDateStr = searchParams.get('endDate') || '';

    // Default: last 30 days
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

    let reportData: any;
    if (isMockDb()) {
      reportData = mockDbHelper.getReports(batchId, startDateStr, endDateStr);
    } else {
      // Find students matching batch filter
      const studentQuery: any = {};
      if (batchId) {
        studentQuery.batchId = batchId;
      }

      const students = await Student.find(studentQuery).populate('batchId');

      // Retrieve attendance records in range
      const studentIds = students.map(s => s._id);
      const logs = await Attendance.find({
        studentId: { $in: studentIds },
        timestamp: { $gte: start, $lte: end }
      });

      // Compute report details
      reportData = students.map(student => {
        const studentLogs = logs.filter(log => log.studentId.toString() === student._id.toString());
        
        const present = studentLogs.filter(log => log.status === 'PRESENT' || log.status === 'LATE').length;
        const absent = studentLogs.filter(log => log.status === 'ABSENT').length;
        const total = studentLogs.length;

        const rate = total > 0 ? Math.round((present / total) * 100) : 100; // default 100% if no logs

        return {
          _id: student._id,
          studentId: student.studentId,
          name: student.name,
          course: student.course,
          batchName: (student.batchId as any)?.name || 'Master Batch',
          present,
          absent,
          total,
          rate
        };
      });
    }

    return NextResponse.json({
      success: true,
      reportData,
      meta: {
        startDate: start.toISOString(),
        endDate: end.toISOString()
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
