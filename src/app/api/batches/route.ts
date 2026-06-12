import { NextResponse } from 'next/server';
import dbConnect, { isMockDb } from '@/lib/db';
import { Batch } from '@/lib/models/Batch';
import { mockDbHelper } from '@/lib/mockDb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    await dbConnect();
    let batches: any;
    if (isMockDb()) {
      batches = mockDbHelper.getBatches();
    } else {
      batches = await Batch.find({}).sort({ name: 1 });
    }
    return NextResponse.json({ success: true, batches });
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
    const { name, course, timeSlot } = body;

    if (!name || !course || !timeSlot) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    let startTime = '08:00';
    try {
      const timePart = timeSlot.split('-')[0].trim();
      const [time, period] = timePart.split(' ');
      let [hours, minutes] = time.split(':');
      let hrs = parseInt(hours, 10);
      if (period && period.toUpperCase() === 'PM' && hrs < 12) hrs += 12;
      if (period && period.toUpperCase() === 'AM' && hrs === 12) hrs = 0;
      startTime = `${hrs.toString().padStart(2, '0')}:${minutes || '00'}`;
    } catch (e) {
      console.error('Could not parse startTime', e);
    }

    let batch: any;
    if (isMockDb()) {
      batch = mockDbHelper.createBatch(name, course, timeSlot);
    } else {
      const existingBatch = await Batch.findOne({ name });
      if (existingBatch) {
        return NextResponse.json({ success: false, error: 'Batch name already exists' }, { status: 400 });
      }
      batch = await Batch.create({ name, course, timeSlot, startTime });
    }
    return NextResponse.json({ success: true, batch });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
