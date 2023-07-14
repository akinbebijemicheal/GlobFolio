/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const { Op } = require("sequelize");
const moment = require("moment");
const db = require("../config/config");
const sequelize = db;
const AdminMessage = require("../model/AdminMessage");
const Notification = require("../helpers/notification");


exports.postAnnouncement = async (req, res, next) => {
  sequelize.transaction(async t => {
    try {
      const { date, title, content, user } = req.body;

      const request = {
        expiredAt: moment(date).format("YYYY-MM-DD HH:mm:ss"),
        content,
        title,
        user
      };
      if (req.file) {
        const url = `${process.env.APP_URL}/${req.file.path}`;
        request.supportingDocument = url;
      }

      const data = await AdminMessage.create(request, { transaction: t });

          const mesg = title + " " +content;
          // const userId = "general";
          const notifyType = "general";
          const { io } = req.app;
          await Notification.createNotification({
            // userId,
            type: notifyType,
            message: mesg,
          });

              const mesgAdmin = `A new user announcement was just posted by an admin`;
              const userIdAdmin = user.id;
              const notifyTypeAdmin = "admin";
              await Notification.createNotification({
                userId: userIdAdmin,
                type: notifyTypeAdmin,
                message: mesgAdmin,
              });
  
          io.emit(
            "getNotifications",
            await Notification.fetchAdminNotification()
          );
      return res.status(201).send({
        success: true,
        data
      });
    } catch (error) {
      t.rollback();
      return next(error);
    }
  });
};

exports.viewAnnouncements = async (req, res, next) => {
  try {
    const messages = await AdminMessage.findAll({
      order: [["createdAt", "DESC"]]
    });
    return res.status(200).send({
      success: true,
      data: messages
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteAnnouncement = async (req, res, next) => {
  sequelize.transaction(async t => {
    try {
      const { id } = req.params;
      await AdminMessage.destroy({ where: { id }, transaction: t });
           const mesgAdmin = `An announcement was just deleted by an admin`;
           const userIdAdmin = user.id;
           const notifyTypeAdmin = "admin";
           await Notification.createNotification({
             userId: userIdAdmin,
             type: notifyTypeAdmin,
             message: mesgAdmin,
           });

           io.emit(
             "getNotifications",
             await Notification.fetchAdminNotification()
           );
      return res.status(200).send({
        success: true,
        message: "Announcement deleted Successfully"
      });
    } catch (error) {
      t.rollback();
      return next(error);
    }
  });
};

exports.allAdminMessages = async (req, res, next) => {
  try {
    const { userType } = req.query;
    const where = {
      expiredAt: {
        [Op.gte]: moment().format("YYYY-MM-DD HH:mm:ss")
      },
      [Op.or]: [{ user: "all" }, { user: userType }]
    };

    const messages = await AdminMessage.findAll({
      where,
      order: [["createdAt", "DESC"]]
    });
    console.log(messages)
    return res.status(200).send({
      success: true,
      data: messages
    });
  } catch (error) {
    return next(error);
  }
};
