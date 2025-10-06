import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  email: { type: String, unique: true, index: true },
  name: String
}, { timestamps: true });
export default mongoose.model('Faculty', schema);
