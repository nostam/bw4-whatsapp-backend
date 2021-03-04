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
    socket.on("initOneToOne", async (data) => {
      // needed info party a & b (id?), but roomName has to be neutral and unique
      try {
        const roomName = await initPrivateMessage({
          ...data,
          socketId: socket.id,
        });
        socket.join(roomName);
        socket.emit("PM init successfully", roomName);
      } catch (error) {
        console.log(error);
      }
    });
    socket.on("addUserToRoom", async (data) => {
      try {
        const { nickname, roomName } = await addUserToRoom({
          socketId: socket.id,
          ...data,
        });
        socket.join(roomName);
        socket.emit("userJoined", `${nickname} joined the group`);
      } catch (error) {
        console.log(error);
      }
    });
    socket.on("sendMessageToRoom", async ({ roomName, text }) => {
      try {
        const user = await findBySocketId(roomName, socket.id);
        const messageContent = {
          text: text,
          sender: user.nickname,
          room: roomName,
        };
        await addMessage(
          messageContent.text,
          messageContent.sender,
          messageContent.room
        );
        io.to(messageContent.room).emit("message", messageContent.text);
      } catch (err) {
        console.log(err);
      }
    });
    socket.on("exitFromRoom", async (roomName) => {
      try {
        const nickname = await removeMember(socket.id, roomName.roomName);
        io.to(roomName.roomName).emit(
          "userLeft",
          `${nickname.nickname} left the group`
        );
      } catch (err) {
        console.log(err);
      }
    });
  });
};

module.exports = socketServer;
