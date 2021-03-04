const roomSchema = require("../schema/roomSchema");
const UserModel = require("../../users/schema");

const addUserToRoom = async ({ nickname, socketId, roomId }) => {
  try {
    const user = await UserModel.findOne({ nickname });
    const room = await roomSchema.findOne({
      _id: roomId,
      members: user._id,
    });
    if (room) {
      await UserModel.findOneAndUpdate({ nickname }, { socketId });
      isExistent = true;
      return { nickname, room, isExistent };
    } else {
      await roomSchema.findOneAndUpdate(
        {
          _id: roomId,
        },
        {
          $push: {
            members: {
              _id: user._id,
            },
          },
        }
      );
      await UserModel.findOneAndUpdate({ nickname }, { socketId });
      isExistent = false;
      return { nickname, room, isExistent };
    }
  } catch (err) {
    console.log(err);
    return err;
  }
};

const findBySocketId = async (socketId) => {
  try {
    const user = await UserModel.findOne({ socketId: socketId });
    // console.log(user)
    return user;
  } catch (err) {
    console.log(err);
    return err;
  }
};

const removeMember = async (socketId, roomId) => {
  try {
    const user = await UserModel.findOne({ socketId: socketId });
    const room = await roomSchema.findOne({ _id: roomId });
    const _id = user._id;
    await roomSchema.findOneAndUpdate(
      { _id: roomId },
      { $pull: { members: { _id } } }
    );
    return { user, room };
  } catch (err) {
    console.log(err);
    return err;
  }
};
const initPrivateMessage = async (data) => {
  try {
    const roomList = await roomSchema
      .find({ members: req.user._id })
      .sort({ "messages.createdAt": -1 })
      .limit({ messages: 20 });
    const { sender, receiver } = data;
    const roomName = `${sender._id}-${receiver._id}`;
    roomNameAlt = `${receiver._id}-${sender._id}`;
    const foundRoom = await roomSchema.findOne({
      isGroup: false,
      roomName: { $or: [{ roomName }, { roomNameAlt }] },
    });
    if (foundRoom) {
      return { room: foundRoom, roomList };
    } else {
      const newPM = await roomSchema.save({
        roomName: `${sender._id}-${receiver._id}`,
        isGroup: false,
        members: [sender._id, receiver._id],
        messages: [{ text: data.text, sender: sender._id }],
      });
      await UserModel.findByIdAndUpdate(sender._id, { socketId });
      return { room: newPM, roomList };
    }
  } catch (error) {
    console.log(err);
    return err;
  }
};

module.exports = {
  addUserToRoom,
  findBySocketId,
  removeMember,
  initPrivateMessage,
};
