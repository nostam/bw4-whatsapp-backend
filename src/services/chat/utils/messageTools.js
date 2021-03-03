const roomSchema = require("../schema/roomSchema")

const addMessage = async (text, sender, room) => {
    try {
        await roomSchema.findOneAndUpdate({ roomName: room }, {
            $addToSet: {
                messages: { text: text, sender: sender }
            }
        })
    } catch (err) {
        console.log(err)
        next(err)
    }
}

module.exports = addMessage