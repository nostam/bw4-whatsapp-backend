const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const { defaultAvatar } = require("../../utils/users");

const UserSchema = new Schema(
  {
    nickname: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    email: {
      type: String,
      unique: true,
      required: [true, "Email address is required"],
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
      validate: {
        validator: async function (email) {
          const user = await this.constructor.findOne({ email });
          if (user && user.email === this.email) return true;
          return !user ? true : false;
        },
        message: "email is taken",
      },
    },
    avatar: String,
    status: { type: String },
    desciption: { type: String, maxLength: 280 },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    googleId: String,
    refreshTokens: [{ token: { type: String } }],
  },
  { timestamps: true, virtuals: true }
);

UserSchema.virtual("fullName").get(() => {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.__v;
  delete userObject.refreshTokens;
  return userObject;
};

UserSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) return user;
    else return null;
  } else {
    return null;
  }
};

UserSchema.pre("save", async function (next) {
  const user = this;
  const plainPW = user.password;
  if (user.avatar === undefined)
    user.avatar = defaultAvatar(user.firstName, user.lastName);
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(plainPW, 10);
  }
  next();
});

module.exports = { UserModel: model("user", UserSchema), UserSchema };
