import mongoose, { Schema } from 'mongoose';

const CallSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  parentPhone: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  status: { type: String, enum: ['PENDING', 'CALLING', 'ANSWERED', 'NO_ANSWER', 'COMPLETED'], default: 'PENDING' },
  transcript: [{
    speaker: { type: String, enum: ['AI', 'Parent'], required: true },
    text: { type: String, required: true }
  }],
  summary: { type: String, default: '' },
  outcome: { type: String, default: '' }
}, { timestamps: true });

export const Call = mongoose.models.Call || mongoose.model('Call', CallSchema);
