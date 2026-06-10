import mongoose, { Schema } from 'mongoose';

const AttendanceSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  timestamp: { type: Date, required: true, default: Date.now, index: true },
  status: { type: String, enum: ['PRESENT', 'LATE', 'ABSENT'], default: 'PRESENT' },
  source: { type: String, enum: ['QR', 'RFID', 'BIOMETRIC', 'FACE', 'MANUAL'], default: 'MANUAL' }
}, { timestamps: true });

// Composite index for daily lookups
AttendanceSchema.index({ studentId: 1, timestamp: 1 });

export const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
