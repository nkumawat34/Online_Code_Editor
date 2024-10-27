// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('A user connected');

  // Broadcast code changes to all clients except the sender
  socket.on('codeChange', (data) => {
    socket.broadcast.emit('codeChange', data);
  });

  // Broadcast chat messages to all clients, including the sender
  socket.on('chatMessage', (data) => {
    io.emit('chatMessage', data); // Use io.emit to send to all clients
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
