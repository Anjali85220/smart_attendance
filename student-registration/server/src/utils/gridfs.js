// src/utils/gridfs.js
import multer from 'multer';
import mongoose from 'mongoose';
import { Readable } from 'stream';

export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 25 } // 10MB/file, up to 25 files
});

export const getGridFSBucket = (conn) =>
  new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'studentImages' });

export const uploadBufferToGridFS = (bucket, buffer, filename, mimetype = 'image/jpeg') =>
  new Promise((resolve, reject) => {
    const readable = Readable.from(buffer);
    const upload = bucket.openUploadStream(filename, { contentType: mimetype });
    readable
      .pipe(upload)
      .on('error', reject)
      .on('finish', () => resolve(upload.id)); // ObjectId
  });
