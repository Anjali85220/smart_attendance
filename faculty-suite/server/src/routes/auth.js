import express from 'express';
import jwt from 'jsonwebtoken';
import Faculty from '../models/Faculty.js';

const router = express.Router();

// POST /api/auth/signup  { email, name }
router.post('/signup', async (req, res) => {
  const { email, name } = req.body;
  if (!email?.endsWith(`@${process.env.HITAM_DOMAIN}`))
    return res.status(400).json({ error: 'Use your hitam.org email' });

  const f = await Faculty.findOneAndUpdate(
    { email }, { $setOnInsert: { email, name: name || email.split('@')[0] } }, { upsert: true, new: true }
  );
  const token = jwt.sign({ sub: f._id, email: f.email, name: f.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, faculty: { email: f.email, name: f.name } });
});

// POST /api/auth/login { email }
router.post('/login', async (req, res) => {
  const { email } = req.body;
  if (!email?.endsWith(`@${process.env.HITAM_DOMAIN}`))
    return res.status(400).json({ error: 'Use your hitam.org email' });
  const f = await Faculty.findOne({ email });
  if (!f) return res.status(404).json({ error: 'Not registered. Please signup.' });
  const token = jwt.sign({ sub: f._id, email: f.email, name: f.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, faculty: { email: f.email, name: f.name } });
});

export default router;
