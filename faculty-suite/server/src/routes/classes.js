import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import ClassModel from '../models/Class.js';

const router = express.Router();
router.get('/', requireAuth, async (_req, res) => {
  const classes = await ClassModel.find().sort({ name: 1 }).lean();
  res.json({ classes });
});
export default router;
