const app = require("express").Router();
const roomSchema = require("./schema/roomSchema");
const UserModel = require("./../users/schema");
const { authorize } = require("../auth/middlewares");

// app.post("/init", authorize, async (req, res, next) => {
//   try {
//     //do a search if there is exist room
//     //if not creat

//     const { to } = req.body;
//     const newPM = await roomSchema.save({
//       roomName: `${req.user._id}-${to._id}`,
//       isGroup: false,
//       members: [req.user._id, to._id],
//     });
//     return newPM.roomName;
//   } catch (error) {
//     console.log(err);
//     return err;
//   }
// });

app.get("/room/:roomId", async (req, res, next) => {
  try {
    const currentRoom = await roomSchema.findById(req.params.roomId);
    res.status(200).json(currentRoom);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

app.post("/room", async (req, res, next) => {
  try {
    const newRoom = await new roomSchema(req.body).save();
    console.log(newRoom);
    res.status(201).send("group created");
  } catch (err) {
    console.log(err);
    next(err);
  }
});

app.put("/room/:roomId/addAdmin/:userId", async (req, res, next) => {
  try {
    const newAdmin = await UserModel.findById(req.params.userId);
    await roomSchema.findByIdAndUpdate(req.params.roomId, {
      $addToSet: {
        admins: newAdmin,
      },
    });
    res.send("done!");
  } catch (err) {
    console.log(err);
    next(err);
  }
});

app.put("/room/:roomId/removeAdmin/:adminId", async (req, res, next) => {
  try {
    await roomSchema.findOneAndUpdate(
      req.params.roomId,
      {
        $pull: {
          admins: {
            _id: req.params.adminId,
          },
        },
      },
      { safe: true, upsert: true }
    );
    res.send("done!");
  } catch (err) {
    console.log(err);
    next(err);
  }
});

app.put("/room/:roomId", async (req, res, next) => {
  try {
    const modifiedRoom = await roomSchema.findByIdAndUpdate(
      req.params.roomId,
      req.body,
      {
        runValidators: true,
        new: true,
      }
    );
    res.status(200).send("profile changed, new id:" + modifiedRoom._id);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

app.delete("/room/:roomId", async (req, res, next) => {
  try {
  } catch (err) {
    console.log(err);
    next(err);
  }
});

module.exports = app;
