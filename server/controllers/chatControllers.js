const HttpError = require("../models/errorModel");
const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');


// Access a chat
// POST req : api/chats/
// Protected
const accessChat = async (req, res, next) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return next(new HttpError("UserId is required", 400));
        }

        // Check if a direct chat between the two users exists
        let isChat = await Chat.findOne({
            isGroupChat: false,
            users: { $all: [req.user._id, userId] }
        })
        .populate("users", "-password")
        .populate("latestMessage");

        // Populate latest message sender info
        if (isChat) {
            isChat = await User.populate(isChat, {
                path: 'latestMessage.sender',
                select: 'name  pfpemail', 
            });

            return res.status(200).json(isChat);
        }

        // Create a new chat if one doesn't exist
        const chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        };

        const createdChat = await Chat.create(chatData);
        const fullChat = await Chat.findOne({ _id: createdChat._id })
            .populate('users', '-password');

        res.status(200).json(fullChat);
    } 
    catch (error) {
        return next(new HttpError("Failed to access chat", 500));
    }
}

// Fetch all chats
// Get req : api/chats/
// Protected
const getChats = async (req, res, next) => {
    try {
        const chats = await Chat.find({ users: { $eq: req.user._id } })
            .populate("users", "-password")
            .populate("mainAdmin", "-password")
            .populate("groupAdmins", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 });

        const fullChats = await User.populate(chats, {
            path: "latestMessage.sender",
            select: 'name pfp email' 
        });

        res.status(200).send(fullChats);
    }
    catch (error) {
        return next(new HttpError("h chats", 500));
    }
}

// Fetch chat info
// Get req : api/chats/:chatId
// Protected
const getChat = async (req, res, next) => {
    try {
        const chat = await Chat.findById(req.params.chatId)
            .populate("users", "-password")
            .populate("mainAdmin", "-password")
            .populate("groupAdmins", "-password")
            .populate("latestMessage");

        if (!chat) return next(new HttpError("Chat not found", 404));

        const fullChat = await User.populate(chat, {
            path: "latestMessage.sender",
            select: 'name pfp email'
        });

        res.status(200).json(fullChat);
    }
    catch (error) {
        return next(new HttpError("Failed to fetch chats", 500));
    }
}

// Create a group chat
// POST req : api/chats/creategroup
// Protected
const createGroupChat = async (req, res, next) => {
    try {
        if (!req.body.users || !req.body.name) {
            return next(new HttpError("Please fill in all fields", 400));
        }

        const users = JSON.parse(req.body.users);
        if (users.length < 1) {
            return next(new HttpError("At least 2 users are required to form a group chat", 400));
        }

        users.push(req.user._id);

        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            mainAdmin: req.user._id,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("mainAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        return next(new HttpError("Server error, unable to create group chat", 500));
    }
};



// Rename group chat
// Patch req : api/chats/renamegroup
// Protected
const renameGroup = async (req, res, next) => {
    try {
        const { chatId, chatName } = req.body;

        const chat = await Chat.findById(chatId)
            .populate("users", "-password")
            .populate("mainAdmin", "-password")
            .populate("groupAdmins", "-password");

        if (!chat) {
            return next(new HttpError("Chat not found", 404));
        }

        // Check if the user is the main admin or a group admin
        const isAdmin = chat.mainAdmin._id.equals(req.user._id) || chat.groupAdmins.some(admin => admin._id.equals(req.user._id));

        if (!isAdmin) {
            return next(new HttpError("Only admins are allowed to rename the group", 403));
        }

        const updatedChat = await Chat.findByIdAndUpdate(chatId,
            {
                chatName,
            },
            {
                new: true
            }
        )
        .populate("users", "-password")
        .populate("mainAdmin", "-password")

        if(!updatedChat) return next(new HttpError("Chat not found", 404));
    
        res.status(200).json(updatedChat);
    }
    catch (error) {
        return next(new HttpError(error, 500));
    }
}

// Set another admin to a group
// Patch req : api/chats/addadmin
// Protected
const setAdmin = async (req, res, next) => {
    try {
        const { chatId, userId } = req.body;

        const chat = await Chat.findById(chatId);
        if (!chat) return next(new HttpError("Chat not found", 404));

        const isAdmin = chat.groupAdmins.some(admin => admin._id.equals(req.user._id)) || chat.mainAdmin._id.equals(req.user._id);
        if (!isAdmin) return next(new HttpError("Not authorized to set admin", 403));

        if (chat.groupAdmins.includes(userId)) {
            return next(new HttpError("User is already an admin", 400));
        }

        // Add user to groupAdmins
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { $push: { groupAdmins: userId } },
            { new: true }
        )
        .populate("users", "-password")
        .populate("mainAdmin", "-password")
        .populate("groupAdmins", "-password");

        res.status(200).json(updatedChat);
    } catch (error) {
        return next(new HttpError("Failed to set admin", 500));
    }
}

// Remove admin status from a user
// Patch req : api/chats/removeadmin
// Protected
const removeAdmin = async (req, res, next) => {
    try {
        const { chatId, userId } = req.body;

        const chat = await Chat.findById(chatId);
        if (!chat) return next(new HttpError("Chat not found", 404));

        const isAdmin = chat.groupAdmins.some(admin => admin._id.equals(req.user._id)) || chat.mainAdmin._id.equals(req.user._id);
        if (!isAdmin) return next(new HttpError("Not authorized to remove admin", 403));

        // Check if the user to be removed is the mainAdmin
        if (chat.mainAdmin.toString() === userId) {
            return next(new HttpError("Main admin cannot be removed", 400));
        }

        // Check if the user is already an admin
        if (!chat.groupAdmins.includes(userId)) {
            return next(new HttpError("User is not an admin", 400));
        }

        // Remove the user from groupAdmins
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { $pull: { groupAdmins: userId } },
            { new: true }
        )
        .populate("users", "-password")
        .populate("mainAdmin", "-password")
        .populate("groupAdmins", "-password");

        res.status(200).json(updatedChat);
    } catch (error) {
        return next(new HttpError("Failed to remove admin", 500));
    }
}

// Add a user to a group
// Patch req : api/chats/groupadd
// Protected
const addToGroup = async (req, res, next) => {
    try {
        const { chatId, userId } = req.body;

        const chat = await Chat.findById(chatId);
        if (!chat) return next(new HttpError("Chat not found", 404));

        const isAdmin = chat.groupAdmins.some(admin => admin._id.equals(req.user._id)) || chat.mainAdmin._id.equals(req.user._id);
        if (!isAdmin) return next(new HttpError("Only admins can add a user", 403));

        if (chat.users.includes(userId)) {
            return next(new HttpError("User is already in the group", 400));
        }

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { $push: { users: userId } },
            { new: true }
        )
        .populate("users", "-password")
        .populate("mainAdmin", "-password")
        .populate("groupAdmins", "-password");

        res.status(200).json(updatedChat);
    } catch (error) {
        return next(new HttpError("Failed to add user to the group", 500));
    }
}

// Remove a user from a group
// Patch req : api/chats/groupremove
// Protected
const removeFromGroup = async (req, res, next) => {
    try {
        const { chatId, userId } = req.body;

        const chat = await Chat.findById(chatId);
        if (!chat) return next(new HttpError("Chat not found", 404));

        const isAdmin = chat.groupAdmins.some(admin => admin._id.equals(req.user._id)) || chat.mainAdmin._id.equals(req.user._id);
        if (!isAdmin) return next(new HttpError("Only admins can remove a user", 403));

        if (chat.mainAdmin._id.equals(userId)) return next(new HttpError("Main admin cannot be removed from the group", 400));

        if (!chat.users.includes(userId)) {
            return next(new HttpError("User is not in the group", 400));
        }

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { $pull: { users: userId, groupAdmins: userId } },
            { new: true }
        )
        .populate("users", "-password")
        .populate("mainAdmin", "-password")
        .populate("groupAdmins", "-password");

        res.status(200).json(updatedChat);
    } catch (error) {
        return next(new HttpError("Failed to remove user from the group", 500));
    }
}

// Change group pfp
// Patch req : api/chats/changepfp
// Protected
const changeGroupPfp = async (req, res, next) => {
    try {
        const { chatId } = req.body;
        const pfp = req.files?.pfp;

        if (!pfp) return next(new HttpError('Please choose an image', 422));

        if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) return next(new HttpError('Invalid chat ID', 422));

        const chat = await Chat.findById(chatId);
        if (!chat) return next(new HttpError('Chat not found', 404));

        if (chat.chatPfp) {
            const oldFilePath = path.join(__dirname, '..', 'uploads', chat.chatPfp);
            fs.unlink(oldFilePath, (err) => {
                if (err) {
                    console.error('Error removing old profile picture:', err);
                }
            });
        }

        if (pfp.size > 500000) {
            return next(new HttpError('Picture is too big, choose one that is less than 500KB', 422));
        }

        const fileName = pfp.name;
        const splittedName = fileName.split('.');
        const newFileName = `${splittedName[0]}_${chatId}.${splittedName[splittedName.length - 1]}`;
        const newFilePath = path.join(__dirname, '..', 'uploads', newFileName);

        pfp.mv(newFilePath, async (err) => {
            if (err) return next(new HttpError('Error saving the picture', 500));

            const updatedPfp = await Chat.findByIdAndUpdate(chatId, { chatPfp: newFileName }, { new: true });
            if (!updatedPfp) {
                return next(new HttpError("Group picture couldn't be changed", 422));
            }

            res.status(200).json(updatedPfp);
        });
    } catch (error) {
        console.error('Failed to change group picture:', error);
        return next(new HttpError('Failed to change group picture due to a server error', 500));
    }
}

  
module.exports = { accessChat, getChats, getChat, createGroupChat, renameGroup, setAdmin, removeAdmin, addToGroup, removeFromGroup, changeGroupPfp};
