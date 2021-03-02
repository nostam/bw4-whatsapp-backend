const {
    Schema,
    model
} = require("mongoose");

const RoomSchema = new Schema({
    roomName: {
        type: String,
        required: true

    },
    creator: {
        type: String,
        required: true
    },
    members: [{
        nickname: {
            type: String,
            required: true
        }, socketId: {
            type: String,
            required: true
        }
    }]
});

module.exports = model("rooms", RoomSchema);