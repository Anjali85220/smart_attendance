import mongoose from 'mongoose';
const schema = new mongoose.Schema({ name: { type: String, unique: true } }, { timestamps: true });
export default mongoose.model('Class', schema, 'classes');
