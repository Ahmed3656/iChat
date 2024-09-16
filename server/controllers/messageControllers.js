const HttpError = require('../models/errorModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const Chat = require('../models/chatModel');

// Send a message
// POST req: api/messages/
// Protected
const sendMessage = async (req, res, next) => {
    try {
        const { content, chatId } = req.body;

        if(!content || !chatId) return next(new HttpError("Invalid data passed into request", 400));

        let newMessage = {
            sender:req.user._id,
            content: content,
            chat: chatId
        };

        let message = await Message.create(newMessage);
        message = await message.populate('sender', 'name'/*add pfp later*/);
        message = await message.populate('chat');
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'name email' //add pfp later
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.status(200).json(message);
    }
    catch (error) {
        return next(new HttpError("Failed to send the message due to server error", 500))
    }
}

// Get all messages
// GET req: api/messages/:chatId
// Protected
const getMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
        .populate('sender', 'name email' /* add pfp later */)
        .populate('chat');

        res.status(200).json(messages);
    }
    catch (error) {
        return next(new HttpError(error, 500))
    }
}

module.exports = { sendMessage, getMessages };