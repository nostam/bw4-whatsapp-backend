const {
    Schema,
    model
} = require("mongoose");
const { UserSchema } = require('../../users/schema')
const RoomSchema = new Schema({
    roomName: {
        type: String,
        required: true
    },
    creator: {
        type: String,
        required: true
    },
    admins: [UserSchema],
    isGroup: {
        type: Boolean,
        required: true
    },
    members: [{
        nickname: {
            type: String,
        }, socketId: {
            type: String,
        }
    }],
    messages: [{
        text: { type: String },
        sender: { type: String }
    },
    {
        timestamps: true
    }
    ]
});

module.exports = model("rooms", RoomSchema);