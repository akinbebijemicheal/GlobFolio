const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function (req, res, next) {
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
