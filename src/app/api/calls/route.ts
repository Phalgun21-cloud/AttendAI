import { NextResponse } from 'next/server';
import dbConnect, { isMockDb } from '@/lib/db';
import { Call } from '@/lib/models/Call';
import { mockDbHelper } from '@/lib/mockDb';

export async function GET() {
  try {
    await dbConnect();
    let calls: any;
    if (isMockDb()) {
      calls = mockDbHelper.getCalls();
    } else {
      calls = await Call.find({})
        .populate('studentId')
        .sort({ createdAt: -1 });
    }
    return NextResponse.json({ success: true, calls });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
