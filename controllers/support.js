const nodemailer = require("nodemailer");
const Support = require("../model/support");
require("dotenv").config();
const db = require("../config/config");
const sequelize = db;
const baseurl = process.env.BASE_URL;
const helpers = require("../helpers/message");


exports.support = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    const { name, email, phone, subject, message } = req.body;
    try {
      const new_support = new Support({
        name: name,
        email: email,
        phone: phone,
        subject: subject,
        message: message,
      });

      await new_support.save();

      let supportmessage = helpers.supportMessage(name, email, phone, subject);

      await EmailService.sendMail(
        process.env.ADMIN_EMAIL,
        supportmessage,
        "New Support Mail"
      );

      return res.status(201).json({
        success: true,
        message: "Message Sent to Admin!",
      });
    } catch (error) {
      console.log(error), res.json(error);
      next(error);
    }
  });
};

exports.getSupportMessages = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const data = await Support.findall();

      return res.status(201).json({
        success: true,
        data: data,
      });
    } catch (error) {
      console.log(error), res.json(error);
      next(error);
    }
  });
};
