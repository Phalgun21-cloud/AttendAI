import { NextResponse } from 'next/server';
import dbConnect, { isMockDb } from '@/lib/db';
import { Student } from '@/lib/models/Student';
import { mockDbHelper } from '@/lib/mockDb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { Attendance } from '@/lib/models/Attendance';
import { Call } from '@/lib/models/Call';
import { Batch } from '@/lib/models/Batch';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await dbConnect();
    
    if (isMockDb()) {
      const allStudents = mockDbHelper.getStudents();
      const studentDetails = allStudents.find((s: any) => s._id === id);
      
      if (!studentDetails) {
        return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
      }

      // Format batch info
      const allBatches = mockDbHelper.getBatches();
      const batchInfo = allBatches.find(b => b._id === studentDetails.batchId) || { name: 'Unknown' };
      const formattedStudent = {
        ...studentDetails,
        batchName: batchInfo.name
      };

      // Get attendance records
      const allAttendance = mockDbHelper.getAttendance();
      const studentAttendance = allAttendance
        .filter((a: any) => a.studentId === id || (a.studentId && a.studentId._id === id))
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 30); // last 30 records

      const attendanceRecords = studentAttendance.map((a: any) => ({
        _id: a._id,
        date: new Date(a.timestamp).toISOString(),
        status: a.status
      }));

      // Calculate overall rate
      const presentDays = studentAttendance.filter((a: any) => a.status === 'PRESENT' || a.status === 'LATE').length;
      const rate = studentAttendance.length > 0 ? Math.round((presentDays / studentAttendance.length) * 100) : 0;

      // Get call logs
      const allCalls = mockDbHelper.getCalls();
      const studentCalls = allCalls
        .filter((c: any) => c.studentId === id || (c.studentId && c.studentId._id === id))
        .map((c: any) => ({
          _id: c._id,
          date: new Date(c.timestamp).toISOString(),
          status: c.status,
          summary: c.summary,
          transcript: c.transcript,
          outcome: c.outcome
        }));

      return NextResponse.json({
        success: true,
        data: {
          studentDetails: formattedStudent,
          attendanceRate: rate,
          totalCalls: studentCalls.length,
          attendanceRecords,
          callLogs: studentCalls
        }
      });
    }

    // Real DB Implementation
    const student = await Student.findById(id).populate('batchId');
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    const attendanceRecordsRaw = await Attendance.find({ studentId: id })
      .sort({ timestamp: -1 })
      .limit(30);

    const attendanceRecords = attendanceRecordsRaw.map(a => ({
      _id: a._id,
      date: a.timestamp.toISOString(),
      status: a.status
    }));

    const presentDays = attendanceRecordsRaw.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const rate = attendanceRecordsRaw.length > 0 ? Math.round((presentDays / attendanceRecordsRaw.length) * 100) : 0;

    const callLogsRaw = await Call.find({ studentId: id }).sort({ timestamp: -1 });
    const callLogs = callLogsRaw.map(c => ({
      _id: c._id,
      date: c.timestamp.toISOString(),
      status: c.status,
      summary: c.summary,
      transcript: c.transcript,
      outcome: c.outcome
    }));

    return NextResponse.json({
      success: true,
      data: {
        studentDetails: {
          ...student.toObject(),
          batchName: student.batchId?.name || 'Unknown'
        },
        attendanceRate: rate,
        totalCalls: callLogs.length,
        attendanceRecords,
        callLogs
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();
    const { name, photoUrl, parentName, parentPhone, batchId, course, rfidCardId } = body;

    let student: any;
    if (isMockDb()) {
      student = mockDbHelper.updateStudent(id, name, photoUrl || '', parentName, parentPhone, batchId, course, rfidCardId);
    } else {
      student = await Student.findByIdAndUpdate(
        id,
        { name, photoUrl, parentName, parentPhone, batchId, course, rfidCardId },
        { new: true }
      );
    }

    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    
    let deleted: any;
    if (isMockDb()) {
      deleted = mockDbHelper.deleteStudent(id);
    } else {
      const student = await Student.findByIdAndDelete(id);
      deleted = !!student;
    }

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Student deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
