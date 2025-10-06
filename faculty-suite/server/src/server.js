import 'dotenv/config';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import { connectDB } from './config/db.js';
import { buildApp } from './app.js';
import { initSockets } from './sockets/index.js';

await connectDB(process.env.MONGO_URI);

const app = buildApp();
const httpServer = http.createServer(app);
const io = new IOServer(httpServer, { cors: { origin: process.env.CLIENT_ORIGIN } });
app.set('io', io);
initSockets(io);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`Faculty API http://localhost:${PORT}`));
