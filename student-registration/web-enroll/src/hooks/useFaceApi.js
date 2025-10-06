import * as faceapi from 'face-api.js';
import { useEffect, useState, useCallback } from 'react';

export function useFaceApi(modelsPath = '/models') {
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(modelsPath);
        await faceapi.nets.faceLandmark68Net.loadFromUri(modelsPath);
        await faceapi.nets.faceRecognitionNet.loadFromUri(modelsPath);
        setReady(true);
      } catch (e) {
        console.error(e);
        setErr(e);
      }
    })();
  }, [modelsPath]);

  const descriptorFromCanvas = useCallback(async (canvas) => {
    const det = await faceapi
      .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    return det?.descriptor ? Array.from(det.descriptor) : null;
  }, []);

  const descriptorFromBlob = useCallback(async (blob) => {
    const img = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return descriptorFromCanvas(canvas);
  }, [descriptorFromCanvas]);

  return { ready, err, descriptorFromCanvas, descriptorFromBlob };
}
