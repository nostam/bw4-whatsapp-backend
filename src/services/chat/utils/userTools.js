const roomSchema = require("../schema/roomSchema")

const addUserToRoom = async ({ nickname, socketId, roomName }) => {
    try {
        const user = await roomSchema.findOne({
            roomName: roomName,
            "members.nickname": nickname,
        });
        if (user) {
            await roomSchema.findOneAndUpdate({
                roomName: roomName,
                "members.nickname": nickname
            }, {
                "members.$.socketId": socketId
            });
        } else {
            await roomSchema.findOneAndUpdate({
                roomName: roomName
            }, {
                $push: {
                    members: {
                        nickname: nickname,
                        socketId: socketId
                    }
                }
            });
        }
        return { nickname, roomName }
    } catch (err) {
        return err
    }
}

const findBySocketId = async (roomName, socketId) => {
    try {
        const room = await roomSchema.findOne({ roomName });
        const user = room.members.find(nickname => nickname.socketId === socketId);
        return user
    } catch (err) {
        return err
    }
}

const removeMember = async (socketId, roomName) => {
    try {
        const room = await roomSchema.findOne({ roomName })
        const nickname = room.members.find(member => member.socketId === socketId)
        await roomSchema.findOneAndUpdate(
            { roomName },
            { $pull: { members: { socketId } } }
        )
        return nickname
    } catch (err) {
        return err
    }
}

module.exports = {
    addUserToRoom,
    findBySocketId,
    removeMember
}