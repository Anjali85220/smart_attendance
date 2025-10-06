import React from 'react';
import { useAuth } from '../store';
import { Link } from 'react-router-dom';

export default function SideNav(){
  const { user, logout } = useAuth();
  return (
    <aside style={{width:240, padding:16, borderRight:'1px solid #eee', height:'100vh'}}>
      <div style={{fontWeight:700, fontSize:18}}>Faculty</div>
      <div style={{marginTop:8, opacity:0.7}}>{user?.name || ''}</div>
      <div style={{fontSize:12}}>{user?.email || ''}</div>
      <hr style={{margin:'16px 0'}}/>
      <nav style={{display:'grid', gap:8}}>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <hr style={{margin:'16px 0'}}/>
      <button onClick={logout}>Logout</button>
    </aside>
  );
}
