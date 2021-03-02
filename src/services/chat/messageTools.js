const roomSchema = require("./schema/roomSchema")

const addMessage = async (text, sender, room) => {
    try {
        const newMessage = await roomSchema.findOneAndUpdate({ roomName: room }, {
            $addToSet: {
                messages: { text: text, sender: sender }
            }
        });
        if (newMessage)
            return true;
        return false;
    } catch (err) {
        console.log(err)
    }
}

module.exports = addMessage