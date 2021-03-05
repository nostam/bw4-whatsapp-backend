const roomSchema = require("../schema/roomSchema");
const UserModel = require("../../users/schema");

const createRoom = async (data) => {};
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
    const { sender, receiver, socketId } = data;
    const roomList = await roomSchema
      .find({ members: sender })
      .populate("members")
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

const updateUserSocketId = async (data) => {
  const res = await UserModel.findByIdAndUpdate(data.userId, { socketId });
  return res ? true : false;
};
const getRoomList = async (data) => {
  const res = updateUserSocketId(data);
  if (res) {
    const { userId } = data;
    const roomList = await roomSchema
      .find({ members: userId })
      .populate("members")
      .sort({ "messages.createdAt": -1 });
    return roomList;
  } else {
    return new Error("failed to find by objectId");
  }
};

module.exports = {
  addUserToRoom,
  findBySocketId,
  removeMember,
  initPrivateMessage,
  getRoomList,
  updateUserSocketId,
};
