import React, { useEffect, useRef, useState } from 'react';

export default function Camera(){
  const vref = useRef(null);
  const [session,setSession]=useState('');

  useEffect(()=>{ (async()=>{
    const sId = new URLSearchParams(location.search).get('session') || '';
    setSession(sId);
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:'environment' }});
    vref.current.srcObject = stream; vref.current.play();
  })(); }, []);

  const snap = async ()=>{
    if(!session) return alert('Missing session');
    const canvas = document.createElement('canvas');
    canvas.width = 1280; canvas.height = 720;
    canvas.getContext('2d').drawImage(vref.current, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.9));
    const fd = new FormData();
    fd.append('sessionId', session);
    fd.append('file', blob, `photo_${Date.now()}.jpg`);
    await fetch('http://localhost:4000/api/capture/photo', { method:'POST', body: fd });
  };

  return (
    <div style={{padding:16}}>
      <h3>Session: {session}</h3>
      <video ref={vref} style={{width:'100%',maxWidth:560}} playsInline muted />
      <div><button style={{marginTop:12}} onClick={snap}>Capture & Upload</button></div>
    </div>
  );
}
