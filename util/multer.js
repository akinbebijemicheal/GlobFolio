const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, "./uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().substr(0, 10) + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/JPEG" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/gif" ||
    file.mimetype === "image/svg" ||
    file.mimetype === "image/JPG" ||
    file.mimetype === "image/PNG" ||
    file.mimetype === "image/GIF" ||
    file.mimetype === "image/SVG" ||
    file.mimetype === 'video/gif' ||
    file.mimetype === 'video/mp4' ||
    file.mimetype === 'video/wmv' ||
    file.mimetype === 'video/avi' ||
    file.mimetype === 'video/webm' ||
    file.mimetype === 'video/mkv' 
  ) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = upload;
