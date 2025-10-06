import mongoose from 'mongoose';

const Mark = new mongoose.Schema({
  studentId: mongoose.Types.ObjectId,
  rollNo: String,
  present: Boolean,
  matchScore: Number
}, { _id: false });

const Img = new mongoose.Schema({
  fileId: String,
  type: { type: String, enum: ['raw', 'annotated'] },
}, { _id: false });

const schema = new mongoose.Schema({
  className: String,
  date: { type: Date, default: Date.now },
  facultyEmail: String,
  sessionId: String,
  marks: [Mark],
  images: [Img]
}, { timestamps: true });

export default mongoose.model('Attendance', schema);
