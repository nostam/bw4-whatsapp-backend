const socketio = require("socket.io");
const {
  addUserToRoom,
  findBySocketId,
  removeMember,
  initPrivateMessage,
} = require("./services/chat/utils/userTools");
const addMessage = require("./services/chat/utils/messageTools");

const socketServer = (server) => {
  const io = socketio(server);
  io.on("connection", (socket) => {
    console.log(socket.id + " is linking");

    socket.on("initOneToOne", async (data) => {
      // needed info party a & b (id?), but roomName has to be neutral and unique
      try {
        const {
          room,
          roomList,
          receiverIds,
          receiverRoomList,
        } = await initPrivateMessage({
          ...data,
          socketId: socket.id,
        });
        if (room) {
          socket.join(room._id);
          socket.emit("PM init successfully", room.roomName);
          io.sockets.connected[socket.id].emit("roomList", roomList);
          console.log("receiver socketId", receiverIds.socketId);
          //TODO not sure if its is emmiting to the opponents
          if (receiverIds.socketId) {
            io.sockets.connected[receiverIds.socketId].emit(
              "roomList",
              receiverRoomList
            );
          }
        }
      } catch (error) {
        console.log(error);
      }
    });
    socket.on("addUserToRoom", async (data) => {
      try {
        const { nickname, room, isExistent } = await addUserToRoom({
          socketId: socket.id,
          ...data,
        });
        socket.join(room.roomName);
        if (isExistent === false) {
          socket.emit("userJoined", `${nickname} joined the group`);
          socket.to(socket.id).emit(roomList);
        } else {
          console.log(nickname);
        }
      } catch (error) {
        console.log(error);
      }
    });
    socket.on("sendMessageToRoom", async ({ roomId, text }) => {
      try {
        const user = await findBySocketId(socket.id);
        const messageContent = {
          text: text,
          sender: user._id,
          room: roomId,
        };
        const { currentRoom } = await addMessage(
          messageContent.text,
          messageContent.sender,
          messageContent.room
        );
        io.to(currentRoom.roomName).emit("message", messageContent.text);
      } catch (err) {
        console.log(err);
      }
    });
    socket.on("exitFromRoom", async ({ roomId }) => {
      try {
        const { user, room } = await removeMember(socket.id, roomId);
        io.to(room.roomName).emit(
          "userLeft",
          `${user.nickname} left the group`
        );
      } catch (err) {
        console.log(err);
      }
    });
  });
};

module.exports = socketServer;
