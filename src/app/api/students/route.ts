import { NextResponse } from 'next/server';
import dbConnect, { isMockDb } from '@/lib/db';
import { Student } from '@/lib/models/Student';
import { mockDbHelper } from '@/lib/mockDb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const batchId = searchParams.get('batchId') || '';

    let students: any;
    if (isMockDb()) {
      students = mockDbHelper.getStudents(search, batchId);
    } else {
      const query: any = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { studentId: { $regex: search, $options: 'i' } },
          { parentName: { $regex: search, $options: 'i' } },
        ];
      }
      if (batchId) {
        query.batchId = batchId;
      }
      students = await Student.find(query)
        .populate('batchId')
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, students });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();
    const { studentId, name, photoUrl, parentName, parentPhone, batchId, course } = body;

    if (!studentId || !name || !parentName || !parentPhone || !batchId || !course) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    let student: any;
    if (isMockDb()) {
      student = mockDbHelper.createStudent(studentId, name, photoUrl || '', parentName, parentPhone, batchId, course);
    } else {
      const existingStudent = await Student.findOne({ studentId });
      if (existingStudent) {
        return NextResponse.json({ success: false, error: 'Student ID already exists' }, { status: 400 });
      }
      const qrCodeData = `QR-${studentId}`;
      student = await Student.create({
        studentId,
        name,
        photoUrl: photoUrl || '',
        parentName,
        parentPhone,
        batchId,
        course,
        qrCodeData,
      });
    }

    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
