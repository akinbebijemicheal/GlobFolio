const User = require("../model/user");
const db = require("../config/config");
const sequelize = db;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("dotenv").config();
const nodemailer = require("nodemailer");
const store = require("store");
const passportfacebook = require("passport-facebook");
const FacebookStrategy = require("passport-facebook-token");
const axios = require("axios");
const helpers = require("../helpers/message");
const Notification = require("../helpers/notification");
const EmailService = require("../service/emailService");
const UserService = require("../service/UserService");
const randomstring = require("randomstring");
const { Sequelize, Op } = require("sequelize");
const Picture = require("../model/profilepic");
const Subscription = require("../model/Subscription");
const SubscriptionPlan = require("../model/SubscriptionPlan");

/*const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const myOAuth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    )

myOAuth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
});

const myAccessToken = myOAuth2Client.getAccessToken()*/

const baseurl = process.env.BASE_URL;

exports.checkRole = (roles) => (req, res, next) => {
  console.log(roles, req.user);
  if (!roles.includes(req.user.userType)) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  return next();
};

exports.RegisterUser = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      // console.log(req.body);
      const {
        firstname,
        lastname,
        gender,
        email,
        phone_no,
        country,
        password,
        userType,
      } = req.body;

      let user = await User.findOne({
        where: {
          email: email,
        },
      });
      if (user) {
        return res.status(302).json({
          success: false,
          message: "User already exist",
        });
      }

      const isUserType = UserService.validateUserType(userType);
      if (!isUserType) {
        return res.status(400).send({
          success: false,
          message: "Invalid UserType Entity passed",
        });
      }
      const salt = await bcrypt.genSalt(12);
      const hashedPass = await bcrypt.hash(password, salt);

      const new_user = {
        fullname: firstname + " " + lastname,
        email: email,
        phone_no: phone_no,
        gender: gender,
        country: country,
        userType: "user",
        password: hashedPass,
        referralId: randomstring.generate(6),
        email_verify: false,
      };

      user = await UserService.createNewUser(new_user, t);

      // user = await User.findOne({
      //   where: {
      //     email: email,
      //   },
      // });
      console.log(user);
      // const token = jwt.sign({ email: user.email }, process.env.TOKEN, {
      //   expiresIn: "24h",
      // });
      let token = helpers.generateWebToken();
      // const encodeEmail = encodeURIComponent(email);
      let name = firstname + " " + lastname;
      let message = helpers.verifyEmailMessage(name, email, token);

      if (userType !== "admin") {
        await EmailService.sendMail(email, message, "Verify Email");
      }
      const data = {
        token,
        id: user.id,
      };
      await UserService.updateUser(data, t);

      if (req.body.reference && req.body.reference !== "") {
        const where = {
          referralId: {
            [Op.eq]: req.body.reference,
          },
        };
        const reference = await UserService.findUser(where);
        if (reference) {
          const referenceData = {
            userId: reference.id,
            referredId: user.id,
          };
          await UserService.createReferral(referenceData, t);
        }
      }

      const mesg = `A new user just signed up`;
      const userId = user.id;
      const notifyType = "admin";
      const { io } = req.app;
      await Notification.createNotification({
        userId,
        type: notifyType,
        message: mesg,
      });
      io.emit("getNotifications", await Notification.fetchAdminNotification());

      return res.status(201).json({
        success: true,
        message: "Account created!",
      });
    } catch (error) {
      console.error(error);
      // res.status(500).json({
      //      success: false,
      //      message: "Error occured",
      //      error: error
      //  });
      t.rollback();
      next(error);
    }
  });
};

exports.RegisterAdmin = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      // console.log(req.body);
      const {
        firstname,
        lastname,
        gender,
        email,
        phone_no,
        country,
        password,
        userType,
      } = req.body;

      let user = await User.findOne({
        where: {
          email: email,
        },
      });
      if (user) {
        return res.status(302).json({
          success: false,
          message: "User already exist",
        });
      }

      const isUserType = UserService.validateUserType(userType);
      if (!isUserType) {
        return res.status(400).send({
          success: false,
          message: "Invalid UserType Entity passed",
        });
      }
      const salt = await bcrypt.genSalt(12);
      const hashedPass = await bcrypt.hash(password, salt);

      const new_user = {
        fullname: firstname + " " + lastname,
        email: email,
        phone_no: phone_no,
        gender: gender,
        country: country,
        userType: "user",
        password: hashedPass,
        email_verify: false,
      };

      user = await UserService.createNewUser(new_user, t);

      // user = await User.findOne({
      //   where: {
      //     email: email,
      //   },
      // });
      console.log(user);
      // const token = jwt.sign({ email: user.email }, process.env.TOKEN, {
      //   expiresIn: "24h",
      // });
      let token = helpers.generateWebToken();
      const encodeEmail = encodeURIComponent(email);
      let name = firstname + " " + lastname;
      let message = helpers.verifyEmailMessage(name, email, token);

      if (userType !== "admin") {
        await EmailService.sendMail(email, message, "Verify Email");
      }
      const data = {
        token,
        id: user.id,
      };
      await UserService.updateUser(data, t);

      return res.status(201).json({
        success: true,
        message: "Account created!",
      });
    } catch (error) {
      console.error(error);
      // res.status(500).json({
      //      success: false,
      //      message: "Error occured",
      //      error: error
      //  });
      t.rollback();
      next(error);
    }
  });
};

exports.LoginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: {
        email: email,
      },
      include: [
        {
          model: Picture,
        },
        {
          model: Subscription,
          as: "subscription",
        },
      ],
    });
    console.log(user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }

    if (user.userType !== "user") {
      return res.status(401).json({
        success: false,
        message: "Please ensure you are logging-in from the right portal",
      });
    }
    //  if (!user.isActive) {
    //    return res.status(400).send({
    //      success: false,
    //      message: "Please Verify account",
    //    });
    //  }
    if (user.isSuspended) {
      return res.status(400).send({
        success: false,
        message:
          "Your account has been suspended. Reach out to the admin for further information",
      });
    }

    const validate = await bcrypt.compare(password, user.password);
    if (validate) {
      const payload = {
        user: user,
      };

      let token = jwt.sign(payload, process.env.TOKEN);
      console.log(user.picture);
      let result = {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        userType: user.userType,
        phone_no: user.phone_no,
        country: user.country,
        gender: user.gender,
        address: user.address,
        expiresIn: "24 hours",
        email_verify: user.email_verify,
        referralId: user.referralId,
        createdAt: user.createdAt,
        access_token: token,
        picture: user.picture,
        Subscription: user.subscription,
      };

      const mesg = `You just signed in`;
      const userId = user.id;
      const notifyType = "user";
      const { io } = req.app;
      await Notification.createNotification({
        userId,
        type: notifyType,
        message: mesg,
      });

      return res.status(200).json({
        success: true,
        message: "Successfully logged in",
        data: result,
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "Wrong password",
      });
    }
  } catch (error) {
    console.error(error);
    // res.status(500).json({
    //     success: false,
    //     message: "Error occured",
    //     error: error
    // });
    next(error);
  }
};

exports.userAuth = passport.authenticate("jwt", { session: false });

exports.profile = (user) => {
  return {
    id: user.id,
    fullname: user.fullname,
    phone_no: user.phone_no,
    country: user.country,
    gender: user.gender,
    email: user.email,
    address: user.address,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt,
  };
};

exports.getUsers = async (req, res) => {
  try {
    const admin = await UserService.getUserDetails({ id: req.user.id });
    if (!admin) {
      return res.status(404).send({
        success: false,
        message: "Login first",
      });
    }

    if (admin.userType !== "admin") {
      return res.status(404).send({
        success: false,
        message: "Only Admin can on this route",
      });
    }
    const users = await User.findAll({ where: { userType: "user" } });
    if (users) {
      return res.status(200).json({
        success: true,
        data: users,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No user found",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "error occured",
      error: error,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const admin = await UserService.getUserDetails({ id: req.user.id });
    if (!admin) {
      return res.status(404).send({
        success: false,
        message: "Login first",
      });
    }

    if (admin.userType !== "admin") {
      return res.status(404).send({
        success: false,
        message: "Only Admin can access this route",
      });
    }
    const user = await User.findOne({
      where: {
        id: req.params.userId,
      },
      include: [
        {
          model: Picture,
        },
        {
          model: SubscriptionPlan,
          as: "subscriptionPlan",
          include: [
            {
              model: Subscription,
              as: "subscriptions",
            },
          ],
        },
      ],
    });
    if (user) {
      return res.status(200).json({
        success: true,
        message: user,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No user found",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "error occured",
      error: error,
    });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const admin = await UserService.getUserDetails({ id: req.user.id });
    if (!admin) {
      return res.status(404).send({
        success: false,
        message: "Login first",
      });
    }

    if (admin.userType !== "admin") {
      return res.status(404).send({
        success: false,
        message: "Only Admin can access route",
      });
    }
    const user = await User.findOne({
      where: {
        id: req.params.userId,
        userType: "admin",
      },
    });
    if (user) {
      return res.status(200).json({
        success: true,
        message: user,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No user found",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "error occured",
      error: error,
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const admin = await UserService.getUserDetails({ id: req.user.id });
    if (!admin) {
      return res.status(404).send({
        success: false,
        message: "Login First",
      });
    }

    if (admin.userType !== "admin") {
      return res.status(404).send({
        success: false,
        message: "Only Admin can get all feedbacks",
      });
    }
    const user = await User.findOne({
      where: {
        username: req.params.username,
      },
    });
    if (user) {
      return res.status(200).json({
        success: true,
        message: user,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No user found",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "error occured",
      error: error,
    });
  }
};

exports.verifyUserEmail = async (req, res, next) => {
  sequelize.transaction(async (transaction) => {
    try {
      const { email, token } = req.body;

      const user = await UserService.findUser({ email, token });

      if (!user) {
        return res.status(404).send({
          success: false,
          message: "No User found with this email",
        });
      }

      const data = {
        id: user.id,
        isActive: true,
        email_verify: true,
        token: null,
      };
      await UserService.updateUser(data, transaction);
      const mesg = `Email Verified Successfully`;
      const userId = user.id;
      const notifyType = "user";
      const { io } = req.app;
      await Notification.createNotification({
        userId,
        type: notifyType,
        message: mesg,
      });
      return res.status(200).send({
        success: true,
        message: "Account Activated Successfully",
      });
    } catch (error) {
      transaction.rollback();
      return next(error);
    }
  });
};

exports.updateUser = async (req, res) => {
  try {
    await User.update(req.body, {
      where: {
        email: req.user.email,
      },
      include: [
        {
          model: Picture,
        },
        {
          model: Subscription,
          as: "subscription",
        },
      ],
    });

    const user = await User.findOne({
      where: {
        email: req.user.email,
      },
    });
    const mesg = `Profile Update Successfully`;
    const userId = user.id;
    const notifyType = "user";
    const { io } = req.app;
    await Notification.createNotification({
      userId,
      type: notifyType,
      message: mesg,
    });
    return res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error occured",
      error: error,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.destroy({
      where: {
        email: req.user.email,
      },
      include: [{}],
    });

    return res.status(200).json({
      success: true,
      message: "Updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error occured",
      error: error,
    });
  }
};

exports.deleteUserByAdmin = async (req, res) => {
  try {
    const admin = await UserService.getUserDetails({ id: req.user.id });
    if (!admin) {
      return res.status(404).send({
        success: false,
        message: "Login first",
      });
    }

    if (admin.userType !== "admin") {
      return res.status(404).send({
        success: false,
        message: "Only Admin can access route",
      });
    }
    const user = await User.destroy({
      where: {
        email: req.params.userId,
      },
      include: [{}],
    });
    const mesg = `User Deleted Successfully`;
    const userId = admin.id;
    const notifyType = "admin";
    const { io } = req.app;
    await Notification.createNotification({
      userId,
      type: notifyType,
      message: mesg,
    });
    return res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error occured",
      error: error,
    });
  }
};

// exports.registerUser = async (req, res, next) => {
//   sequelize.transaction(async (t) => {
//     try {
//       const { email, userType, name, captcha } = req.body;

//       if (!req.body.platform && userType !== "admin") {
//         const validateCaptcha = await UserService.validateCaptcha(captcha);
//         if (!validateCaptcha) {
//           return res.status(400).send({
//             success: false,
//             message: "Please answer the captcha correctly",
//             validateCaptcha,
//           });
//         }
//       }

//       const isUserType = UserService.validateUserType(userType);
//       if (!isUserType) {
//         return res.status(400).send({
//           success: false,
//           message: "Invalid User Entity passed",
//         });
//       }
//       let user = await UserService.findUser({ email });

//       if (!user) {
//         const userData = {
//           name: req.body.name,
//           fname: req.body.fname,
//           lname: req.body.lname,
//           email: req.body.email,
//           phone: req.body.phone,
//           password: bcrypt.hashSync(req.body.password, 10),
//           userType: req.body.userType,
//           address: req.body.address,
//           level: req.body.level,
//           referralId: randomstring.generate(12),
//           aboutUs: req.body.aboutUs,
//         };

//         user = await UserService.createNewUser(userData, t);
//         let token = helpers.generateWebToken();
//         const encodeEmail = encodeURIComponent(email);
//         let message = helpers.verifyEmailMessage(name, encodeEmail, token);
//         if (req.body.platform === "mobile") {
//           token = helpers.generateMobileToken();
//           message = helpers.mobileVerifyMessage(name, token);
//         }
//         if (userType !== "admin") {
//           await EmailService.sendMail(email, message, "Verify Email");
//         }
//         const data = {
//           token,
//           id: user.id,
//         };
//         await UserService.updateUser(data, t);
//         // check if refferalId was passed
//         if (req.body.reference && req.body.reference !== "") {
//           const where = {
//             referralId: {
//               [Op.eq]: req.body.reference,
//             },
//           };
//           const reference = await UserService.findUser(where);
//           if (reference) {
//             const referenceData = {
//               userId: reference.id,
//               referredId: user.id,
//             };
//             await UserService.createReferral(referenceData, t);
//           }
//         }
//         if (userType !== "admin" || userType !== "other") {
//           const request = {
//             userId: user.id,
//             userType,
//             company_name: req.body.company_name,
//             serviceTypeId: req.body.serviceTypeId,
//           };
//           const result = await this.addUserProfile(request, t);
//         }
//       } else {
//         const isUser = await this.checkIfAccountExist(userType, user.id);
//         if (isUser) {
//           return res.status(400).send({
//             success: false,
//             message: "This Email is already in Use for this user entity",
//           });
//         }
//         if (userType !== "admin" || userType !== "other") {
//           const request = {
//             userId: user.id,
//             userType,
//             company_name: req.body.company_name,
//             serviceTypeId: req.body.serviceTypeId,
//           };
//           const result = await this.addUserProfile(request, t);
//         }
//       }

//       const type = ["professional", "vendor", "corporate_client"];
//       if (type.includes(userType)) {
//         const data = {
//           userId: user.id,
//           company_name: req.body.company_name,
//         };
//         await UserService.createProfile(data, t);
//       }

//       const mesg = `A new user just signed up as ${UserService.getUserType(
//         userType
//       )}`;
//       const userId = user.id;
//       const notifyType = "admin";
//       const { io } = req.app;
//       await Notification.createNotification({
//         userId,
//         type: notifyType,
//         message: mesg,
//       });
//       io.emit("getNotifications", await Notification.fetchAdminNotification());

//       return res.status(201).send({
//         success: true,
//         message: "User Created Successfully",
//       });
//     } catch (error) {
//       console.log(error);
//       t.rollback();
//       return next(error);
//     }
//   });
// };

exports.testfblogin = async (req, res) => {
  passportfacebook.authenticate("facebook");
};

/**
 *
 * @method POST
 * @param {string} facebook_first_name
 * @param {string} facebook_last_name
 * @param {string} facebook_email
 * @param {string} facebook_id
 * @param {string} user_type
 * @param {string} company_name
 * @return {json} response
 */
exports.facebookSignup = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    let first_name = req.body.facebook_first_name;
    let last_name = req.body.facebook_last_name;
    let name = `${first_name} ${last_name}`;
    let email = req.body.facebook_email;
    let facebook_id = req.body.facebook_id;
    let user_type = req.body.user_type;
    let company_name = req.body.company_name;

    try {
      const user = await User.findOne({ where: { email } });
      if (user !== null) {
        return res.status(404).json({
          success: false,
          message: "Account exists!",
        });
      }

      const user_ = await User.create({
        name,
        fname: first_name,
        lname: last_name,
        email,
        userType: user_type,
        level: 1,
        facebook_id,
        isActive: true,
        app: "facebook",
      });

      // if (user_type !== "admin" || user_type !== "other") {
      //   const request = {
      //     userId: user_.id,
      //     userType: user_type,
      //     company_name,
      //   };
      //   const result = await this.addUserProfile(request, t);
      // }

      // const type = ["corporate_client"];
      // if (type.includes(user_type)) {
      //   const data = {
      //     userId: user_.id,
      //     company_name,
      //   };
      //   await UserService.createProfile(data, t);
      // }

      // const mesg = `A new user just signed up as ${UserService.getUserType(
      //   user_type
      // )}`;
      // const userId = user_.id;
      // const notifyType = "admin";
      // const { io } = req.app;
      // await Notification.createNotification({
      //   userId,
      //   type: notifyType,
      //   message: mesg,
      // });
      // io.emit("getNotifications", await Notification.fetchAdminNotification());

      return res.status(201).send({
        success: true,
        message: "User Created Successfully",
      });
    } catch (err) {
      console.error(err);
      t.rollback();
      return next(err);
    }
  });
};

/**
 * Apple login/signup for clients only
 * @method POST
 * @param {string} access_token
 * @param {string} google_first_name
 * @param {string} google_last_name
 * @param {string} google_email
 * @param {string} google_id
 * @param {string} user_type
 * @param {string} company_name
 * @return {json} response
 */
exports.appleSign = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    const { user_type, company_name } = req.body;
    const { id, email, name } = req.apple_details;

    try {
      const user = await User.findOne({ where: { email } });

      /**
       * If user is found, login, else signup
       */
      if (user !== null) {
        const payload = {
          user: {
            id: user.id,
          },
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: 36000,
        });
        let profile;
        const data = {
          ...user.toJSON(),
        };
        const userId = user.id;
        profile = await UserService.getUserTypeProfile(user_type, userId);
        if (profile) {
          data.profile = profile;
          data.userType = user_type;
        }

        return res.status(200).send({
          success: true,
          message: "User Logged In Sucessfully",
          token,
          user: data,
        });
      }

      const user_ = await User.create({
        name,
        fname: name.split(" ")[0],
        lname: name.split(" ")[1],
        email,
        userType: user_type,
        level: 1,
        apple_id: id,
        isActive: true,
        app: "apple",
      });

      if (user_type !== "admin" || user_type !== "other") {
        const request = {
          userId: user_.id,
          userType: user_type,
          company_name: company_name !== undefined ? company_name : null,
        };
        const result = await this.addUserProfile(request, t);
      }

      const type = ["corporate_client"];
      if (type.includes(user_type)) {
        const data = {
          userId: user_.id,
          company_name: company_name !== undefined ? company_name : null,
        };
        await UserService.createProfile(data, t);
      }

      const mesg = `A new user just signed up as ${UserService.getUserType(
        user_type
      )} through ${"apple"}`;
      const userId = user_.id;
      const notifyType = "admin";
      const { io } = req.app;
      await Notification.createNotification({
        userId,
        type: notifyType,
        message: mesg,
      });
      io.emit("getNotifications", await Notification.fetchAdminNotification());

      return res.status(201).send({
        success: true,
        message: "User Created Successfully",
      });
    } catch (err) {
      console.error(err);
      t.rollback();
      return next(err);
    }
  });
};

/**
 * Google login/signup for clients only
 * @method POST
 * @param {string} access_token
 * @param {string} google_first_name
 * @param {string} google_last_name
 * @param {string} google_email
 * @param {string} google_id
 * @param {string} user_type
 * @param {string} company_name
 * @return {json} response
 */
exports.googleSign = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    // const { userType } = req.body;
    // console.log(req.google_details)
    const { id, email, verified_email, name } = req.google_details;

    try {
      let userdetails;
      userdetails = await User.findOne({ where: { email } });

      /**
       * If user is found, login, else signup
       */
      if (userdetails !== null) {
        return res.status(400).send({
          success: false,
          message: "User exists with email, proceed to login",
        });
      }

      const user_ = await User.create({
        fullname: name,
        email: email,
        userType: "user",
        google_id: id,
        app: "google",
        isActive: true,
        referralId: randomstring.generate(6),
        email_verify: true,
      });

      const user = await User.findOne({
        where: {
          email,
        },
        include: [
          {
            model: Picture,
          },
          {
            model: Subscription,
            as: "subscription",
          },
        ],
      });

      if (user.userType !== "user") {
        return res.status(401).json({
          success: false,
          message: "Please ensure you are logging-in from the right portal",
        });
      }
      const payload = {
        user: user,
      };
      const token = jwt.sign(payload, process.env.TOKEN);
      let result = {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        userType: user.userType,
        phone_no: user.phone_no,
        country: user.country,
        gender: user.gender,
        address: user.address,
        expiresIn: "24 hours",
        email_verify: user.email_verify,
        updatedAt: user.updatedAt,
        createdAt: user.createdAt,
        access_token: token,
        picture: user.picture,
        Subscription: user.subscription,
      };

      const mesg = `A new user just signed up through ${"google"}`;
      const userId = user_.id;
      const notifyType = "admin";
      const { io } = req.app;
      await Notification.createNotification({
        userId,
        type: notifyType,
        message: mesg,
      });
      io.emit("getNotifications", await Notification.fetchAdminNotification());

      return res.status(201).send({
        success: true,
        message: "User Created Successfully",
        data: result,
      });
    } catch (err) {
      console.error(err);
      t.rollback();
      return next(err);
    }
  });
};

/**
 * Sign in using facebook account
 * @method  POST
 * @param   {string} facebook_id
 * @return    {json} response
 */
exports.facebookSignin = async (req, res) => {
  let facebook_id = req.body.facebook_id;

  try {
    const user = await User.findOne({
      where: {
        facebook_id,
      },
    });

    if (user === null) {
      return res.status(404).json({
        success: false,
        message: "Facebook account not found!",
      });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 36000,
    });
    let profile;
    const data = {
      ...user.toJSON(),
    };
    const userId = user.id;
    if (req.body.userType && req.body.userType !== "") {
      const { userType } = req.body;
      profile = await UserService.getUserTypeProfile(userType, userId);
      if (profile) {
        data.profile = profile;
        data.userType = userType;
      }
    } else {
      profile = await UserService.getUserTypeProfile(user.userType, userId);
      if (profile) {
        data.profile = profile;
        data.userType = user.userType;
      }
    }

    return res.status(200).send({
      success: true,
      message: "User Logged In Sucessfully",
      token,
      user: data,
    });
  } catch (err) {
    console.error(err);
  }
};

/**
 * Sign in using google account
 * @method  POST
 * @param   {string} facebook_id
 * @return    {json} response
 */
exports.googleSignin = async (req, res) => {
  const { id, email, verified_email, name } = req.google_details;

  try {
    const user = await User.findOne({
      where: {
        email,
      },
      include: [
        {
          model: Picture,
        },
        {
          model: Subscription,
          as: "subscription",
        },
      ],
    });

    if (user === null) {
      return res.status(404).json({
        success: false,
        message: "Google account not found, go to sign up!",
      });
    }
    if (user.userType !== "user") {
      return res.status(401).json({
        success: false,
        message: "Please ensure you are logging-in from the right portal",
      });
    }
    const payload = {
      user: user,
    };
    const token = jwt.sign(payload, process.env.TOKEN);
    let result = {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      userType: user.userType,
      phone_no: user.phone_no,
      country: user.country,
      gender: user.gender,
      gender: user.gender,
      address: user.address,
      expiresIn: "24 hours",
      email_verify: user.email_verify,
      updatedAt: user.updatedAt,
      createdAt: user.createdAt,
      access_token: token,
      picture: user.picture,
      Subscription: user.subscription,
    };
    const mesg = `You just logged in using ${"google"}`;
    const userId = user.id;
    const notifyType = "user";
    const { io } = req.app;
    await Notification.createNotification({
      userId,
      type: notifyType,
      message: mesg,
    });
    return res.status(200).send({
      success: true,
      message: "User Logged In Sucessfully",
      data: result,
    });
  } catch (err) {
    console.error(err);
  }
};

exports.getAccounts = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const userId = req.user.id;
      const accounts = await this.getAccountsData(userId);

      return res.status(201).send({
        success: true,
        accounts,
      });
    } catch (error) {
      console.log(error);
      t.rollback();
      return next(error);
    }
  });
};

exports.contactAdmin = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const { first_name, last_name, phone, email, message, captcha } =
        req.body;

      if (!req.body.platform) {
        const validateCaptcha = await UserService.validateCaptcha(captcha);
        if (!validateCaptcha) {
          return res.status(400).send({
            success: false,
            message: "Please answer the captcha correctly",
            validateCaptcha,
          });
        }
      }

      const html_data = `
        Name: ${first_name} ${last_name}<br/>
        Phone Number: ${phone}<br/>
        Email: ${email}<br/><br/>
        Message: <br/>
        ${message}
      `;
      await EmailService.sendMail(
        process.env.EMAIL_FROM,
        html_data,
        "Contact Us"
      );

      return res.status(200).send({
        success: true,
        message: "Message sent successfully!",
      });
    } catch (error) {
      console.log(error);
      t.rollback();
      return next(error);
    }
  });
};

exports.getAccountsData = async (userId) => {
  try {
    const attributes = ["id", "userId", "userType"];
    const accounts = {
      service_partner: await ServicePartner.findOne({
        where: { userId },
        attributes,
      }),
      product_partner: await ProductPartner.findOne({
        where: { userId },
        attributes,
      }),
      private_client: await PrivateClient.findOne({
        where: { userId },
        attributes,
      }),
      corporate_client: await CorporateClient.findOne({
        where: { userId },
        attributes,
      }),
    };
    const data = [];
    for (const key in accounts) {
      if (accounts[key] === null || accounts[key] === undefined) {
        delete accounts[key];
      }
      data.push(accounts[key]);
    }
    const filtered = data.filter((where) => where != null);

    return filtered;
  } catch (error) {
    return error;
  }
};

/**
 * verification before login
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.verifyLogin = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const { email, password } = req.body;
      if (typeof email !== "undefined") {
        const user = await UserService.findUser({ email });

        if (!user) {
          return res.status(400).send({
            success: false,
            message: "Invalid Email Address!",
          });
        }

        if (typeof password !== "undefined") {
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return res.status(404).send({
              success: false,
              message: "Incorrect Password!",
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
      t.rollback();
      return next(error);
    }
  });
};

exports.loginAdmin = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const { email, password } = req.body;
      const user = await UserService.findUser({ email });

      if (!user) {
        return res.status(400).send({
          success: false,
          message: "Invalid Email Address!",
        });
      }
      if (user.userType !== "admin") {
        return res.status(400).send({
          success: false,
          message: "This Account is not known",
        });
      }
      if (user.isSuspended) {
        return res.status(400).send({
          success: false,
          message: "Your access has been revoked by the superadmin",
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(404).send({
          success: false,
          message: "Invalid Password!",
        });
      }
      const payload = {
        user: user,
      };
      let token = jwt.sign(payload, process.env.TOKEN);

      let result = {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        userType: user.userType,
        phone_no: user.phone_no,
        country: user.country,
        gender: user.gender,
        address: user.address,
        expiresIn: "24 hours",
        email_verify: user.email_verify,
        updatedAt: user.updatedAt,
        createdAt: user.createdAt,
        access_token: token,
      };

      return res.status(201).send({
        success: true,
        message: "Admin Logged In Sucessfully",
        data: result,
      });
    } catch (error) {
      console.log(error);
      t.rollback();
      return next(error);
    }
  });
};

exports.getLoggedInUser = async (req, res) => {
  try {
    const user = JSON.parse(
      JSON.stringify(await UserService.findUserById(req.user.id))
    );
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "No User Found",
        user: null,
      });
    }
    let profile;
    const data = {
      ...user,
    };
    const userId = user.id;
    if (req.query.userType && req.query.userType !== "") {
      const { userType } = req.query;
      profile = await UserService.getUserTypeProfile(userType, userId);
      if (profile) {
        data.profile = profile;
        data.userType = userType;
      }
    } else if (user.userType !== "admin") {
      profile = await UserService.getUserTypeProfile(user.userType, userId);
      if (profile) {
        data.profile = profile;
        data.userType = user.userType;
      }
    }

    return res.status(200).send({
      success: true,
      user: data,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Server Error",
    });
  }
};

exports.resendCode = async (req, res) => {
  sequelize.transaction(async (t) => {
    try {
      const { email } = req.body;
      const user = await UserService.findUser({ email });
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "No User found with this email",
        });
      }

      let token = helpers.generateWebToken();
      const encodeEmail = encodeURIComponent(email);
      let message = helpers.verifyEmailMessage(user.fullname, email, token);

      if (user.userType !== "admin") {
        await EmailService.sendMail(email, message, "Verify Email");
      }
      const data = {
        token,
        id: user.id,
      };
      await UserService.updateUser(data, t);

      return res.status(200).send({
        success: true,
        message: "Password Reset Email Sent Successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: error,
      });
    }
  });
};

exports.resendCodePasswordReset = async (req, res) => {
  sequelize.transaction(async (t) => {
    try {
      const { email } = req.body;
      console.log(email);

      const user = await User.findOne({ where: { email: email } });
      if (!user) {
        return res.status(404).send({
          success: false,
          message: "Invalid user",
        });
      }

      let token = "";
      token = helpers.generateMobileToken();
      let message = helpers.forgotPasswordMessage(
        { email, first_name: user.fullname },
        token
      );
      await EmailService.sendMail(email, message, "Reset Password");

      // message = helpers.resetPasswordMobileMessage(token);
      // let message = helpers.resetPasswordMessage(email, token);

      // await EmailService.sendMail(email, message, "Reset Password");
      const data = {
        password_token: token,
        id: user.id,
      };
      await UserService.updateUser(data, t);
      return res.status(200).send({
        success: true,
        message: "Password Reset Email Sent Successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: error,
      });
    }
  });
};

// exports.getAllUsers = async (req, res) => {
//   try {
//     const user = await UserService.getUserDetails({ id: req.user.id });
//     if (!user) {
//       return res.status(404).send({
//         success: false,
//         message: "No User Found",
//       });
//     }

//     const where = {
//       userType: {
//         [Op.ne]: "admin",
//       },
//     };
//     const userData = JSON.parse(
//       JSON.stringify(await UserService.getAllUsers(where))
//     );
//     // const usersAccounts = [];
//     // const users = await Promise.all(
//     //   userData.map(async (customer) => {
//     //     const accounts = await this.getAccountsData(customer.id);
//     //     if (accounts.length > 1) {
//     //       for (const account of accounts) {
//     //         if (account.userType !== customer.userType) {
//     //           const userEntity = await UserService.getUserTypeProfile(
//     //             account.userType,
//     //             customer.id
//     //           );
//     //           const customerData = { ...customer };
//     //           customerData.userType = account.userType;
//     //           customerData.profile = userEntity;
//     //           usersAccounts.push({ user: customerData, accounts });
//     //         }
//     //       }
//     //     }
//     //     const profile = await UserService.getUserTypeProfile(
//     //       customer.userType,
//     //       customer.id
//     //     );
//     //     customer.profile = profile;
//     //     return {
//     //       user: customer,
//     //       accounts: JSON.parse(JSON.stringify(accounts)),
//     //     };
//     //   })
//     // );
//     // const data = [...users, ...usersAccounts];
//     return res.status(200).send({
//       success: true,
//       users: userData,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send({
//       success: false,
//       message: "Server Error",
//     });
//   }
// };

exports.analyzeUser = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      let { y } = req.query;

      if (y === undefined) {
        y = new Date().getFullYear();
      }

      const usersByYear = await User.findAll({
        where: sequelize.where(
          sequelize.fn("YEAR", sequelize.col("createdAt")),
          y
        ),
      });

      return res.send({
        success: true,
        users: usersByYear,
      });
    } catch (error) {
      console.log(error);
      t.rollback();
      return next(error);
    }
  });
};

exports.getAllAdmin = async (req, res) => {
  try {
    const user = await UserService.getUserDetails({ id: req.user.id });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "No User Found",
      });
    }

    const where = {
      userType: "admin",
    };
    const users = await User.findAll({ where, order: [["createdAt", "DESC"]] });

    return res.status(200).send({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Server Error",
    });
  }
};

exports.findAdmin = async (req, res) => {
  try {
    const user = await UserService.getUserDetails({ id: req.user.id });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "No User Found",
      });
    }

    const where = {
      userType: "admin",
      id: req.params.adminId,
    };
    const admin = await User.findOne({ where });

    return res.status(200).send({
      success: true,
      admin,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Server Error",
    });
  }
};

exports.revokeAccess = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await UserService.getUserDetails({ id: req.user.id });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "No User Found",
      });
    }
    if (user.level === 1) {
      return res.status(401).send({
        success: false,
        message: "UnAuthorised access",
      });
    }
    await User.destroy({ where: { id: userId } });

    const mesg = `The Admin ${user.email} rights has been revoked by super admin`;
    const notifyType = "admin";
    const { io } = req.app;
    await Notification.createNotification({
      userId,
      type: notifyType,
      message: mesg,
    });
    io.emit("getNotifications", await Notification.fetchAdminNotification());

    return res.status(200).send({
      success: true,
      message: "Admin Access revoked",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Server Error",
    });
  }
};

exports.findSingleUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = JSON.parse(
      JSON.stringify(await UserService.findUserDetail({ id: userId }))
    );
    const profile = await UserService.getUserTypeProfile(
      req.query.userType,
      userData.id
    );
    userData.userType = req.query.userType;
    userData.profile = profile;

    const accounts = await this.getAccountsData(userId);

    const servicePartner = await ServicePartner.findOne({ where: { userId } });
    let ongoingProjects = [];
    let completedProjects = [];
    if (servicePartner !== null) {
      const projectDetails = await Projects.findAll({
        where: { serviceProviderId: servicePartner.id },
      });
      ongoingProjects = projectDetails.filter(
        (_detail) => _detail.status === "ongoing"
      );
      completedProjects = projectDetails.filter(
        (_detail) => _detail.status === "completed"
      );
    }

    return res.status(200).send({
      success: true,
      data: {
        user: userData,
        accounts,
        ongoingProjects,
        completedProjects,
      },
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Server Error",
    });
  }
};

exports.addUserProfile = async (data, t) => {
  try {
    const { userType, userId, company_name, serviceTypeId } = data;
    const where = {
      userId,
    };
    if (userType === "professional") {
      const request = {
        userId,
        company_name,
        userType: "professional",
        serviceTypeId,
      };
      await ServicePartner.create(request, { transaction: t });
    } else if (userType === "vendor") {
      const request = {
        userId,
        company_name,
        userType: "vendor",
      };
      await ProductPartner.create(request, { transaction: t });
    } else if (userType === "private_client") {
      const request = {
        userId,
        userType: "private_client",
      };
      await PrivateClient.create(request, { transaction: t });
    } else if (userType === "corporate_client") {
      const request = {
        userId,
        company_name,
        userType: "corporate_client",
      };
      await CorporateClient.create(request, { transaction: t });
    }
    return true;
  } catch (error) {
    t.rollback();
    return error;
  }
};

exports.checkIfAccountExist = async (userType, userId) => {
  const where = {
    userId,
  };
  let user;
  if (userType === "professional") {
    user = await ServicePartner.findOne({ where });
  } else if (userType === "vendor") {
    user = await ProductPartner.findOne({ where });
  } else if (userType === "private_client") {
    user = await PrivateClient.findOne({ where });
  } else if (userType === "corporate_client") {
    user = await CorporateClient.findOne({ where });
  }
  return user;
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserService.getUserDetails({ id });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "No User Found",
      });
    }

    await User.destroy({ where: { id } });

    return res.status(200).send({
      success: true,
      message: "User deleted!",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Server Error",
    });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const { userId, reason } = req.body;

    const update = {
      isSuspended: true,
      reason_for_suspension: reason,
    };

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "No User Found",
      });
    }

    await User.update(update, { where: { id: userId } });

    // Mailer methods
    // await AdminSuspendUserMailerForUser(
    //   { first_name: userdetails.fullame, email: userdetails.email },
    //   reason
    // );
    // await AdminSuspendUserMailerForAdmin(userdetails, super_admins, reason);

    return res.status(200).send({
      success: true,
      message: "User suspended",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Server Error",
    });
  }
};

exports.unsuspendUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await UserService.getUserDetails({ id: req.user.id });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "No User Found",
      });
    }
    if (user.userType !== "admin") {
      return res.status(401).send({
        success: false,
        message: "UnAuthorised access",
      });
    }
    const update = {
      isSuspended: false,
      isActive: true,
    };

    await User.update(update, { where: { id: userId } });

    return res.status(200).send({
      success: true,
      message: "User unsuspended",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Server Error",
    });
  }
};

// exports.suspendUser = async (req, res) => {
//   try {
//     const { userId, reason } = req.body;
//     const user = await UserService.getUserDetails({ id: req.user.id });
//     if (!user) {
//       return res.status(404).send({
//         success: false,
//         message: "No User Found",
//       });
//     }

//     const update = {
//       isSuspended: true,
//       reason_for_suspension: reason,
//     };

//     const userdetails = await User.findOne({ where: { id: userId } });

//     const super_admins = JSON.parse(
//       JSON.stringify(
//         await User.findAll({
//           where: { userType: "admin", level: 1, isActive: 1, isSuspended: 0 },
//         })
//       )
//     );

//     await User.update(update, { where: { id: userId } });

//     // Mailer methods
//     await AdminSuspendUserMailerForUser(
//       { first_name: userdetails.first_name, email: userdetails.email },
//       reason
//     );
//     await AdminSuspendUserMailerForAdmin(userdetails, super_admins, reason);

//     return res.status(200).send({
//       success: true,
//       message: "User suspended",
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send({
//       success: false,
//       message: "Server Error",
//     });
//   }
// };

// exports.unsuspendUser = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const user = await UserService.getUserDetails({ id: req.user.id });
//     if (!user) {
//       return res.status(404).send({
//         success: false,
//         message: "No User Found",
//       });
//     }
//     if (user.userType !== "admin") {
//       return res.status(401).send({
//         success: false,
//         message: "UnAuthorised access",
//       });
//     }
//     const update = {
//       isSuspended: false,
//       isActive: true,
//     };

//     await User.update(update, { where: { id: userId } });

//     return res.status(200).send({
//       success: true,
//       message: "User suspended",
//     });
//   } catch (error) {
//     return res.status(500).send({
//       success: false,
//       message: "Server Error",
//     });
//   }
// };
