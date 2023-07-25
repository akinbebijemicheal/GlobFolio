const jwt = require("jsonwebtoken");
const User = require("../model/user");
require("dotenv").config();

module.exports = async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).send({
      success: false,
      message: "Access Denied",
    });
  }

  // verify token
  try {
    const decoded = jwt.verify(token, process.env.TOKEN);
    //console.log(decoded.user);
       let user = await User.findOne({
        where: {
          id: decoded.user.id,
        },
      });

      if(!user){
           return res.status(401).send({
             success: false,
             message: "Token is not valid as user not found",
           });
      }

    req.user = decoded.user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "Token is not valid",
    });
  }
};
