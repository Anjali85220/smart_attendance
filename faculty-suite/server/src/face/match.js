import * as faceapi from '@vladmandic/face-api';

// cosine similarity: higher is closer (1 == identical)
export function cosineSimilarity(a, b){
  let dot = 0, an=0, bn=0;
  for (let i=0;i<a.length;i++){ dot += a[i]*b[i]; an += a[i]*a[i]; bn += b[i]*b[i]; }
  return dot / (Math.sqrt(an) * Math.sqrt(bn));
}

export function bestMatch(faceDesc, studentVectors){
  let best = { score: -1, idx: -1 };
  for (let i=0;i<studentVectors.length;i++){
    const s = cosineSimilarity(faceDesc, studentVectors[i].v || studentVectors[i]);
    if (s > best.score) best = { score: s, idx: i };
  }
  return best; // score ~ 0.6 .. 0.9 when good; tune threshold
}

export async function detectEmbeddings(canvas){
  // detect multiple faces & compute 128-d embeddings
  const detections = await faceapi.detectAllFaces(
    canvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 })
  ).withFaceLandmarks().withFaceDescriptors();
  return detections; // array of { detection, descriptor }
}
