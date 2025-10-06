import express from 'express';
import multer from 'multer';
import { getBucket } from '../config/db.js';
import { randomUUID } from 'crypto';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
export const sessions = new Map(); // sessionId => { createdAt }

router.post('/session', (req, res) => {
  const id = randomUUID();
  sessions.set(id, { createdAt: Date.now() });
  res.json({ sessionId: id });
});

router.post('/photo', upload.single('file'), (req, res) => {
  const { sessionId } = req.body;
  if (!sessions.has(sessionId)) return res.status(400).json({ error: 'invalid session' });

  const name = `session_${sessionId}_${Date.now()}.jpg`;
  const up = getBucket().openUploadStream(name, { contentType: 'image/jpeg' });
  up.end(req.file.buffer, () => {
    const io = req.app.get('io');
    const preview = `data:image/jpeg;base64,${req.file.buffer.toString('base64')}`;
    io.to(sessionId).emit('photo', { file: name, preview });
    res.json({ ok: true, file: name });
  });
});

export default router;
