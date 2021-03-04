const roomSchema = require("../schema/roomSchema")
const { UserModel } = require("../../users/schema");
const cookieParser = require("cookie-parser");

const addUserToRoom = async ({ nickname, socketId, roomId }) => {
    try {
        const user = await UserModel.findOne({ nickname })
        const room = await roomSchema.findOne({
            _id: roomId,
            members: user._id
        });
        if (room) {
            await UserModel.findOneAndUpdate({ nickname }, { socketId })
        } else {
            await roomSchema.findOneAndUpdate({
                _id: roomId
            }, {
                $push: {
                    members: {
                        _id: user._id
                    }
                }
            })
            await UserModel.findOneAndUpdate({ nickname }, { socketId })
        }
        return { nickname, room }
    } catch (err) {
        console.log(err)
        return err
    }
}

const findBySocketId = async (socketId) => {
    try {
        const user = await UserModel.findOne({ socketId: socketId });
        // console.log(user)
        return user
    } catch (err) {
        console.log(err)
        return err
    }
}

const removeMember = async (socketId, roomId) => {
    try {
        const user = await UserModel.findOne({ socketId: socketId });
        const room = await roomSchema.findOne({ _id: roomId });
        const _id = user._id
        await roomSchema.findOneAndUpdate(
            { _id: roomId },
            { $pull: { members: { _id } } }
        )
        return { user, room }
    } catch (err) {
        console.log(err)
        return err
    }
}

module.exports = {
    addUserToRoom,
    findBySocketId,
    removeMember
}