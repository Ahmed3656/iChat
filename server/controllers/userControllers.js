const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const HttpError = require('../models/errorModel');
const fs = require('fs');
const path = require('path');
const User = require('../models/userModel'); // User model

// Controller to handle registration
const registerUser = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }]  });
    if (existingUser) {
      return res.status(400).json({ msg: 'User with this email or phone already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profilePicture = 'default.jpg';
    if (req.files && req.files.profilePicture) {
      const file = req.files.profilePicture;
      const fileName = `${Date.now()}_${file.name}`;
      await file.mv(`./uploads/${fileName}`);
      profilePicture = fileName;
    }

    const newUser = new User({
      name,
      email: email ? email.trim().toLowerCase() : undefined,
      phone: phone ? phone.trim() : undefined,
      password: hashedPassword,
      profilePicture
    });

    await newUser.save();
    res.status(200).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

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

    const { _id: id, name, email, profilePicture } = user;

    // Generate JWT token
    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Send response with token, id, and name
    res.status(200).json({ token, id, name, email, profilePicture });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Controller to handle user search
const search = async (req, res) => {
  const searchQuery = req.query.q;
  try {
    const users = await User.find({
      $and: [
        {
          $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } }
          ]
        },
        { _id: { $ne: req.user._id } }
      ]
    }).select('-password');

    res.json(users);
  } catch (err) {
    console.error('Error during search:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Controller to edit user info
const editUser = async (req, res, next) => {
  try {
    const { name, email, currPassword, newPassword, confirmNewPassword } = req.body;

    // Check if current password is provided
    if (!currPassword) {
      return next(new HttpError("Current password is required", 422));
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new HttpError('User not found', 404));
    }

    // Verify current password
    const matchingPasswords = await bcrypt.compare(currPassword, user.password);
    if (!matchingPasswords) {
      return next(new HttpError('Invalid current password', 422));
    }

    // Prepare update object
    const updateFields = {};

    // Update name if provided
    if (name && name !== user.name) {
      updateFields.name = name;
    }

    // Update email if provided
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists && (emailExists._id !== req.user._id)) {
        return next(new HttpError('Email already exists', 422));
      }
      updateFields.email = email;
    }

    // Update password if provided
    if (newPassword) {
      if (newPassword !== confirmNewPassword) {
        return next(new HttpError('New passwords do not match', 422));
      }
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(newPassword, salt);
    }

    // Only update if there are fields to update
    if (Object.keys(updateFields).length > 0) {
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updateFields,
        { new: true }
      );
      res.status(200).json(updatedUser);
    } else {
      res.status(200).json({ message: 'No fields to update' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user information', error: error.message });
  }
}

// Controller to handle account deletion
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete account', error });
  }
};

// Controller to handle profile picture change
const changeProfilePicture = async (req, res, next) => {
  try {
    if (!req.files || !req.files.pfp) {
      return next(new HttpError('Please choose an image', 422));
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new HttpError('User not found', 404));
    }

    const { pfp } = req.files;

    // Validate file size and type
    if (pfp.size > 500000) {
      return next(new HttpError('Picture is too large, choose one that is less than 500KB', 422));
    }

    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const fileExtension = pfp.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return next(new HttpError('Invalid file format. Only jpg, jpeg, and png are allowed.', 422));
    }

    // Delete the old profile picture if it exists and is not default
    if (user.profilePicture && user.profilePicture !== 'default.jpg') {
      fs.unlink(path.join(__dirname, '..', 'uploads', user.profilePicture), (err) => {
        if (err) return next(new HttpError(err, 500));
      });
    }

    const fileName = `${Date.now()}_${pfp.name}`;
    pfp.mv(path.join(__dirname, '..', 'uploads', fileName), async (err) => {
      if (err) return next(new HttpError(err, 500));

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { profilePicture: fileName },
        { new: true }
      );

      if (!updatedUser) return next(new HttpError("Profile picture couldn't be changed", 422));

      res.status(200).json(updatedUser);
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile picture', error });
  }
};

// Exporting the controllers
module.exports = {
  registerUser,
  loginUser,
  search,
  editUser,
  deleteAccount,
  changeProfilePicture
};
