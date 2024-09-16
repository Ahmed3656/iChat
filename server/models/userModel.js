const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true },
    password: { type: String, required: true },
    pfp: { type: String, default: 'nullPic.jpg' },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', UserSchema);
