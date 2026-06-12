import { NextResponse } from 'next/server';
import dbConnect, { isMockDb } from '@/lib/db';
import { mockDbHelper } from '@/lib/mockDb';
import { Batch } from '@/lib/models/Batch';
import { Student } from '@/lib/models/Student';
import { Attendance } from '@/lib/models/Attendance';
import { Call } from '@/lib/models/Call';

export async function GET(request: Request) {
  try {
    await dbConnect();

    // In a real environment, you might want to secure this endpoint with a secret key
    // so it can only be called by a trusted cron scheduler like Vercel Cron.

    // Process MockDB if active
    if (isMockDb()) {
      const batches = mockDbHelper.getBatches();
      let processedCount = 0;
      let absenteesMarked = 0;

      for (const batch of batches) {
        if (!batch.startTime) continue;
        const [hours, mins] = batch.startTime.split(':').map(Number);
        const cutoffTime = new Date();
        cutoffTime.setHours(hours, mins + 30, 0, 0);

        if (new Date() > cutoffTime) {
          const lastCheck = batch.lastAbsenteeCheck;
          const alreadyCheckedToday = lastCheck && 
            lastCheck.getDate() === new Date().getDate() && 
            lastCheck.getMonth() === new Date().getMonth() && 
            lastCheck.getFullYear() === new Date().getFullYear();

          if (!alreadyCheckedToday) {
            processedCount++;
            const students = mockDbHelper.getStudents('', batch._id);
            const todayLogs = mockDbHelper.getAttendance(new Date().toISOString());

            for (const student of students) {
              const hasAttended = todayLogs.some((l: any) => l.studentId._id === student._id);
              if (!hasAttended) {
                mockDbHelper.markAbsentee(student._id);
                absenteesMarked++;

                mockDbHelper.createCall({
                  studentId: student._id,
                  parentPhone: student.parentPhone,
                  timestamp: new Date(),
                  status: 'COMPLETED',
                  transcript: [
                    { speaker: 'AI', text: `Hello, this is the AI assistant from AttendAI. We noticed that ${student.name} did not arrive for their ${batch.startTime} batch today.` },
                    { speaker: 'Parent', text: `Yes, thank you for letting me know. They are not feeling well today.` },
                    { speaker: 'AI', text: `Understood, we hope they recover quickly. The class recordings and notes will be shared. Thank you for confirming.` }
                  ],
                  summary: `Automated absentee detection. Parent confirmed student is unwell.`,
                  outcome: `Parent notified (Student unwell)`,
                  smsSent: true
                });
              }
            }
            mockDbHelper.updateBatchCheck(batch._id);
          }
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Mock Absentee check completed.',
        batchesProcessed: processedCount,
        absenteesMarked
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const batches = await Batch.find({});
    const now = new Date();
    let processedCount = 0;
    let absenteesMarked = 0;

    for (const batch of batches) {
      if (!batch.startTime) continue;

      const [hours, mins] = batch.startTime.split(':').map(Number);
      const cutoffTime = new Date();
      cutoffTime.setHours(hours, mins + 30, 0, 0);

      // Check if current time is past the 30-min grace period
      if (now > cutoffTime) {
        // Check if we already processed this batch today
        const lastCheck = batch.lastAbsenteeCheck;
        const alreadyCheckedToday = lastCheck && 
          lastCheck.getDate() === now.getDate() && 
          lastCheck.getMonth() === now.getMonth() && 
          lastCheck.getFullYear() === now.getFullYear();

        if (!alreadyCheckedToday) {
          processedCount++;
          const students = await Student.find({ batchId: batch._id });

          for (const student of students) {
            // Check if student has attendance for today
            const existingAttendance = await Attendance.findOne({
              studentId: student._id,
              date: startOfDay
            });

            if (!existingAttendance) {
              // Mark as Absent
              await Attendance.create({
                studentId: student._id,
                date: startOfDay,
                timestamp: new Date(),
                status: 'ABSENT',
                source: 'MANUAL'
              });
              absenteesMarked++;

              // Simulate AI Call Generation
              const callTime = new Date();
              await Call.create({
                studentId: student._id,
                parentPhone: student.parentPhone,
                timestamp: callTime,
                status: 'COMPLETED',
                transcript: [
                  { speaker: 'AI', text: `Hello, this is the AI assistant from AttendAI. We noticed that ${student.name} did not arrive for their ${batch.startTime} batch today.` },
                  { speaker: 'Parent', text: `Yes, thank you for letting me know. They are not feeling well today.` },
                  { speaker: 'AI', text: `Understood, we hope they recover quickly. The class recordings and notes will be shared. Thank you for confirming.` }
                ],
                summary: `Automated absentee detection. Parent confirmed student is unwell.`,
                outcome: `Parent notified (Student unwell)`,
                smsSent: true
              });
            }
          }

          // Update batch to prevent re-checking today
          batch.lastAbsenteeCheck = now;
          await batch.save();
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Absentee check completed.',
      batchesProcessed: processedCount,
      absenteesMarked
    });

  } catch (error: any) {
    console.error('Absentee Cron Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
