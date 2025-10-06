// src/server.js
import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import imagesRouterFactory from './routes/images.js';
import studentsRouter from './routes/students.js';
import { getGridFSBucket, uploadMemory } from './utils/gridfs.js';
import { notFound, errorHandler } from './middlewares/error.js';

dotenv.config();
const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    // connect to MongoDB
    const conn = await connectDB(process.env.MONGO_URI);

    // set up GridFS bucket and expose on app
    const bucket = getGridFSBucket(conn);
    app.locals.bucket = bucket;

    // routes that depend on bucket / upload
    // NOTE: using memory storage; field name must match frontend: 'images'
    app.use('/api/students', uploadMemory.array('images', 25), studentsRouter);
    app.use('/api/images', imagesRouterFactory(conn));

    // 404 + error handlers AFTER all routes
    app.use(notFound);
    app.use(errorHandler);

    app.listen(PORT, () =>
      console.log(`API running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
};

start();
