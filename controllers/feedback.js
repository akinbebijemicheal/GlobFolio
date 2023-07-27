const User = require("../model/user");
const db = require("../config/config");
const sequelize = db;
require("dotenv").config();
const nodemailer = require("nodemailer");
const store = require("store");
const passportfacebook = require("passport-facebook");
const FacebookStrategy = require("passport-facebook-token");
const axios = require("axios");
const helpers = require("../helpers/message");
const EmailService = require("../service/emailService");
const UserService = require("../service/UserService");
const randomstring = require("randomstring");
const Feedback = require("../model/feedback");
const { Sequelize, Op } = require("sequelize");
const Notification = require("../helpers/notification");

exports.createFeedback = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const { rating, subject, message } = req.body;
      console.log(req.user);

      const id = req.user.id;

      const user = await UserService.findUser({ id });

      if (!user) {
        return res.status(400).send({
          success: false,
          message: "No user found with id",
        });
      }

      if (user.userType == "admin") {
        return res.status(400).send({
          success: false,
          message: "Admin cant create feedback",
        });
      }

      let feedback = new Feedback({
        rating: rating,
        userId: req.user.id,
        subject: subject,
        message: message,
      });

      const newFeedback = await feedback.save();
      console.log(newFeedback);

      let name = user.fullname;
      let emailmessage = helpers.feedbackMessage(name);

      await EmailService.sendMail(
        user.email,
        emailmessage,
        "Thanks for Feedback"
      );

      //   const notifyType = "admin";
      //   const { io } = req.app;
      //   await Notification.createNotification({
      //     userId,
      //     type: notifyType,
      //     message: mesg,
      //   });
      //   io.emit("getNotifications", await Notification.fetchAdminNotification());
      const mesgAdmin = `A new user feedback was made by ${user.email}`;
      const userIdAdmin = user.id;
      const notifyTypeAdmin = "admin";
      await Notification.createNotification({
        userId: userIdAdmin,
        type: notifyTypeAdmin,
        message: mesgAdmin,
      });

      io.emit("getNotifications", await Notification.fetchAdminNotification());

      return res.status(201).send({
        success: true,
        message: "Feedback Sent, Thanks",
      });
    } catch (error) {
      console.log(error);
      t.rollback();
      return next(error);
    }
  });
};

exports.getAllFeedbacks = async (req, res) => {
  try {
    const user = await UserService.getUserDetails({ id: req.user.id });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "No User Found",
      });
    }

    if (user.userType !== "admin") {
      return res.status(404).send({
        success: false,
        message: "Only Admin can get all feedbacks",
      });
    }

    const feedbacks = JSON.parse(
      JSON.stringify(
        await Feedback.findAll({
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: User,
            },
          ],
        })
      )
    );
    // const usersAccounts = [];
    // const users = await Promise.all(
    //   userData.map(async (customer) => {
    //     const accounts = await this.getAccountsData(customer.id);
    //     if (accounts.length > 1) {
    //       for (const account of accounts) {
    //         if (account.userType !== customer.userType) {
    //           const userEntity = await UserService.getUserTypeProfile(
    //             account.userType,
    //             customer.id
    //           );
    //           const customerData = { ...customer };
    //           customerData.userType = account.userType;
    //           customerData.profile = userEntity;
    //           usersAccounts.push({ user: customerData, accounts });
    //         }
    //       }
    //     }
    //     const profile = await UserService.getUserTypeProfile(
    //       customer.userType,
    //       customer.id
    //     );
    //     customer.profile = profile;
    //     return {
    //       user: customer,
    //       accounts: JSON.parse(JSON.stringify(accounts)),
    //     };
    //   })
    // );
    // const data = [...users, ...usersAccounts];
    return res.status(200).send({
      success: true,
      feedbacks: feedbacks,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Server Error",
    });
  }
};
