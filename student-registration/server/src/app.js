// src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import classesRouter from './routes/classes.js';
import studentsRouter from './routes/students.js'; // keep import; mount in server.js

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Mount what does not need upload/bucket
app.use('/api/classes', classesRouter);
export default app;
