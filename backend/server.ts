import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Message } from './types';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Next.js frontend currently runs here
    methods: ["GET", "POST"]
  }
});

// Store messages in memory (replace with database later)
const messages: Message[] = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send existing messages to newly connected users
  socket.emit('previous-messages', messages);

  // Handle new messages
  socket.on('send-message', (message: Message) => {
    messages.push(message);
    // Broadcast to all clients
    io.emit('new-message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});