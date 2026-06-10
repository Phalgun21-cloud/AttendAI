import mongoose, { Schema } from 'mongoose';

const BatchSchema = new Schema({
  name: { type: String, required: true, unique: true },
  course: { type: String, required: true },
  timeSlot: { type: String, required: true } // e.g. "09:00 AM - 11:00 AM"
}, { timestamps: true });

export const Batch = mongoose.models.Batch || mongoose.model('Batch', BatchSchema);
