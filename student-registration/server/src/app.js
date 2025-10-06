// src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import classesRouter from './routes/classes.js';
import studentsRouter from './routes/students.js'; // keep import; mount in server.js

dotenv.config();

const app = express();

// Allow all origins for CORS (update to specific origins in production)
app.use(cors());

// Parse incoming requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Mount routes that do not require upload/bucket
app.use('/api/classes', classesRouter);

// Note: studentsRouter with upload/bucket is mounted in server.js
// app.use('/api/students', ...) -> leave in server.js

export default app;
