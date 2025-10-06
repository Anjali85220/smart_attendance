import React, { useEffect, useState } from 'react';
import SideNav from '../components/SideNav';
import { classesApi } from '../api';
import { Link } from 'react-router-dom';

export default function Dashboard(){
  const [classes,setClasses]=useState([]);
  useEffect(()=>{ (async()=>{ const r = await classesApi.list(); setClasses(r.classes||[]); })(); }, []);
  return (
    <div style={{display:'flex'}}>
      <SideNav/>
      <main style={{padding:16, flex:1}}>
        <h2>Your Classes</h2>
        <ul>
          {classes.map(c => <li key={c._id}><Link to={`/class/${encodeURIComponent(c.name)}`}>{c.name}</Link></li>)}
        </ul>
      </main>
    </div>
  );
}
