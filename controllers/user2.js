const User = require("../model/user");
const Restaurant = require("../model/restuarant");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const keys = require("../middleware/keys");
require("dotenv").config();
const nodemailer = require("nodemailer");
const baseurl = process.env.BASE_URL;
const store = require("store");

exports.RegisterAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (user) {
      console.log("fs", user);
      req.flash("error", "User already exist");
      return res.redirect("register-admin");
    }
    const salt = await bcrypt.genSalt(12);
    const hashedPass = await bcrypt.hash(password, salt);

    user = new User({
      fullname: "Admin",
      email,
      password: hashedPass,
      role: "admin",
      email_verify: true,
    });

    const Newuser = await user.save();
    // res.status(200).json({
    //     status: true,
    //     data: Newuser
    // })
    req.flash("success", "Registration successful");
    return res.redirect(`login-admin`);
  } catch (error) {
    console.error(error);
    // res.status(500).json({
    //     status: false,
    //     message: error
    // })
    // next(error)
    return req.flash("error", "An error occured refresh the page");
    res.redirect("back");
    next(error);
  }
};

exports.webLoginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!user || user === null) {
      req.flash("warning", "User does not exist");
      return res.redirect("/login-admin");
    } else if (user.role !== "admin") {
      // res.status(401).json({
      //     status: false,
      //     message: 'Please ensure you are logging-in from the right portal'
      // })
      req.flash(
        "warning",
        "Please ensure you are logging-in from the right portal"
      );
      return res.redirect("/login-admin");
    } else {
      const validate = await bcrypt.compare(password, user.password);
      if (validate) {
        let token = jwt.sign(
          {
            fullname: user.fullname,
            email: user.email,
            role: user.role,
            id: user.id,
          },
          process.env.TOKEN,
          { expiresIn: 24 * 60 * 60 }
        );

        let result = {
          token: `Bearer ${token}`,
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          expiresIn: "24 hours",
          email_verify: user.email_verify,
          updatedAt: user.updatedAt,
          createdAt: user.createdAt,
        };

        var option = {
          httpOnly: true,
          signed: true,
          sameSite: true,
          secure: process.env.NODE_ENV !== "development",
          secret: process.env.CSECRET,
        };

        req.flash("success", "Successfully logged in");
     return res.cookie("jwt", token, option)
         .redirect("/dashboard/admin");
      } else {
        res.status(403);
        req.flash("warning", "Wrong password");
        return res.redirect("/login-admin");
      }
    }
  } catch (error) {
    console.error(error);
    // res.status(500).json({
    //     status: false,
    //     message: error
    // });
    // next(error);
    req.flash("error", "An error occured refresh the page");
    res.redirect("back");
    next(error);
  }
};

exports.userAuth = passport.authenticate("jwt", {
  session: true,
  failureRedirect: "/login-admin",
  failureFlash: true,
});

exports.profile = (user) => {
  return {
    id: user.id,
    fullname: user.fullname,
    phone_no: user.phone_no,
    country: user.country,
    email: user.email,
    address: user.address,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt,
  };
};

exports.createAdmin = async (req, res, next) => {
  const { email, password, role } = req.body;
  try {
    let user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (user) {
      // res.status(302).json({
      //     status: false,
      //     message: "User already exist"
      // })
      req.flash("error", "User already exist");
      res.redirect("back");
    }
    const salt = await bcrypt.genSalt(12);
    const hashedPass = await bcrypt.hash(password, salt);

    user = new User({
      email,
      password: hashedPass,
      role: role,
      email_verify: true,
    });

    const Newuser = await user.save();
    res.status(200).json({
      status: true,
      data: Newuser,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
exports.userCount = async (rea, res, next) => {
  try {
    const users = await User.count({ where: { role: "user" } });
    if (users) {
      store.set("users", users);
      console.log("users:", users);

      next();
    } else {
      console.log("No user found", users);
      store.set("users", users);

      next();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "An error occured refresh the page",
    });
    next(error);
    // req.flash("error", "An error occured refresh the page")
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({ where: { role: "user" }, raw: true });
    if (users) {
      store.set("users", JSON.stringify(users));
      console.log("users:", users);
      // res.status(200)
      //res.send(users)
      // return res.status(200).json({
      // status: true,
      // data: users});
      let name = req.user.fullname.split(" ");
      let email = req.user.email;
      data = JSON.parse(store.get("users"));
      console.log(data);
      res.render("dashboard/admin/view-user", {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email,
        data,
      });
      next();
    } else {
      console.log("No user found");
      store.set("users", JSON.stringify(users));
      let name = req.user.fullname.split(" ");
      let email = req.user.email;
      data = JSON.parse(store.get("users"));
      console.log(data);
      res.render("dashboard/admin/view-user", {
        user: name[0].charAt(0).toUpperCase() + name[0].slice(1),
        email: email,
        data,
      });
      next();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "An error occured refresh the page",
    });
    next(error);
    // req.flash("error", "An error occured refresh the page")
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        username: req.params.username,
      },
    });
    if (user) {
      return res.status(200).json({
        status: true,
        message: user,
      });
    } else {
      return res.status(404).json({
        status: false,
        message: "No user found",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "An error occured refresh the page",
    });
    next(error);
    //    req.flash("error", "An error occured refresh the page")
    //    res.redirect("back")
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    await User.update(req.body, {
      where: {
        email: req.user.email,
      },
    });

    const user = await User.findOne({
      where: {
        email: req.user.email,
      },
    });
    return res.redirect("/dashboard/admin/");
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "An error occured refresh the page",
    });
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await User.destroy({
      where: {
        id: req.params.id,
      },
    });

    return console.log("status : delete user successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "An error occured refresh the page",
    });
    next(error);
  }
};

exports.checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(401).json({
      status: false,
      message: "Unauthorized",
    });
  }
  return next();
};
