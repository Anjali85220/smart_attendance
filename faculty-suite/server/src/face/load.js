import * as faceapi from '@vladmandic/face-api';
import * as tf from '@tensorflow/tfjs';
// If you want WASM instead of CPU, uncomment:
// import '@tensorflow/tfjs-backend-wasm';
import { Canvas, Image, ImageData, createCanvas, loadImage } from 'canvas';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export async function initFace() {
  // patch DOM for node
  faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

  // pick backend
  // For CPU:
  await tf.setBackend('cpu');
  // For WASM (if installed):
  // await tf.setBackend('wasm');
  await tf.ready();

  const models = path.join(__dirname, 'models');
  await faceapi.nets.tinyFaceDetector.loadFromDisk(models);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(models);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(models);

  return { createCanvas, loadImage };
}

export { createCanvas, loadImage }; // handy re-export if you need it
