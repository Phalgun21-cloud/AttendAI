import { NextResponse } from 'next/server';
import dbConnect, { isMockDb } from '@/lib/db';
import { Call } from '@/lib/models/Call';
import { mockDbHelper } from '@/lib/mockDb';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await dbConnect();
    const body = await request.json();
    const { status, transcript, summary, outcome } = body;

    let call: any;
    if (isMockDb()) {
      call = mockDbHelper.updateCallSimulation(id, status, transcript, summary, outcome);
      if (call) {
        // Populate student info
        const mockStudents = mockDbHelper.getStudents();
        const studentObj = mockStudents.find(s => s._id === call.studentId);
        call = { ...call, studentId: studentObj };
      }
    } else {
      call = await Call.findByIdAndUpdate(
        id,
        { status, transcript, summary, outcome },
        { new: true }
      );
    }

    if (!call) {
      return NextResponse.json({ success: false, error: 'Call record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, call });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
