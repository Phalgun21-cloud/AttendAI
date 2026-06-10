import { NextResponse } from 'next/server';
import dbConnect, { isMockDb } from '@/lib/db';
import { Student } from '@/lib/models/Student';
import { Attendance } from '@/lib/models/Attendance';
import { Call } from '@/lib/models/Call';
import { mockDbHelper } from '@/lib/mockDb';

export async function POST() {
  try {
    await dbConnect();

    if (isMockDb()) {
      const { detectedAbsentees, callsQueued } = mockDbHelper.detectAbsentees();
      return NextResponse.json({
        success: true,
        absenteesCount: detectedAbsentees.length,
        callsCount: callsQueued.length,
        absentees: detectedAbsentees.map(s => ({
          id: s._id,
          name: s.name,
          studentId: s.studentId,
          parentPhone: s.parentPhone
        }))
      });
    }

    // 1. Get all students
    const allStudents = await Student.find({}).populate('batchId');

    // 2. Get today's attendance logs
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysAttendance = await Attendance.find({
      $or: [
        { date: startOfDay },
        { timestamp: { $gte: startOfDay, $lte: endOfDay } } // Fallback
      ]
    });

    const presentStudentIds = new Set(
      todaysAttendance
        .filter(log => log.status === 'PRESENT' || log.status === 'LATE' || log.status === 'PARTIAL')
        .map(log => log.studentId.toString())
    );

    const absentStudentIds = new Set(
      todaysAttendance
        .filter(log => log.status === 'ABSENT')
        .map(log => log.studentId.toString())
    );

    const detectedAbsentees = [];
    const callsQueued = [];

    for (const student of allStudents) {
      const studentIdStr = student._id.toString();

      // If they are not marked present/late, they are absent!
      if (!presentStudentIds.has(studentIdStr)) {
        detectedAbsentees.push(student);

        // Check if ABSENT record already exists
        if (!absentStudentIds.has(studentIdStr)) {
          await Attendance.create({
            studentId: student._id,
            date: startOfDay,
            timestamp: new Date(),
            status: 'ABSENT',
            source: 'MANUAL'
          });
        }

        // Check if Call record already exists today
        const existingCall = await Call.findOne({
          studentId: student._id,
          timestamp: { $gte: startOfDay, $lte: endOfDay }
        });

        if (!existingCall) {
          const call = await Call.create({
            studentId: student._id,
            parentPhone: student.parentPhone,
            status: 'PENDING',
            transcript: [],
            summary: '',
            outcome: '',
            smsSent: true // Simulating the SMS dispatch along with call queuing
          });
          callsQueued.push(call);
        }
      }
    }

    return NextResponse.json({
      success: true,
      absenteesCount: detectedAbsentees.length,
      callsCount: callsQueued.length,
      absentees: detectedAbsentees.map(s => ({
        id: s._id,
        name: s.name,
        studentId: s.studentId,
        parentPhone: s.parentPhone
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
