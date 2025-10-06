import React, { useState } from 'react';
import { auth } from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store';

export default function Signup(){
  const [email,setEmail]=useState(''); const [name,setName]=useState('');
  const nav = useNavigate(); const { login } = useAuth();
  const submit = async ()=>{
    const r = await auth.signup(email, name);
    login(r); nav('/dashboard');
  };
  return (
    <div style={{padding:24}}>
      <h2>Faculty Signup (hitam.org)</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
      <button onClick={submit}>Sign Up</button>
    </div>
  );
}
