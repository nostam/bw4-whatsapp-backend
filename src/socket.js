const socketio = require("socket.io");
const {
  addUserToRoom,
  findBySocketId,
  removeMember,
  initPrivateMessage,
  getRoomList,
  updateUserSocketId,
} = require("./services/chat/utils/userTools");
const addMessage = require("./services/chat/utils/messageTools");

const socketServer = (server) => {
  const io = socketio(server);
  io.on("connection", (socket) => {
    console.log(socket.id + " is linking");
    //TODO make sure all incoming event will update user schema's socketId

    socket.on("login", async (data) => {
      // update registered user socket id in db
      // data = { userId }

      try {
        const roomList = await getRoomList({
          ...data,
          socketId: socket.id,
        });

        socket.emit("roomList", roomList);
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
      //data = {senderId, roomName }
      try {
        const res = await createRoom(data);
      } catch (error) {}
    });

    socket.on("addUserToRoom", async (data) => {
      try {
        // const { nickname, room, isExistent } = await addUserToRoom({
        //   socketId: socket.id,
        //   ...data,
        // });
        socket.join(data.roomId);
        console.log(`${socket.id}, joined ${data.roomId}`);
        // if (isExistent === false) {
        //   socket.emit("userJoined", `${nickname} joined the group`);
        //   socket.to(socket.id).emit(roomList);
        // } else {
        //   console.log(nickname);
        // }
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("sendMessageToRoom", async ({ roomId, text, senderId }) => {
      try {
        // const user = await findBySocketId(socket.id);
        // const data = {
        //   userId: senderId,
        //   socketId: socket.id,
        // };
        // const res = await updateUserSocketId(data);
        // if (res) console.log("updated userDB");

        const messageContent = {
          text,
          sender: senderId,
          room: roomId,
        };

        io.in(roomId).emit("sendMsgBack", messageContent);

        const { currentRoom } = await addMessage(
          messageContent.text,
          messageContent.sender,
          messageContent.room
        );

        console.log(currentRoom);
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
