import React, { useEffect, useRef, useState } from 'react';

export default function CameraCapture({ onCapture, onManyCapture }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [active, setActive] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [stream]);

  const start = async () => {
    const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    setStream(s);
    setActive(true);
    if (videoRef.current) videoRef.current.srcObject = s;
  };

  const stop = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setActive(false);
    setCountdown(0);
  };

  const snapOne = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth; canvas.height = v.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(v, 0, 0);
    canvas.toBlob((b) => onCapture && onCapture(b), 'image/jpeg', 0.9);
  };

  const start360 = async (shots = 8, intervalMs = 700) => {
    let taken = 0;
    setCountdown(shots);
    const blobs = [];
    const id = setInterval(() => {
      if (taken >= shots) { clearInterval(id); setCountdown(0); onManyCapture && onManyCapture(blobs); return; }
      if (!videoRef.current) return;
      const v = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = v.videoWidth; canvas.height = v.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(v, 0, 0);
      canvas.toBlob((b) => {
        blobs.push(b);
      }, 'image/jpeg', 0.9);
      taken += 1;
      setCountdown(shots - taken);
    }, intervalMs);
  };

  return (
    <div style={{ border:'1px solid #e5e7eb', padding:12, borderRadius:8 }}>
      <div className="actions">
        {!active ? <button onClick={start}>Open Camera</button> : <button onClick={stop}>Close Camera</button>}
        <button onClick={snapOne} disabled={!active}>Capture</button>
        <button onClick={() => start360(10, 600)} disabled={!active}>360 Capture (10)</button>
        {countdown>0 && <span className="badge">{countdown} left</span>}
      </div>
      <div style={{ marginTop: 10 }}>
        <video ref={videoRef} autoPlay playsInline style={{ width:'100%', borderRadius:8 }} />
      </div>
      <p className="note">Tip: For 360 capture, slowly turn your head left/right and tilt a bit for better angles.</p>
    </div>
  );
}
