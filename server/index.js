const express = require('express');
const cors = require('cors');
const {connect}  = require('mongoose');
const upload = require('express-fileupload');
require('dotenv').config();

// Route handlers
const userRoutes = require('./routes/userRoutes');

const port = process.env.PORT || 5000;

const app = express();

// Automatically parse data
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Link the server side with the client side safely
app.use(cors({credentials: true, origin: "http://localhost:3000"}));

app.use(upload());
app.use('/uploads', express.static(__dirname + '/uploads'));

// API routes
app.use('/api/users', userRoutes);

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