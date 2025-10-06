import mongoose from 'mongoose';
const Emb = new mongoose.Schema({ v: [Number] }, { _id: false });
const schema = new mongoose.Schema({
  name: String,
  rollNo: String,
  className: String,
  imageFileIds: [String],       // created by student app if used
  embeddings: [Emb]
}, { timestamps: true });
export default mongoose.model('Student', schema, 'students');
