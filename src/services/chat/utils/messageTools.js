const roomSchema = require("../schema/roomSchema")

const addMessage = async (text, sender, room) => {
    try {
        const currentRoom = await roomSchema.findOneAndUpdate({ _id: room }, {
            $addToSet: {
                messages: { text: text, sender: sender }
            }
        })
        return { currentRoom }
    } catch (err) {
        console.log(err)
    }
}

module.exports = addMessage