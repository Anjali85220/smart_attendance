import axios from 'axios';

// Use backend URL from .env
const API_BASE = import.meta.env.VITE_BACKEND_URL;

export const api = axios.create({
  baseURL: `${API_BASE}/api`, // base is /api
  timeout: 30000
});

// Classes
export const listClasses = () => api.get('/students/classes').then(r => r.data);
export const createClass = (name) => api.post('/students/classes', { name }).then(r => r.data);

// Students
export const enrollStudent = (formData) =>
  api.post('/students', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
     .then(r => r.data);

export const listStudents = (className) =>
  api.get('/students', { params: { className } }).then(r => r.data);

// Image URLs
export const imageUrl = (id) => `${API_BASE}/api/images/${id}`;
