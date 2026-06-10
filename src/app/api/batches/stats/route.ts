import { NextResponse } from 'next/server';
import dbConnect, { isMockDb } from '@/lib/db';
import { Batch } from '@/lib/models/Batch';
import { Student } from '@/lib/models/Student';
import { Attendance } from '@/lib/models/Attendance';
import { mockDbHelper } from '@/lib/mockDb';

export async function GET() {
  try {
    await dbConnect();

    let stats;
    if (isMockDb()) {
      const dashboardStats = mockDbHelper.getDashboardStats();
      const rawBatches = mockDbHelper.getBatches();
      
      stats = rawBatches.map((rb: any) => {
        // find matching batch stat. The name in batchStats is trimmed of " Batch", so let's match carefully
        const stat = dashboardStats.batchStats.find((bs: any) => rb.name.includes(bs.name)) || { present: 0, total: 0, rate: 0 };
        return {
          _id: rb._id,
          name: rb.name,
          course: rb.course,
          timeSlot: rb.timeSlot,
          studentCount: stat.total,
          attendanceRate: stat.rate
        };
      });
    } else {
      const batches = await Batch.find({}).sort({ name: 1 });
      
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const todaysLogs = await Attendance.find({
        timestamp: { $gte: startOfToday, $lte: endOfToday }
      });

      const batchStats = [];
      for (const batch of batches) {
        const batchStudents = await Student.find({ batchId: batch._id });
        const studentIds = batchStudents.map(s => s._id);

        const presentInBatch = todaysLogs.filter(log => 
          studentIds.some(id => id.toString() === log.studentId.toString()) && 
          (log.status === 'PRESENT' || log.status === 'LATE')
        ).length;

        const rate = studentIds.length > 0 ? Math.round((presentInBatch / studentIds.length) * 100) : 0;

        batchStats.push({
          _id: batch._id,
          name: batch.name,
          course: batch.course,
          timeSlot: batch.timeSlot,
          studentCount: studentIds.length,
          attendanceRate: rate
        });
      }
      stats = batchStats;
    }

    return NextResponse.json({ success: true, batches: stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
