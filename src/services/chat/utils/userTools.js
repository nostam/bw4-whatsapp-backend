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
    // data =  { sender: _id, recever: _id}
    const { sender, receiver } = data;
    const roomList = await roomSchema
      .find({ members: sender })
      .sort({ "messages.createdAt": -1 });
    const roomName = `${sender}-${receiver}`;
    roomNameAlt = `${receiver}-${sender}`;
    const foundRoom = await roomSchema.findOne({
      $or: [{ roomName: roomName }, { roomName: roomNameAlt }],
    });
    // TODO method project is not a function =
    const receiverIds = await UserModel.findById(receiver, {
      _id: 1,
      socketId: 1,
    });
    // const receiverIds = await UserModel.findById(receiver);
    const receiverRoomList = await roomSchema.find({
      members: sender,
    });

    if (foundRoom) {
      return { room: foundRoom, roomList, receiverIds, receiverRoomList };
    } else {
      const newPM = new roomSchema({
        roomName,
        isGroup: false,
        members: [sender, receiver],
        messages: [{ text: data.text, sender: sender, createdAt: new Date() }],
      });
      await newPM.save({ validateBeforeSave: false });
      await UserModel.findByIdAndUpdate(sender, { socketId });
      return { room: newPM, roomList, receiverIds, receiverRoomList };
    }
  } catch (error) {
    console.log(error);
    return error;
  }
};
const getRoomList = async (data) => {
  const { _id } = data;
  const roomList = await roomSchema
    .find({ members: _id })
    .sort({ "messages.createdAt": -1 });
  return roomList;
};
module.exports = {
  addUserToRoom,
  findBySocketId,
  removeMember,
  initPrivateMessage,
  getRoomList,
};
