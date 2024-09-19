const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { 
        type: String, 
        default: 'default.jpg' // Default profile picture URL
    }
},
 {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;
