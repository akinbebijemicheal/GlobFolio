const {uploadnew} = require("../middleware/uploadmid");
exports.uploadImg = async (req, res) => {
    try{
        await uploadnew(req, res);
        console.log(req.files);
        if(req.files.length <= 0) {
            console.log("select at least one file please");
        }else{
            console.log("file uploaded");
        }
    } catch (error) {
        console.log(error);
        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            console.log("too many files");
        }
    }
};