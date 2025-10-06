// src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import classesRouter from './routes/classes.js';
import studentsRouter from './routes/students.js'; // keep import; mount in server.js

dotenv.config();

const app = express();

// Proper CORS configuration
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',') // can support multiple origins if comma separated
  : ['https://student-registration-sepia.vercel.app']; // default to allow the deployed frontend

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman or server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error(`CORS policy does not allow access from ${origin}`), false);
    }
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true, // allow cookies/credentials if needed
}));

// Parse incoming requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Mount routes that do not require upload/bucket
app.use('/api/classes', classesRouter);

// Note: studentsRouter with upload/bucket is mounted in server.js
// app.use('/api/students', ...) -> leave in server.js

export default app;
