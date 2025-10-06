import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import Faculty from '../models/Faculty.js';

const router = express.Router();

// GET /api/faculty/me -> current faculty profile
router.get('/me', requireAuth, async (req, res) => {
  const fac = await Faculty.findOne({ email: req.user.email }).lean();
  res.json({ faculty: fac || { email: req.user.email, name: req.user.name } });
});

export default router;
