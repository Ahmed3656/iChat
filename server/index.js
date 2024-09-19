const express = require('express');
const cors = require('cors');
const { connect } = require('mongoose');
const multer = require('multer');
const path = require('path');  // Import path for handling file paths

require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();

// Route handlers
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes=require('../server/routes/messageRoutes')
// Automatically parse data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Link the server side with the client side safely
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

// Routes error handlers
const { notFound, errorMiddleware } = require('./middleware/errorMiddleware');
app.use(notFound);
app.use(errorMiddleware);

// Database connection
connect(process.env.MONGO_URI)
  .then(app.listen(port, () => console.log(`Server running on port ${port}`)))
  .catch(error => console.log(error));
