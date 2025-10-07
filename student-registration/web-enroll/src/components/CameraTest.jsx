import React, { useState } from 'react';
import CameraCapture from './CameraCapture';

export default function CameraTest() {
  const [capturedImages, setCapturedImages] = useState([]);
  const [manyImages, setManyImages] = useState([]);

  const handleCapture = (blob) => {
    setCapturedImages(prev => [...prev, blob]);
  };

  const handleManyCapture = (blobs) => {
    setManyImages(blobs);
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h1>Camera Test Page</h1>
      <p>This page is for testing camera functionality on mobile devices.</p>
      <CameraCapture onCapture={handleCapture} onManyCapture={handleManyCapture} />

      {capturedImages.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h2>Captured Images ({capturedImages.length})</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {capturedImages.map((blob, i) => (
              <img key={i} src={URL.createObjectURL(blob)} alt={`Capture ${i+1}`} style={{ width: 100, height: 100, objectFit: 'cover' }} />
            ))}
          </div>
        </div>
      )}

      {manyImages.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h2>360 Captured Images ({manyImages.length})</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {manyImages.map((blob, i) => (
              <img key={i} src={URL.createObjectURL(blob)} alt={`360 Capture ${i+1}`} style={{ width: 100, height: 100, objectFit: 'cover' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
