const messageSchema = require("./schema/messageSchema")

const addMessage = async (text, sender, room) => {
    try {
        const newMessage = new messageSchema({ text: text, sender: sender, room: room })
        await newMessage.save()
        return newMessage;
    } catch (err) {
        console.log(err)
    }
}

module.exports = addMessage