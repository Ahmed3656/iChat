const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { connect } = require('mongoose');
const { Server } = require('socket.io');
const fileUpload = require('express-fileupload');
require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  }
});

const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

app.use(fileUpload());

app.use('/uploads', express.static('uploads'));

app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

// Socket.io connection
io.on('connection', (socket) => {
  socket.on('setup', (userData) => {
    socket.join(userData._id);
    socket.emit('connected');
  });

  socket.on('join chat', (room) => {
    socket.join(room);
    console.log('user joined room: ' + room)
  });

  socket.on('new message', (recievedMessage) => {
    var chat = recievedMessage.chat;

    if(!chat.users) return console.log('chat.users not defined');

    chat.users.forEach(user => {
      if(user._id == recievedMessage.sender._id) return;

      socket.in(user._id).emit('message recieved', recievedMessage);
    })
  })

  socket.on('typing', (room) => socket.in(room).emit('typing'));

  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const { notFound, errorMiddleware } = require('./middleware/errorMiddleware');
app.use(notFound);
app.use(errorMiddleware);

connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch(error => console.error('MongoDB connection error:', error));
