import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import Student from '../models/Student.js';

const router = express.Router();
router.get('/', requireAuth, async (req, res) => {
  const { className } = req.query;
  const q = className ? { className } : {};
  const students = await Student.find(q).select('name rollNo className embeddings').lean();
  res.json({ students });
});
export default router;
