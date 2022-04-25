const multer = require('multer');
const path = require('path')

module.exports = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        if(ext !== ".jpg" && ext !== ".JPG" && ext !== ".gif" && ext !== ".svg" && ext !== ".GIF" && ext !== ".SVG" && ext !== ".jpeg" && ext !== ".png" && ext !== ".JPEG" && ext !== ".PNG") {
            cb(new Error(" File type is not supported"), false);
            return;
        }
        cb(null, true);
    },
});

