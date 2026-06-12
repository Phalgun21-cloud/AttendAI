import mongoose, { Schema } from 'mongoose';

const BatchSchema = new Schema({
  name: { type: String, required: true, unique: true },
  course: { type: String, required: true },
  timeSlot: { type: String, required: true }, // e.g. "09:00 AM - 11:00 AM"
  startTime: { type: String, required: true }, // e.g. "09:00" (24hr format) for automation logic
  lastAbsenteeCheck: { type: Date } // Tracks if automated absentees have been marked today
}, { timestamps: true });

export const Batch = mongoose.models.Batch || mongoose.model('Batch', BatchSchema);
