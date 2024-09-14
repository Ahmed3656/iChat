// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // User model

const registerUser = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const newEmail = email.trim();

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = await User.create({name, email: newEmail, password: hashedPassword});

    
    res.status(200).json("success");
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// controllers/authController.js (continued)
const loginUser = async (req, res) => {
    const { identifier, password } = req.body; // identifier could be email or phone
  
    try {
      // Check if the user exists (by email or phone)
      let user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
  
      // Check the password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const {_id: id, name} = user;
  
      // Generate JWT
      const payload = { userId: user._id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
  
      res.status(200).json({ token, id, name });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  
  module.exports = { registerUser, loginUser };
  
