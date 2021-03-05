const socketio = require("socket.io");
const {
  addUserToRoom,
  findBySocketId,
  removeMember,
  initPrivateMessage,
  getRoomList,
} = require("./services/chat/utils/userTools");
const addMessage = require("./services/chat/utils/messageTools");

const socketServer = (server) => {
  const io = socketio(server);
  io.on("connection", (socket) => {
    console.log(socket.id + " is linking");
    //TODO auth with incoming cookies?
    socket.on("login", async (data) => {
      // update registered user socket id in db
      //data = { userId }
      try {
        const roomList = await getRoomList({
          ...data,
          socketId: socket.id,
        });
        io.sockets.connected[socket.id].emit("roomList", roomList);
      } catch (error) {
        console.log(error);
      }
    });
    // create room for 1o1
    // data = { sender: user._id, receiver: opponentsUser._id}
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
        console.log("a", roomList, "b", receiverRoomList);
        if (room) {
          socket.join(room._id);
          socket.emit("PM init successfully", room.roomName);
          socket.emit("roomList", roomList);
          console.log("receiver socketId", receiverIds.socketId);
          if (receiverIds.socketId) {
            socket.to(receiverIds.socketId).emit("roomList", receiverRoomList);
          }
        }
      } catch (error) {
        console.log(error);
      }
    });
    //create group, only creator
    socket.on("createRoom", async (data) => {
      //data = {sender: userId}
      try {
        const res = await createRoom(data);
      } catch (error) {}
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
