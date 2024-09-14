const {Schema, model} = require('mongoose');

const chatSchema = new Schema(
    {
        chatName: { type: String, trim: true},
        isGroupChat: { type: Boolean, default: false},
        users: [
            { type: Schema.Types.ObjectId, ref: "User" }
        ],
        latestMessage: {
            type: Schema.Types.ObjectId, ref: "Message"
        },
        mainAdmin: { type: Schema.Types.ObjectId, ref: "User" },
        groupAdmins: [
            { type: Schema.Types.ObjectId, ref: "User" }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = model("Chat", chatSchema);