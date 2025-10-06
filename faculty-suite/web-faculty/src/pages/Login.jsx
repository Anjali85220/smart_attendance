import React, { useState } from 'react';
import { auth } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store';

export default function Login(){
  const [email,setEmail]=useState('');
  const nav = useNavigate(); const { login } = useAuth();
  const submit = async ()=>{
    const r = await auth.login(email);
    login(r); nav('/dashboard');
  };
  return (
    <div style={{padding:24}}>
      <h2>Faculty Login (hitam.org)</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <button onClick={submit}>Login</button>
      <div style={{marginTop:8}}><Link to="/signup">Need an account?</Link></div>
    </div>
  );
}
