import axios from 'axios';

// Adjust if server runs elsewhere
export const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  timeout: 30000
});

export const listClasses = () => api.get('/classes').then(r => r.data);
export const createClass = (name) => api.post('/classes', { name }).then(r => r.data);

export const enrollStudent = (formData) =>
  api.post('/students', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
     .then(r => r.data);

export const listStudents = (className) =>
  api.get('/students', { params: { className } }).then(r => r.data);

export const imageUrl = (id) => `http://localhost:4000/api/images/${id}`;
