const passport = require("passport");
const usersRouter = require("express").Router();

const { UserModel } = require("./schema");
const {
  APIError,
  accessTokenOptions,
  refreshTokenOptions,
} = require("../../utils");
const { parse } = require("path");
const { authorize } = require("../auth/middlewares");
const { authenticate } = require("../auth");
const { defaultAvatar } = require("../../utils/users");
const {
  cloudinaryAvatar,
  cloudinaryDestroy,
} = require("../../middlewares/cloudinary");

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    const user = await UserModel.findByCredentials(email, password);

    const { accessToken, refreshToken } = await authenticate(user);
    res
      .cookie("accessToken", accessToken, accessTokenOptions)
      .cookie("refreshToken", refreshToken, refreshTokenOptions)
      .send("Welcome back");
  } catch (error) {
    console.log(error);
    next(new APIError("Invalid credentials", 401));
  }
});

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body);
    const { _id } = await newUser.save();
    res.status(201).send({ _id });
  } catch (error) {
    if (error.code === 11000) {
      const err = new APIError("Email is already in use", 400);
      next(err);
    } else {
      next(error);
    }
  }
});

usersRouter.post("/refreshToken", async (req, res, next) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    next(new APIError("Refresh token missing", 400));
  } else {
    try {
      const { accessToken, refreshToken } = await refreshToken(oldRefreshToken);
      res
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .send("renewed");
    } catch (error) {
      next(new APIError(error.message, 403));
    }
  }
});

usersRouter.post("/logout", authorize, async (req, res, next) => {
  try {
    req.user.refreshTokens = req.user.refreshTokens.filter(
      (t) => t.token !== req.cookies.refreshTokens
    );
    await req.user.save();
    res.clearCookie("accessToken").clearCookie("refreshToken").send();
  } catch (err) {
    next(err);
  }
});

usersRouter.post("/logoutAll", authorize, async (req, res, next) => {
  try {
    console.log(req.user);
    req.user.refreshTokens = [];
    await req.user.save();
    res.clearCookie("accessToken").clearCookie("refreshToken").send();
  } catch (err) {
    next(err);
  }
});

usersRouter.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

usersRouter.get(
  "/googleRedirect",
  passport.authenticate("google"),
  async (req, res, next) => {
    try {
      res
        .cookie("accessToken", req.user.tokens.accessToken, accessTokenOptions)
        .cookie(
          "refreshToken",
          req.user.tokens.refreshToken,
          refreshTokenOptions
        )
        .redirect(`${process.env.FE_URL_PROD}`);
    } catch (error) {
      next(error);
    }
  }
);

usersRouter
  .route("/me/avatar")
  .post(
    authorize,
    cloudinaryAvatar.single("avatar"),
    async (req, res, next) => {
      try {
        const data = parse(req.user.avatar);
        if (data.name) await cloudinaryDestroy(data);
        req.user.avatar = req.file.path;
        await req.user.save();
        res.status(201).send(req.user);
      } catch (error) {
        next(new APIError(error.message, 401));
      }
    }
  )
  .delete(authorize, async (req, res, next) => {
    try {
      const data = parse(req.user.avatar);
      if (data.name) await cloudinaryDestroy(data);
      req.user.avatar = defaultAvatar(req.user.firstName, req.user.lastName);
      delete req.user.avatar.public_id;
      await req.user.save();
      res.send(req.user);
    } catch (error) {
      next(error);
    }
  });

usersRouter
  .route("/me")
  .get(authorize, async (req, res, next) => {
    try {
      res.send(req.user);
    } catch (error) {
      next(error);
    }
  })
  .put(authorize, async (req, res, next) => {
    try {
      const updates = Object.keys(req.body);
      updates.forEach((update) => (req.user[update] = req.body[update]));
      await req.user.save();
      res.send(req.user);
    } catch (error) {
      next(error);
    }
  })
  .delete(authorize, async (req, res, next) => {
    try {
      await req.user.deleteOne();
      res.status(204).send("Deleted");
    } catch (error) {
      next(error);
    }
  });

module.exports = usersRouter;
