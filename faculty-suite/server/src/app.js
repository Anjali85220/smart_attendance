import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import auth from './routes/auth.js';
import faculty from './routes/faculty.js';
import classes from './routes/classes.js';
import students from './routes/students.js';
import images from './routes/images.js';
import capture from './routes/capture.js';
import attendance from './routes/attendance.js';

export function buildApp(){
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '20mb' }));
  app.use(cookieParser());

  app.use('/api/auth', auth);
  app.use('/api/faculty', faculty);       // <-- this needs the file above
  app.use('/api/classes', classes);
  app.use('/api/students', students);
  app.use('/api/images', images);
  app.use('/api/capture', capture);
  app.use('/api/attendance', attendance);

  app.get('/health', (_req, res) => res.json({ ok: true }));
  return app;
}
