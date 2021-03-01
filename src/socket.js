const socketio = require("socket.io")

const socketServer = server => {
    const io = socketio(server);
    io.on("connection", socket => {

    })
}

module.exports = socketServer