import mongoose from 'mongoose';

const EmbeddingSchema = new mongoose.Schema({
  vector: { type: [Number], default: [] } // length 128 (face-api) Float32 -> store as Number[]
}, { _id: false });

const StudentSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
  className: { type: String, required: true, index: true },
  rollNo: { type: String, required: true },
  name: { type: String, required: true },
  imageFileIds: [{ type: mongoose.Schema.Types.ObjectId }], // GridFS file ids
  embeddings: [EmbeddingSchema]
}, { timestamps: true });

StudentSchema.index({ classId: 1, rollNo: 1 }, { unique: true });

export default mongoose.model('Student', StudentSchema);
