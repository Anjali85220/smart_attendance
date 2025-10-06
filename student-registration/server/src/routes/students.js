// src/routes/students.js
import express from 'express';
import { z } from 'zod';
import createError from 'http-errors';
import Student from '../models/Student.js';
import ClassModel from '../models/Class.js';
import { uploadBufferToGridFS } from '../utils/gridfs.js';

const router = express.Router();

const enrollSchema = z.object({
  className: z.string().min(1),
  rollNo: z.string().min(1),
  name: z.string().min(1),
  embeddings: z.string().optional(), // JSON stringified [[...], [...]]
  is360Flags: z.string().optional() // JSON stringified boolean[]
});

router.post('/', async (req, res, next) => {
  try {
    const { className, rollNo, name, embeddings, is360Flags } = enrollSchema.parse(req.body);

    // Ensure class exists
    let cls = await ClassModel.findOne({ name: className });
    if (!cls) cls = await ClassModel.create({ name: className });

    // Multer (memory) uploaded files
    // Using uploadMemory.array('images', 12) => req.files is an array
    const files = Array.isArray(req.files) ? req.files : (req.files?.images || []);
    if (!files.length) throw createError(400, 'At least one image is required');

    const bucket = req.app.locals.bucket;
    if (!bucket) throw createError(500, 'Storage bucket not initialized');

    // Parse is360Flags
    let is360FlagsArray = [];
    if (is360Flags) {
      try {
        const parsedFlags = JSON.parse(is360Flags);
        if (Array.isArray(parsedFlags)) {
          is360FlagsArray = parsedFlags;
        }
      } catch (_) {}
    }

    // Validate lengths match
    if (is360FlagsArray.length !== files.length) {
      throw createError(400, `Mismatch: received ${files.length} files but ${is360FlagsArray.length} flags`);
    }

    // Upload each buffer to GridFS or store embeddings for 360 images
    const ts = Date.now();
    const safeClass = className.replace(/\s+/g, '_');
    const imageFileIds = [];
    const embeddingsArray = [];

    // Parse embeddings JSON if present
    let parsedEmbeddings = [];
    if (embeddings) {
      try {
        const parsed = JSON.parse(embeddings);
        if (Array.isArray(parsed)) {
          parsedEmbeddings = parsed;
        }
      } catch (_) {}
    }

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const is360 = is360FlagsArray[i] || false;

      if (is360) {
        // For 360 images, store 120-D embedding vector in GridFS as JSON string
        // Use corresponding embedding vector from parsedEmbeddings if available
        const embeddingVec = parsedEmbeddings[i] || [];
        const embeddingStr = JSON.stringify(embeddingVec);
        const filename = `${safeClass}/${rollNo}_${ts}_embedding_${i}.json`;
        const buffer = Buffer.from(embeddingStr, 'utf-8');
        const id = await uploadBufferToGridFS(bucket, buffer, filename, 'application/json');
        imageFileIds.push(id);
        embeddingsArray.push({ vector: embeddingVec });
      } else {
        // For normal images, upload image buffer to GridFS
        const filename = `${safeClass}/${rollNo}_${ts}_${f.originalname || 'image.jpg'}`;
        const id = await uploadBufferToGridFS(bucket, f.buffer, filename, f.mimetype || 'image/jpeg');
        imageFileIds.push(id);
        // Also add embedding if available
        if (parsedEmbeddings[i]) {
          embeddingsArray.push({ vector: parsedEmbeddings[i] });
        }
      }
    }

    const student = await Student.create({
      classId: cls._id,
      className: cls.name,
      rollNo,
      name,
      imageFileIds,
      embeddings: embeddingsArray
    });

    res.json(student);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { className } = req.query;
    const query = className ? { className } : {};
    const students = await Student.find(query).select('-embeddings').sort({ rollNo: 1, name: 1 });
    res.json(students);
  } catch (err) {
    next(err);
  }
});

router.get('/classes', async (req, res, next) => {
  try {
    const classes = await ClassModel.find({}).sort({ name: 1 });
    res.json(classes);
  } catch (err) {
    next(err);
  }
});

export default router;
