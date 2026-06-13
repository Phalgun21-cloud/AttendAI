import { NextResponse } from 'next/server';
import dbConnect, { isMockDb } from '@/lib/db';
import { Attendance } from '@/lib/models/Attendance';
import { Student } from '@/lib/models/Student';
import { mockDbHelper } from '@/lib/mockDb';
import { sendSMS } from '@/lib/twilio';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date') || '';

    let logs: any;
    if (isMockDb()) {
      logs = mockDbHelper.getAttendance(dateStr);
    } else {
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

      logs = await Attendance.find({
        timestamp: { $gte: start, $lte: end }
      })
        .populate({
          path: 'studentId',
          populate: { path: 'batchId' }
        })
        .sort({ timestamp: -1 });
    }

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { rfidCardId, studentId, source, status } = body;

    let log: any;
    let smsMessage = '';
    if (isMockDb()) {
      log = mockDbHelper.logAttendance(studentId || rfidCardId, source, status);
      if (!log) {
        return NextResponse.json({ success: false, error: 'Student credentials invalid or unrecognised.' }, { status: 404 });
      }
      // Populate mock log student info
      const mockStudentsWithBatch = mockDbHelper.getStudents();
      const studentObj = mockStudentsWithBatch.find(s => s._id === log.studentId);
      log = { ...log, studentId: studentObj };
      
      if (log.outTime) {
        // Second scan of the day -> OUT scan (with time)
        const outTimeStr = new Date(log.outTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        smsMessage = `Dear Parent, ${log.studentId.name} has left the institute at ${outTimeStr}.`;
      } else {
        // First scan of the day -> IN scan (with time)
        const inTimeStr = new Date(log.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        smsMessage = `Dear Parent, ${log.studentId.name} has arrived at the institute at ${inTimeStr}.`;
      }
    } else {
      let student = null;
      if (studentId) {
        student = await Student.findOne({ studentId }).populate('batchId');
      } else if (rfidCardId) {
        student = await Student.findOne({ rfidCardId }).populate('batchId');
      }

      if (!student) {
        return NextResponse.json({ success: false, error: 'Student credentials invalid or unrecognised.' }, { status: 404 });
      }

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const existingAttendance = await Attendance.findOne({
        studentId: student._id,
        $or: [
          { date: startOfDay },
          { timestamp: { $gte: startOfDay, $lte: endOfDay } } // Fallback for older records
        ]
      });

      if (existingAttendance) {
        // Second scan of the day -> OUT scan
        existingAttendance.outTime = new Date();
        existingAttendance.timestamp = new Date();
        existingAttendance.status = 'PRESENT'; // Completed day
        existingAttendance.source = source || 'MANUAL';
        await existingAttendance.save();
        log = await Attendance.findById(existingAttendance._id).populate({
          path: 'studentId',
          populate: { path: 'batchId' }
        });
        // Second scan SMS -> WITH TIME
        const outTimeStr = existingAttendance.outTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        smsMessage = `Dear Parent, ${log.studentId.name} has left the institute at ${outTimeStr}.`;
      } else {
        // First scan of the day -> IN scan
        // Check if student is late based on batch startTime (30 min grace period)
        let attendanceStatus = 'PARTIAL';
        const batchStartTimeStr = student.batchId?.startTime;
        if (batchStartTimeStr) {
          const [hours, mins] = batchStartTimeStr.split(':').map(Number);
          const batchDate = new Date();
          batchDate.setHours(hours, mins + 30, 0, 0); // Cutoff time
          if (new Date() > batchDate) {
            attendanceStatus = 'LATE';
          }
        }

        const attendance = await Attendance.create({
          studentId: student._id,
          date: startOfDay,
          inTime: new Date(),
          timestamp: new Date(),
          status: attendanceStatus, // LATE or PARTIAL
          source: source || 'RFID',
        });
        log = await Attendance.findById(attendance._id).populate({
          path: 'studentId',
          populate: { path: 'batchId' }
        });
        const inTimeStr = attendance.inTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        // First scan SMS -> WITH TIME
        smsMessage = `Dear Parent, ${log.studentId.name} has arrived at the institute at ${inTimeStr}.`;
      }
    }

    // Dispatch Twilio SMS
    const parentPhone = log?.studentId?.parentPhone;
    let smsSent = false;
    if (parentPhone && smsMessage) {
      const twilioResult = await sendSMS(parentPhone, smsMessage);
      smsSent = twilioResult.success || (twilioResult as any).mode === 'simulation';
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Attendance logged successfully.', 
      log,
      smsSent,
      smsMessage
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    if (isMockDb()) {
      mockDbHelper.clearTodaysAttendance();
    } else {
      await Attendance.deleteMany({
        $or: [
          { date: startOfDay },
          { timestamp: { $gte: startOfDay, $lte: endOfDay } }
        ]
      });
    }

    return NextResponse.json({ success: true, message: "Today's attendance logs cleared." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
