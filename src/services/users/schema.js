const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new Schema(
  {
    nickname: { type: String, required: true },
    firstName: String,
    lastName: String,
    password: String,
    email: {
      type: String,
      unique: true,
      required: [true, "email required"],
      minlength: [3, "email must be at least 3 characters"],
      lowercase: true,
      validate: {
        validator: async function (email) {
          const user = await this.constructor.findOne({ email });
          if (user && user.email === this.email) return true;
          return !user ? true : false;
        },
        message: "email is taken",
      },
    },
    status: { type: String },
    role: {
      type: String,
      enum: ["admin", "user"],
      required: [true, "User role required"],
      default: "user",
    },
    googleId: String,
    refreshTokens: [{ token: { type: String } }],
  },
  { timestamps: true }
);

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.__v;
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

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(plainPW, 10);
  }
  next();
});

module.exports = model("user", UserSchema);
