const roomSchema = require("../schema/roomSchema");
const UserModel = require("../../users/schema");

const addUserToRoom = async ({ nickname, socketId, roomName }) => {
  try {
    // why it is nickname but not user _id?
    const user = await UserModel.findOne({ nickname });
    const room = await roomSchema.findOne({
      roomName: roomName,
      "members._id": user._id,
    });

    console.log("user: " + user._id);
    console.log("room: " + room);
    if (room) {
      await UserModel.findOneAndUpdate({ nickname }, { socketId });
    } else {
      // const newRoom = new RoomModel(
      //   { roomName },
      //   {
      //     $push: {
      //       members: {
      //         _id: user._id,
      //       },
      //     },
      //   }
      // );
      // await newRoom.save();
      // // This is not creating a room even room === false, 1o1 user will have to do a post /room request first and this will be come a db IO race beween socketio and REST
      await roomSchema.findOneAndUpdate(
        {
          roomName: roomName,
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
    }
    return { nickname, roomName };
  } catch (err) {
    console.log(err);
    return err;
  }
};

const findBySocketId = async (roomName, socketId) => {
  try {
    const room = await roomSchema.findOne({ roomName });
    const user = room.members.find(
      (nickname) => nickname.socketId === socketId
    );
    return user;
  } catch (err) {
    return err;
  }
};

const removeMember = async (socketId, roomName) => {
  try {
    const room = await roomSchema.findOne({ roomName });
    const nickname = room.members.find(
      (member) => member.socketId === socketId
    );
    await roomSchema.findOneAndUpdate(
      { roomName },
      { $pull: { members: { socketId } } }
    );
    return nickname;
  } catch (err) {
    return err;
  }
};

const initPrivateMessage = async (data) => {
  try {
    const newPM = await roomSchema.save({
      roomName: `${data.sender._id}-${data.to._id}`,
      isGroup: false,
      members: [data.sender._id, data.to._id],
      messages: [{ text: data.text, sender: data.sender._id }],
    });
    return newPm.roomName;
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
