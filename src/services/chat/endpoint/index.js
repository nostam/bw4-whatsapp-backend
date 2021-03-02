const app = require("express").Router();
const roomSchema = require("../schema/roomSchema")

app.get('/room/:roomId', async (req, res, next) => {
    try {
        const currentRoom = await roomSchema.findById(req.params.roomId)
        res.status(200).json(currentRoom)
    } catch (err) {
        console.log(err)
        next(err)
    }
});

app.post('/room', async (req, res, next) => {
    try {
        const newRoom = await new roomSchema(req.body).save()
        console.log(newRoom)
        res.status(201).send("group created")
    } catch (err) {
        console.log(err)
        next(err)
    }
});

app.put('/room/:roomId/addadmin/:userId', async (req, res, next) => {
    try {

    } catch (err) {
        console.log(err)
        next(err)
    }
});

app.put('/room/:roomId/removeadmin/:userId', async (req, res, next) => {
    try {

    } catch (err) {
        console.log(err)
        next(err)
    }
});

app.put('/room/:roomId', async (req, res, next) => {
    try {
        const modifiedRoom = await roomSchema.findByIdAndUpdate(
            req.params.roomId,
            req.body,
            {
                runValidators: true,
                new: true,
            })
        res.status(200).send("profile changed, new id:" + modifiedRoom._id);
    } catch (err) {
        console.log(err)
        next(err)
    }
});

app.delete('/room/:roomId', async (req, res, next) => {
    try {

    } catch (err) {
        console.log(err)
        next(err)
    }
})

module.exports = app