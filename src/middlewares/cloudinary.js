const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "whatsapp/avatars",
  },
  limits: { fileSize: 200000 },
});

const messageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "whatsapp/messages",
  },
  limits: { fileSize: 5000000 },
});

const cloudinaryMessage = multer({ storage: messageStorage });

module.exports = { cloudinaryMessage, cloudinaryAvatar };
