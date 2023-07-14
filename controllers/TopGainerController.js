/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-unused-vars */
require("dotenv").config();
const moment = require("moment");
const db = require("../config/config");
const sequelize = db;
// const Testimony = require("../models/Testimonies");
const User = require("../model/user");
const Notification = require("../helpers/notification");
const TopGainer = require("../model/topGainer");


exports.createTopGainer = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const topGainer = await TopGainer.create(req.body, {
        transaction: t,
      });

         const mesg = `A new Top Gainer was just posted`;
         // const userId = "general";
         const notifyType = "general";
         const { io } = req.app;
         await Notification.createNotification({
           // userId,
           type: notifyType,
           message: mesg,
         });

         const mesgAdmin = `A admin just created a new top gainer`;
         const userIdAdmin = req.user.id;
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
        data: topGainer,
      });
    } catch (error) {
      t.rollback();
      return next(error);
    }
  });
};

exports.updateTopGainer = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const { topGainerId, ...other } = req.body;
     
      let  where = {id: topGainerId}
      await TopGainer.update(other, {where, transaction: t });
       const topGainer = await TopGainer.findByPk(topGainerId);


          const mesg = `Top Gainer ${req.body.name} was just updated`;
          // const userId = "general";
          const notifyType = "general";
          const { io } = req.app;
          await Notification.createNotification({
            // userId,
            type: notifyType,
            message: mesg,
          });

          const mesgAdmin = `A admin just updated top gainer ${req.body.name}`;
          const userIdAdmin = req.user.id;
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
        message: "TopGainer updated successfully",
        data: topGainer
      });
    } catch (error) {
      t.rollback();
      console.log(error)
      return next(error);
    }
  });
};

exports.deleteTopGainer = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const { topGainerId } = req.params;
      const topGainer = await TopGainer.destroy({
        where: { id: topGainerId },
      });

            const mesgAdmin = `A admin just deleted top gainer ${req.body.name}`;
            const userIdAdmin = req.user.id;
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
        message: "TopGainer delete successfully",
      });
    } catch (error) {
      t.rollback();
      return next(error);
    }
  });
};

exports.getTopGainers = async (req, res, next) => {
  try {
    const topGainers = await TopGainer.findAll({
      order: [["createdAt", "DESC"]]
    });
    return res.status(200).send({
      success: true,
      data: topGainers,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getSingleTopGainer = async (req, res, next) => {
  try {
    const topGainer = await TopGainer.findOne({
      where: { id: req.params.topGainerId }
    });
    return res.status(200).send({
      success: true,
      data: topGainer,
    });
  } catch (error) {
    return next(error);
  }
};

