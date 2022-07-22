const util = require("util");
const path = require("path");
const multer = require("multer");


exports.uploadnew = async (req, res, next) => {
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/public/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.food_pictures + '-' + Date.now() + path.extname(file.originalname))
    }
  })
 multer({ storage: storage })
};