const socketio = require("socket.io")
const { addUserToRoom, findBySocketId, removeMember } = require("./services/chat/userTools")
const addMessage = require("./services/chat/messageTools")

const socketServer = server => {
    const io = socketio(server);
    io.on("connection", socket => {
        socket.on("addUserToRoom", async data => {
            try {
                const { nickname, roomName } = await addUserToRoom({
                    socketId: socket.id,
                    ...data
                })
                socket.join(roomName)
                socket.emit("userJoined", `${nickname} joined the group`)
            } catch (error) {
                console.log(error)
            }
        })
        socket.on("sendMessageToRoom", async ({ roomName, text }) => {
            try {
                const user = await findBySocketId(roomName, socket.id)
                const messageContent = {
                    text: text,
                    sender: user.nickname,
                    room: roomName,
                }
                const message = await addMessage(messageContent.text, messageContent.sender, messageContent.room)
                io.to(message.room).emit("message", message)
            } catch (err) {
                console.log(err)
            }
        })
        socket.on("exitFromRoom", async (roomName) => {
            try {
                const nickname = await removeMember(socket.id, roomName.roomName)
                io.to(roomName.roomName).emit("userLeft", `${nickname.nickname} left the group`)
            } catch (err) {
                console.log(err)
            }
        })
    })
}

module.exports = socketServer