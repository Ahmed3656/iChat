// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // User model


// Controller to handle registration
const registerUser = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email});
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Handle the profile picture upload (or assign a default)
    const profilePicture = req.file ? req.file.filename : 'default.jpg';

    // Create a new user
    const newUser = new User({
      name,
      email: email.trim(),
      phone,
      password: hashedPassword,
      profilePicture
    });

    await newUser.save();
    res.status(200).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};





// controllers/authController.js (continued)
const loginUser = async (req, res) => {
  const { identifier, password } = req.body; // identifier could be email or phone

  try {
    // Check if the user exists by email or phone
    let user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Incorrect password' });
    }

    const { _id: id, name, profilePicture } = user;

    // Generate JWT token
    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Send response with token, id, and name
    res.status(200).json({ token, id, name, profilePicture });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const search = async (req, res) => {
  const searchQuery = req.query.q;
  try {
    const users = await User.find({
      $and : [
        {$or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { email: { $regex: searchQuery, $options: 'i' } }
        ]},
        { _id: { $ne: req.user._id } }
      ]
    }).select('-password');

    res.json(users);
  } catch (err) {
    console.error('Error during search:', err.message);  // Check if there's an error here
    res.status(500).json({ msg: 'Server error' });
  }
};
// PUT /settings/change-email
const changeEmail = async (req, res) => {
  try {
    const userId = req.user._id;
    const { newEmail } = req.body;

    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { email: newEmail }, { new: true });

    res.status(200).json({
      success: true,
      message: "Email updated successfully",
      data: updatedUser.email
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update email', error });
  }
};
// DELETE /settings/delete-account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete account', error });
  }
};
// PUT /settings/notifications
const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notificationsEnabled } = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, {
      notificationsEnabled
    }, { new: true });

    res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      data: updatedUser.notificationsEnabled
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update notification preferences', error });
  }
};


  
  module.exports = { registerUser, loginUser, search, updateNotificationPreferences,deleteAccount,changeEmail};
  
