import { sessions } from '../routes/capture.js';
export function initSockets(io){
  io.on('connection', (sock) => {
    sock.on('join-session', (id) => {
      if (!sessions.has(id)) return sock.emit('error', 'invalid session');
      sock.join(id); sock.emit('joined', { id });
    });
  });
}
