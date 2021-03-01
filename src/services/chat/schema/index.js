const {
    Schema,
    model
} = require("mongoose");

const MessageSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    sender: String,
    to: String,
});
const RoomSchema = new Schema({
    roomName: {
        type: String,
        required: true
    },
    creator: { type: String, required: true },
    members: [{ type: String, required: true }]
});

module.exports = model("messages", MessageSchema);
module.exports = model("rooms", RoomSchema);