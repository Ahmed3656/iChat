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
        message = await message.populate('sender', 'name profilePicture');
        message = await message.populate('chat');
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'name profilePicture email'
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.status(200).json(message);
    }
    catch (error) {
        return next(new HttpError("Failed to send the message due to server error", 500))
    }
}

// Send a message with an attachment
// POST req : api/messages/attachment
// Protected
const sendAttachmentMessage = async (req, res, next) => {
    try {
        const { chatId } = req.body;

        if (!chatId || !req.files || !req.files.file) {
            return next(new HttpError("Invalid data passed into request", 400));
        }

        const file = req.files.file;
        const uploadPath = `${__dirname}/../uploads/${file.name}`;

        file.mv(uploadPath, async (err) => {
            if (err) {
                return next(new HttpError("File upload failed", 500));
            }

            const fileType = file.mimetype.split('/')[0];

            let newMessage = {
                sender: req.user._id,
                content: JSON.stringify({
                    type: fileType,
                    path: `/uploads/${file.name}`
                }),
                chat: chatId,
            };

            let message = await Message.create(newMessage);
            message = await message.populate('sender', 'name profilePicture');
            message = await message.populate('chat');
            message = await User.populate(message, {
                path: 'chat.users',
                select: 'name profilePicture email',
            });

            await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

            res.status(200).json(message);
        });
    } catch (error) {
        return next(new HttpError("Failed to send the file message", 500));
    }
};

// Get all messages
// GET req: api/messages/:chatId
// Protected
const getMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
        .populate('sender', 'name profilePicture email')
        .populate('chat');

        res.status(200).json(messages);
    }
    catch (error) {
        return next(new HttpError(error, 500))
    }
}

module.exports = { sendMessage, sendAttachmentMessage, getMessages };