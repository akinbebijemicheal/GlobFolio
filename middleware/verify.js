const User = require('../model/user');

module.exports = async(req, res, next) => {
    try {
        await User.findOne({where : {
            id: req.user.id
        }}).then((user) =>{
            if(user.email_verify){
                return next();
            } else{
                res.status(401).json({
                    status: false,
                    message: "Please verify your email to continue"
                });
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "An error occured"
        });
    }
}