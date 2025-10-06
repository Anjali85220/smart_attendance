import express from 'express';
import { getBucket } from '../config/db.js';

const router = express.Router();
router.get('/:name', async (req, res) => {
  const stream = getBucket().openDownloadStreamByName(req.params.name);
  stream.on('error', () => res.sendStatus(404));
  stream.pipe(res);
});
export default router;
