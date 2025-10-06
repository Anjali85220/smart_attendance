import React, { useEffect, useMemo, useRef, useState } from 'react';
import SideNav from '../components/SideNav';
import { useParams } from 'react-router-dom';
import { studentsApi, captureApi, attendanceApi } from '../api';
import { io } from 'socket.io-client';
import QRCode from 'qrcode';
import * as faceapi from 'face-api.js';

export default function ClassPage(){
  const { className } = useParams();
  const [students,setStudents]=useState([]);
  const [marks,setMarks]=useState({}); // id -> boolean
  const [sessionId,setSessionId]=useState('');
  const [qr,setQr]=useState('');
  const [previews,setPreviews]=useState([]);  // base64 frames from server
  const [annotated,setAnnotated]=useState([]); // filenames stored on server
  const [modelsReady,setModelsReady]=useState(false);
  const [threshold,setThreshold]=useState(0.65);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(()=>{ (async()=>{
    const r = await studentsApi.list(className);
    setStudents(r.students||[]);
    setMarks({});
  })(); }, [className]);

  // Load face-api models (browser)
  useEffect(()=>{ (async()=>{
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    setModelsReady(true);
  })(); }, []);

  const rosterWithMark = useMemo(()=> students.map(s => ({...s, present: !!marks[s._id]})), [students, marks]);

  const toggle = (id)=> setMarks(m => ({...m, [id]: !m[id]}));

  const startSession = async ()=>{
    const r = await captureApi.newSession();
    setSessionId(r.sessionId);
    const url = `http://localhost:5174/?session=${r.sessionId}`;
    setQr(await QRCode.toDataURL(url));
    const s = io('http://localhost:4000', { transports:['websocket'] });
    s.emit('join-session', r.sessionId);
    s.on('photo', msg => setPreviews(p => [msg.preview,...p].slice(0,12)));
    socketRef.current = s;
  };

  // cosine similarity helper
  function cosine(a,b){
    let dot=0,na=0,nb=0;
    for(let i=0;i<a.length;i++){ dot+=a[i]*b[i]; na+=a[i]*a[i]; nb+=b[i]*b[i]; }
    return dot/(Math.sqrt(na)*Math.sqrt(nb));
  }

  // Build candidate vectors per student
  const studentVecs = useMemo(()=>{
    return students.map(s => ({
      id: s._id,
      rollNo: s.rollNo,
      embeddings: (s.embeddings || []).map(e => e.v || e) // normalize
    }));
  }, [students]);

  async function detectOnOneBase64(b64){
    if (!modelsReady) return { hits: [], annotatedDataUrl: null };

    // Draw base64 frame into hidden <img> then canvas
    const imgEl = imgRef.current;
    const canvas = canvasRef.current;
    await new Promise(ok=>{
      imgEl.onload = ok;
      imgEl.src = b64;
    });
    canvas.width = imgEl.naturalWidth; canvas.height = imgEl.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgEl, 0, 0);

    // Detect faces + compute descriptors
    const detections = await faceapi.detectAllFaces(
      imgEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 })
    ).withFaceLandmarks().withFaceDescriptors();

    const hits = [];

    // Match each descriptor to best student by cosine similarity
    for (const det of detections){
      const desc = Array.from(det.descriptor);
      let best = { score: -1, id: null, rollNo: null };
      for (const s of studentVecs){
        for (const v of s.embeddings){
          const score = cosine(desc, v);
          if (score > best.score) best = { score, id: s.id, rollNo: s.rollNo };
        }
      }

      const { x, y, width, height } = det.detection.box;
      ctx.strokeStyle = '#00FF00'; ctx.lineWidth = 3; ctx.strokeRect(x, y, width, height);
      const label = best.id && best.score >= threshold
        ? `${best.rollNo} (${best.score.toFixed(2)})`
        : `Unknown (${best.score.toFixed(2)})`;
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x, y-22, 180, 20);
      ctx.fillStyle = '#fff'; ctx.font='14px sans-serif'; ctx.fillText(label, x+4, y-7);

      if (best.id && best.score >= threshold){
        hits.push({ studentId: best.id, rollNo: best.rollNo, score: best.score });
      }
    }

    const annotatedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    return { hits, annotatedDataUrl };
  }

  const detect = async ()=>{
    if (!sessionId) return alert('Start a capture session first');
    if (!previews.length) return alert('Capture at least one photo');

    const annotatedFiles = [];
    const tally = new Map(); // studentId -> max score

    for (const b64 of previews){
      const { hits, annotatedDataUrl } = await detectOnOneBase64(b64);

      // Upload proof image to server
      const uploaded = await attendanceApi.uploadAnnotated({ sessionId, dataUrl: annotatedDataUrl });
      if (uploaded?.file) annotatedFiles.push(uploaded.file);

      // Merge marks (use best score per student)
      for (const h of hits){
        const prev = tally.get(h.studentId) || 0;
        if (h.score > prev) tally.set(h.studentId, h.score);
      }
    }

    // Apply to UI
    const newMarks = {};
    students.forEach(s => {
      const bestScore = tally.get(s._id) || 0;
      newMarks[s._id] = bestScore >= threshold;
    });
    setMarks(m => ({ ...m, ...newMarks }));
    setAnnotated(a => [...annotatedFiles, ...a]);
  };

  const finalize = async ()=>{
    const payload = {
      className,
      sessionId,
      marks: students.map(s => ({
        studentId: s._id,
        rollNo: s.rollNo,
        present: !!marks[s._id],
        matchScore: 0 // optional, you can add from tally if you store it
      })),
      images: { annotated } // raw are already in GridFS by /capture/photo
    };
    const r = await attendanceApi.finalize(payload);
    alert(`Attendance saved: ${r.id}`);
  };

  return (
    <div style={{display:'flex'}}>
      <SideNav/>
      <main style={{padding:16, flex:1, display:'grid', gap:16}}>
        <h2>Class: {className}</h2>

        <div style={{display:'flex', gap:16, alignItems:'center'}}>
          <button onClick={startSession} disabled={!!sessionId}>Start Capture</button>
          {sessionId && <button onClick={detect} disabled={!modelsReady}>Detect Faces & Auto-mark</button>}
          {sessionId && <button onClick={finalize}>Post Attendance</button>}
          <label style={{marginLeft:16}}>Threshold
            <input type="number" min="0.1" max="0.95" step="0.01" value={threshold}
                   onChange={e=>setThreshold(parseFloat(e.target.value)||0.65)}
                   style={{width:80, marginLeft:8}} />
          </label>
          {!modelsReady && <span style={{color:'#b45309'}}>loading face models…</span>}
        </div>

        {sessionId && (
          <div style={{display:'flex', gap:24, alignItems:'flex-start'}}>
            <div>
              <div>Session: <code>{sessionId}</code></div>
              <img src={qr} width="200" />
              <div style={{fontSize:12,opacity:0.7}}>Open on phone: http://localhost:5174/?session={sessionId}</div>
            </div>
            <div style={{flex:1}}>
              <h3>Live Previews</h3>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, 160px)', gap:8}}>
                {previews.map((p,i)=> <img key={i} src={p} style={{width:160,height:120,objectFit:'cover'}} />)}
              </div>
            </div>
          </div>
        )}

        <div>
          <h3>Roster</h3>
          <ul style={{columns:2}}>
            {rosterWithMark.map(s=>(
              <li key={s._id} style={{marginBottom:8, breakInside:'avoid'}}>
                <label>
                  <input type="checkbox" checked={s.present} onChange={()=>toggle(s._id)} />
                  &nbsp; {s.rollNo} — {s.name}
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* hidden elements for canvas processing */}
        <img ref={imgRef} alt="" style={{display:'none'}} />
        <canvas ref={canvasRef} style={{display:'none'}} />
      </main>
    </div>
  );
}
