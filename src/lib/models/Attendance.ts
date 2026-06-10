import mongoose, { Schema } from 'mongoose';

const AttendanceSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  date: { type: Date, required: true, index: true }, // Midnight date for grouping
  timestamp: { type: Date, required: true, default: Date.now, index: true }, // Last interaction time
  inTime: { type: Date },
  outTime: { type: Date },
  status: { type: String, enum: ['PRESENT', 'LATE', 'ABSENT', 'PARTIAL'], default: 'PRESENT' },
  source: { type: String, enum: ['QR', 'RFID', 'BIOMETRIC', 'FACE', 'MANUAL'], default: 'MANUAL' }
}, { timestamps: true });

// Composite index for daily lookups
AttendanceSchema.index({ studentId: 1, date: 1 });

export const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
