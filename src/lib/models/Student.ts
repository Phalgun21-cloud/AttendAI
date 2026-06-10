import mongoose, { Schema } from 'mongoose';

const StudentSchema = new Schema({
  studentId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  photoUrl: { type: String, default: '' },
  parentName: { type: String, required: true },
  parentPhone: { type: String, required: true },
  batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
  course: { type: String, required: true },
  qrCodeData: { type: String, required: true, unique: true }
}, { timestamps: true });

export const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
