import React, { useEffect, useRef, useState } from 'react';

export default function CameraCapture({ onCapture, onManyCapture }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [active, setActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [facingMode, setFacingMode] = useState('user'); // 'user' for front, 'environment' for back
  const [permissionGranted, setPermissionGranted] = useState(null); // null, true, false

  useEffect(() => {
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [stream]);

  const checkPermissions = async () => {
    if (navigator.permissions) {
      try {
        const result = await navigator.permissions.query({ name: 'camera' });
        setPermissionGranted(result.state === 'granted');
        return result.state === 'granted';
      } catch (err) {
        console.warn('Permissions API not supported');
      }
    }
    return true; // Assume granted if not supported
  };

  const start = async () => {
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      alert('Camera permission is required to use this feature.');
      return;
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
      setStream(s);
      setActive(true);
      setPermissionGranted(true);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      console.error('Error accessing camera:', err);
      setPermissionGranted(false);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stop = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setActive(false);
    setCountdown(0);
  };

  const toggleCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    if (active) {
      stop();
      setTimeout(() => start(), 100); // Small delay to ensure stop completes
    }
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
    const promises = [];
    const id = setInterval(() => {
      if (taken >= shots) {
        clearInterval(id);
        setCountdown(0);
        Promise.all(promises).then(blobs => {
          onManyCapture && onManyCapture(blobs);
        });
        return;
      }
      if (!videoRef.current) return;
      const v = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = v.videoWidth; canvas.height = v.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(v, 0, 0);
      const promise = new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.9);
      });
      promises.push(promise);
      taken += 1;
      setCountdown(shots - taken);
    }, intervalMs);
  };

  return (
    <div style={{ border:'1px solid #e5e7eb', padding:12, borderRadius:8 }}>
      <div className="actions" style={{ flexWrap: 'wrap', gap: '8px' }}>
        {!active ? <button onClick={start} style={{ flex: '1 1 auto', minWidth: '120px' }}>Open Camera</button> : <button onClick={stop} style={{ flex: '1 1 auto', minWidth: '120px' }}>Close Camera</button>}
        <button onClick={toggleCamera} disabled={!active && !permissionGranted} style={{ flex: '1 1 auto', minWidth: '120px' }}>
          {facingMode === 'user' ? 'Switch to Back' : 'Switch to Front'}
        </button>
        <button onClick={snapOne} disabled={!active} style={{ flex: '1 1 auto', minWidth: '120px' }}>Capture</button>
        <button onClick={() => start360(10, 600)} disabled={!active} style={{ flex: '1 1 auto', minWidth: '120px' }}>360 Capture (10)</button>
        {countdown>0 && <span className="badge">{countdown} left</span>}
      </div>
      <div style={{ marginTop: 10 }}>
        <video ref={videoRef} autoPlay playsInline style={{ width:'100%', maxHeight: '300px', borderRadius:8 }} />
      </div>
      <p className="note">Tip: For 360 capture, slowly turn your head left/right and tilt a bit for better angles.</p>
    </div>
  );
}
