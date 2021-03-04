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
    socket.on("addUserToRoom", async data => {
      try {
        const { nickname, room } = await addUserToRoom({
          socketId: socket.id,
          ...data
        })
        socket.join(room.roomName)
        socket.emit("userJoined", `${nickname} joined the group`)
      } catch (error) {
        console.log(error)
      }
    })
    socket.on("sendMessageToRoom", async ({ roomId, text }) => {
      try {
        const user = await findBySocketId(socket.id)
        const messageContent = {
          text: text,
          sender: user._id,
          room: roomId,
        }
        const { currentRoom } = await addMessage(messageContent.text, messageContent.sender, messageContent.room)
        io.to(currentRoom.roomName).emit("message", messageContent.text)
      } catch (err) {
        console.log(err)
      }
    })
    socket.on("exitFromRoom", async ({ roomId }) => {
      try {
        const { user, room } = await removeMember(socket.id, roomId)
        io.to(room.roomName).emit("userLeft", `${user.nickname} left the group`)
      } catch (err) {
        console.log(err)
      }
    })
  });
};

module.exports = socketServer;
