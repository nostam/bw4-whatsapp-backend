const { Schema, model } = require("mongoose");
const RoomSchema = new Schema({
  roomName: {
    type: String,
    required: true,
  },
  creator: { type: Schema.Types.ObjectId, ref: "users" },
  admins: [{ type: Schema.Types.ObjectId, ref: "users" }],
  isGroup: {
    type: Boolean,
    required: true,
  },
  members: [{ type: Schema.Types.ObjectId, ref: "users" }],
  messages: [
    {
      text: { type: String },
      sender: { type: Schema.Types.ObjectId, ref: "users" },
      createdAt: { type: Date },
    },
    {
      timestamps: true,
    },
  ],
});

module.exports = model("rooms", RoomSchema);
