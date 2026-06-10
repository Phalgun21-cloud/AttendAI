import { NextResponse } from 'next/server';
import dbConnect, { isMockDb } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Batch } from '@/lib/models/Batch';
import { Student } from '@/lib/models/Student';
import { Attendance } from '@/lib/models/Attendance';
import { Call } from '@/lib/models/Call';
import { seedMockDb } from '@/lib/mockDb';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await dbConnect();

    if (isMockDb()) {
      seedMockDb();
      return NextResponse.json({
        success: true,
        message: 'In-memory mock database re-seeded successfully!',
        users: {
          superadmin: 'superadmin@attendai.com (pw: password123)'
        }
      });
    }

    // Clean collection
    await User.deleteMany({});
    await Batch.deleteMany({});
    await Student.deleteMany({});
    await Attendance.deleteMany({});
    await Call.deleteMany({});

    // Hash password
    const hashedPassword = bcrypt.hashSync('password123', 10);

    // Create users
    const superAdmin = await User.create({
      name: 'Phalgun (Super Admin)',
      email: 'superadmin@attendai.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    });

    // Create Batches
    const batch1 = await Batch.create({
      name: 'IIT-JEE Master Batch A',
      course: 'IIT-JEE Prep',
      timeSlot: '08:00 AM - 11:00 AM',
    });

    const batch2 = await Batch.create({
      name: 'NEET Achievers Batch B',
      course: 'NEET Prep',
      timeSlot: '11:30 AM - 02:30 PM',
    });

    const batch3 = await Batch.create({
      name: 'Foundation Tenth Grade C',
      course: 'Class 10 Board',
      timeSlot: '04:00 PM - 06:00 PM',
    });

    // Create Students
    const studentsData = [
      { studentId: 'STD001', name: 'Aman Gupta', parentName: 'Ramesh Gupta', parentPhone: '+919876543210', batchId: batch1._id, course: 'IIT-JEE Prep', qrCodeData: 'QR-STD001' },
      { studentId: 'STD002', name: 'Sneha Sharma', parentName: 'Sunita Sharma', parentPhone: '+919876543211', batchId: batch1._id, course: 'IIT-JEE Prep', qrCodeData: 'QR-STD002' },
      { studentId: 'STD003', name: 'Rohit Kumar', parentName: 'Vijay Kumar', parentPhone: '+919876543212', batchId: batch2._id, course: 'NEET Prep', qrCodeData: 'QR-STD003' },
      { studentId: 'STD004', name: 'Priya Patel', parentName: 'Dinesh Patel', parentPhone: '+919876543213', batchId: batch2._id, course: 'NEET Prep', qrCodeData: 'QR-STD004' },
      { studentId: 'STD005', name: 'Aditya Singh', parentName: 'Karan Singh', parentPhone: '+919876543214', batchId: batch3._id, course: 'Class 10 Board', qrCodeData: 'QR-STD005' },
      { studentId: 'STD006', name: 'Ishita Sen', parentName: 'Anil Sen', parentPhone: '+919876543215', batchId: batch3._id, course: 'Class 10 Board', qrCodeData: 'QR-STD006' },
    ];

    const seededStudents = await Student.insertMany(studentsData);

    // Create historical attendance for last 7 days
    const today = new Date();
    const attendanceLogs = [];
    const callLogs = [];

    // Seed past attendance logs
    for (let i = 7; i > 0; i--) {
      const logDate = new Date();
      logDate.setDate(today.getDate() - i);
      // Skip weekends
      if (logDate.getDay() === 0 || logDate.getDay() === 6) continue;

      for (const student of seededStudents) {
        const rand = Math.random();
        let status = 'PRESENT';
        let source = 'QR';

        if (rand < 0.15) {
          status = 'ABSENT';
        } else if (rand < 0.25) {
          status = 'LATE';
          source = 'MANUAL';
        }

        const scanTime = new Date(logDate);
        scanTime.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0);

        attendanceLogs.push({
          studentId: student._id,
          timestamp: scanTime,
          status,
          source
        });

        // If absent, create call log
        if (status === 'ABSENT' && Math.random() < 0.8) {
          const callTime = new Date(scanTime);
          callTime.setHours(callTime.getHours() + 1);

          callLogs.push({
            studentId: student._id,
            parentPhone: student.parentPhone,
            timestamp: callTime,
            status: 'COMPLETED',
            transcript: [
              { speaker: 'AI', text: `Hello, this is AttendAI calling from the Coaching Institute. We noticed that ${student.name} is absent from class today.` },
              { speaker: 'Parent', text: `Yes, thank you for letting me know. They are not feeling well today.` },
              { speaker: 'AI', text: `Understood, we hope they recover quickly. The class recordings and notes will be shared. Thank you.` }
            ],
            summary: `Automated call to verify absence. Parent confirmed student is unwell.`,
            outcome: `Parent notified (Student unwell)`
          });
        }
      }
    }

    // Seed some today's attendance logs
    const todayDatePresent1 = new Date();
    todayDatePresent1.setHours(8, 15, 0);
    attendanceLogs.push({
      studentId: seededStudents[0]._id, // Aman
      timestamp: todayDatePresent1,
      status: 'PRESENT',
      source: 'QR'
    });

    const todayDatePresent2 = new Date();
    todayDatePresent2.setHours(8, 30, 0);
    attendanceLogs.push({
      studentId: seededStudents[2]._id, // Rohit
      timestamp: todayDatePresent2,
      status: 'PRESENT',
      source: 'RFID'
    });

    const todayDatePresent3 = new Date();
    todayDatePresent3.setHours(8, 45, 0);
    attendanceLogs.push({
      studentId: seededStudents[4]._id, // Aditya
      timestamp: todayDatePresent3,
      status: 'PRESENT',
      source: 'MANUAL'
    });

    await Attendance.insertMany(attendanceLogs);
    await Call.insertMany(callLogs);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with Users, Batches, Students, Attendance, and Call records!',
      users: {
        superadmin: 'superadmin@attendai.com (pw: password123)'
      },
      studentsCount: seededStudents.length,
      attendanceRecords: attendanceLogs.length,
      callRecords: callLogs.length
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
