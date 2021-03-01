const socketio = require("socket.io")
const roomSchema = require("./services/chat/schema")

const socketServer = server => {
    const io = socketio(server);
    io.on("connection", socket => {
        socket.on("addUserToRoom", async data => {
            try {
                const socketId = socket.id
                const nickname = data.nickname
                const roomName = data.roomName
                const user = await roomSchema.findOne({
                    roomName: roomName,
                    "members.nickname": nickname,
                })

                if (user != null) {
                    await roomSchema.findOneAndUpdate({
                        roomName: roomName,
                        "members.nickname": nickname
                    }, {
                        "members.$.socketId": socketId
                    })
                } else {
                    await roomSchema.findOneAndUpdate({
                        roomName: roomName
                    }, {
                        $addToSet: {
                            members: {
                                nickname: nickname,
                                socketId: socketId
                            }
                        }
                    })
                }
                return { nickname, roomName }
            } catch (error) {
                console.log(error)
            }
        })
        socket.on("sendMessageToRoom", async () => {
            try {

            } catch (err) {
                console.log(err)
            }
        })
        socket.on("exitFromRoom", async () => {
            try {

            } catch (err) {
                console.log(err)
            }
        })
        socket.on("removeFromRoom", async () => {
            try {

            } catch (err) {
                console.log(err)
            }
        })
    })
}

module.exports = socketServer