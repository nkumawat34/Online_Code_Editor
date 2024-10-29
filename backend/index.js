const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Message = require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// MongoDB connection
const mongoURI = 'mongodb+srv://nkumawat34:nkumawat34@cluster0.6msxxm4.mongodb.net/online_code_editor';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Array to hold the connected users
let connectedUsers = [];

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle user joining
  socket.on('userJoin', (userName) => {
    const user = { id: socket.id, name: userName };
    connectedUsers.push(user);
    io.emit('updateUserList', connectedUsers);
  });

  // Broadcast code changes to all clients except the sender
  socket.on('codeChange', (data) => {
    socket.broadcast.emit('codeChange', data);
  });

  // Broadcast chat messages to all clients
  socket.on('chatMessage', (data) => {
    io.emit('chatMessage', data);
  });

    // Listen for chat reset
    socket.on('resetChat', async () => {
      await Message.deleteMany({}); // Delete all messages from MongoDB
      io.emit('chatReset'); // Notify all clients to reset their chat
    });
    
  // Handle user disconnecting
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    connectedUsers = connectedUsers.filter(user => user.id !== socket.id);
    io.emit('updateUserList', connectedUsers);
  });
});

// Route to get all messages
app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Route to save a message
app.post('/messages', async (req, res) => {
  const { user, text } = req.body;
  const newMessage = new Message({ user, text });
  try {
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error saving message' });
  }
});


app.delete('/messages', async (req, res) => {
  try {
    await Message.deleteMany({});
    res.status(200).json({ message: 'Chat reset successful' });
  } catch (error) {
    res.status(500).json({ error: 'Error resetting chat' });
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
