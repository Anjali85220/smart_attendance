import express from 'express';
import mongoose from 'mongoose';
import createError from 'http-errors';
import { getGridFSBucket } from '../utils/gridfs.js';

const router = express.Router();

export default (conn) => {
  router.get('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) throw createError(400, 'Bad image id');

      const bucket = getGridFSBucket(conn);
      const dl = bucket.openDownloadStream(new mongoose.Types.ObjectId(id));

      res.set('Content-Type', 'image/jpeg'); // best-effort
      dl.on('file', f => {
        if (f.contentType) res.set('Content-Type', f.contentType);
      });
      dl.on('error', next);
      dl.pipe(res);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
