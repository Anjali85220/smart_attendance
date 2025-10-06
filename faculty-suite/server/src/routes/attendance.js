import express from 'express';
import { requireAuth } from '../middlewares/auth.js';
import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';
import { getBucket } from '../config/db.js';

const router = express.Router();

// Browser uploads annotated proof as data URL (JPEG/PNG)
router.post('/upload-annotated', requireAuth, async (req, res) => {
  const { sessionId, dataUrl } = req.body;
  if (!sessionId || !dataUrl) return res.status(400).json({ error: 'sessionId and dataUrl required' });

  const m = dataUrl.match(/^data:(image\/(?:png|jpeg));base64,(.+)$/i);
  if (!m) return res.status(400).json({ error: 'invalid image dataUrl' });
  const [, mime, b64] = m;
  const buf = Buffer.from(b64, 'base64');

  const fname = `annotated_${sessionId}_${Date.now()}.${mime.includes('png') ? 'png' : 'jpg'}`;
  await new Promise((resolve, reject) => {
    const up = getBucket().openUploadStream(fname, { contentType: mime });
    up.end(buf, (err) => (err ? reject(err) : resolve()));
  });

  res.json({ ok: true, file: fname });
});

router.post('/finalize', requireAuth, async (req, res) => {
  const { className, sessionId, marks, images } = req.body;
  if (!className || !sessionId || !Array.isArray(marks)) {
    return res.status(400).json({ error: 'className, sessionId, marks required' });
  }

  const doc = await Attendance.create({
    className,
    sessionId,
    facultyEmail: req.user.email,
    marks: marks.map((m) => ({
      studentId: new mongoose.Types.ObjectId(m.studentId),
      rollNo: m.rollNo,
      present: !!m.present,
      matchScore: typeof m.matchScore === 'number' ? m.matchScore : 0,
    })),
    images: [
      ...(images?.raw || []).map((n) => ({ fileId: n, type: 'raw' })),
      ...(images?.annotated || []).map((n) => ({ fileId: n, type: 'annotated' })),
    ],
  });

  res.json({ success: true, id: doc._id });
});

export default router;
