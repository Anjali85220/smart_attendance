const API = 'http://localhost:4000';

export const setToken = (t)=>localStorage.setItem('token', t);
export const getToken = ()=>localStorage.getItem('token');

async function send(path, method='GET', body){
  const headers = { 'Content-Type':'application/json' };
  const t = getToken(); if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const auth = {
  signup: (email, name)=>send('/api/auth/signup','POST',{email,name}),
  login:  (email)=>send('/api/auth/login','POST',{email})
};

export const classesApi = { list: ()=>send('/api/classes') };
export const studentsApi = { list: (className)=>send(`/api/students?className=${encodeURIComponent(className)}`) };
export const captureApi = {
  newSession: ()=>send('/api/capture/session','POST',{}),
};
export const attendanceApi = {
  detect: (payload)=>send('/api/attendance/detect','POST',payload),
  finalize: (payload)=>send('/api/attendance/finalize','POST',payload),
};
export const imageUrl = (name)=> `${API}/api/images/${encodeURIComponent(name)}`;
