import React, { useEffect, useMemo, useState } from 'react';
import { createClass, enrollStudent, listClasses, listStudents, imageUrl } from '../api';
import CameraCapture from './CameraCapture';
import { useFaceApi } from '../hooks/useFaceApi';

export default function EnrollForm() {
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState('');
  const [newClass, setNewClass] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [files, setFiles] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // object URLs
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [enrolledStudent, setEnrolledStudent] = useState(null);
  const { ready, descriptorFromBlob } = useFaceApi('/models'); // offline models

  // Track which files are 360 images
  const [is360Flags, setIs360Flags] = useState([]); // boolean[]

  const canSubmit = useMemo(() =>
    (className || newClass) && rollNo && name && (files.length > 0), [className, newClass, rollNo, name, files]);

  const load = async () => {
    const arr = await listClasses();
    setClasses(arr);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    previews.forEach(url => URL.revokeObjectURL(url));
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(urls);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.length]);

  const onFilePick = (e) => {
    const arr = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...arr]);
    setIs360Flags(prev => [...prev, ...arr.map(() => false)]);
  };

  const onCapture = (blob) => {
    const f = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
    setFiles(prev => [...prev, f]);
    setIs360Flags(prev => [...prev, false]);
  };

  const onManyCapture = (blobs) => {
    const filesFromBlobs = blobs.map((blob, idx) => new File([blob], `360_${Date.now()}_${idx}.jpg`, { type: 'image/jpeg' }));
    setFiles(prev => [...prev, ...filesFromBlobs]);
    setIs360Flags(prev => [...prev, ...filesFromBlobs.map(() => true)]);
  };

  const submit = async () => {
    try {
      setLoading(true);

      // derive class
      let finalClass = className;
      if (!finalClass && newClass) {
        const created = await createClass(newClass.trim());
        finalClass = created.name;
        await load();
        setClassName(created.name);
        setNewClass('');
      }

      // compute embeddings (best-effort; skip if models not ready)
      let embeddings = [];
      if (ready) {
        for (const f of files) {
          try {
            const vec = await descriptorFromBlob(f);
            if (vec && vec.length) embeddings.push(vec);
          } catch (_) {}
        }
      }

      const fd = new FormData();
      fd.append('className', finalClass);
      fd.append('rollNo', rollNo);
      fd.append('name', name);
      if (embeddings.length) fd.append('embeddings', JSON.stringify(embeddings));
      fd.append('is360Flags', JSON.stringify(is360Flags));
      files.forEach(f => fd.append('images', f));

      const saved = await enrollStudent(fd);

      // refresh roster
      const roster = await listStudents(finalClass);
      setStudents(roster);

      // reset inputs but keep class selection
      setRollNo(''); setName(''); setFiles([]); setPreviews([]); setIs360Flags([]);
      setEnrolledStudent(saved);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || 'Failed to enroll');
    } finally {
      setLoading(false);
    }
  };

  const onClassChange = async (value) => {
    setClassName(value);
    if (value) {
      const roster = await listStudents(value);
      setStudents(roster);
    } else {
      setStudents([]);
    }
  };

  return (
    <div className="container">
      <h1>HITAM</h1>
      <div className="background-circle circle1"></div>
      <div className="background-circle circle2"></div>
      <div className="background-circle circle3"></div>
      <section>
        <h2>📚 Class Information</h2>
        <div className="row">
          <div className="field">
            <label>Choose Class</label>
            <select value={className} onChange={(e) => onClassChange(e.target.value)}>
              <option value="">— Select —</option>
              {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
            <span className="note">or create a new class:</span>
            <div className="row">
              <input placeholder="New class name" color='white' value={newClass} onChange={e => setNewClass(e.target.value)}/>
              <button onClick={async () => {
                if (!newClass.trim()) return;
                const created = await createClass(newClass.trim());
                await load();
                setClassName(created.name);
                setNewClass('');
              }}>Add Class</button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>👤 Student Details</h2>
        <div className="row">
          <div className="field">
            <label>Roll No</label>
            <input value={rollNo} onChange={e => setRollNo(e.target.value)} placeholder="e.g., 21CS045" />
          </div>
          <div className="field">
            <label>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Student name" />
          </div>
        </div>
      </section>

      <section>
        <h2>📸 Facial Recognition Photos</h2>
        <div className="row">
          <div className="field">
            <label>Upload Multiple Images</label>
            <input type="file" accept="image/*" multiple onChange={onFilePick} />
            <div className="grid" style={{ marginTop: 8 }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img className="thumb" src={src} alt={`p${i}`} />
                  <button
                    onClick={() => {
                      URL.revokeObjectURL(previews[i]);
                      setFiles(prev => prev.filter((_, idx) => idx !== i));
                      setIs360Flags(prev => prev.filter((_, idx) => idx !== i));
                      setPreviews(prev => prev.filter((_, idx) => idx !== i));
                    }}
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      background: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      border: '1px solid white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="actions">
              <button onClick={() => setFiles([])}>Clear</button>
            </div>
          </div>
        </div>

        <h3>Camera Capture</h3>
        <CameraCapture onCapture={onCapture} onManyCapture={onManyCapture} />
      </section>

      <div className="actions">
        <button disabled={!canSubmit || loading} onClick={submit}>
          {loading ? '🔄 Processing...' : '💾 Save Student'}
        </button>
      </div>

      <hr style={{ margin: '32px 0', borderColor: '#a3d9a5' }} />

      <section>
        <h2>Class Roster {className ? <span className="badge">{className}</span> : null}</h2>
        {!className && <p className="note">Select a class to view enrolled students.</p>}
        {className && (
          <div className="grid">
            {students.map(s => (
              <div key={s._id} style={{ border:'1px solid #a3d9a5', padding:16, borderRadius:12, background: '#fffaf6' }}>
                <div style={{ fontWeight: 600, fontSize: '18px', color: '#3a6b35' }}>{s.rollNo} — {s.name}</div>
                <div className="note">{new Date(s.createdAt).toLocaleString()}</div>
                <div className="grid" style={{ marginTop: 12 }}>
                  {(s.imageFileIds || []).slice(0,3).map((id, idx) => (
                    <img className="thumb" key={idx} src={imageUrl(id)} alt="face" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showSuccessModal && enrolledStudent && (
        <div className="success-modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-content">
              <div className="success-emoji">🎉👾✨</div>
              <h2>Enrollment Successful!</h2>
              <p>Student <strong>{enrolledStudent.name}</strong> ({enrolledStudent.rollNo}) has been enrolled.</p>
              <button className="close-modal-btn" onClick={() => setShowSuccessModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
