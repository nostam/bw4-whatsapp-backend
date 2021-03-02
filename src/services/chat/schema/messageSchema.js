const {
    Schema,
    model
} = require("mongoose");
const MessageSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    }
);

module.exports = model("messages", MessageSchema);