import express from 'express';
import { z } from 'zod';
import ClassModel from '../models/Class.js';

const router = express.Router();

const createClassSchema = z.object({
  name: z.string().min(1)
});

router.post('/', async (req, res, next) => {
  try {
    const { name } = createClassSchema.parse(req.body);
    const cls = await ClassModel.create({ name: name.trim() });
    res.json(cls);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const classes = await ClassModel.find().sort({ name: 1 });
    res.json(classes);
  } catch (err) {
    next(err);
  }
});

export default router;
