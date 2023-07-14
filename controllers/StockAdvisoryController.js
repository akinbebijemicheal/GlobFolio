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
const StockAdvisory = require("../model/stockAdvisory");

exports.createStockAdvisory = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      let photos = [];
      if (req.file) {
        // const result = await cloudinary.uploader.upload(req.files[i].path);
        // const docPath = result.secure_url;
        const url = `${process.env.APP_URL}/${req.files[i].path}`;
        photos.push({
          name: req.files[i].originalname,
          image: req.files[i].path,
          creatorId,
          url,
        });
      }
      if (photos.length > 0) {
        req.body.image = photos[0].url;
      }
      const stockAdvisory = await StockAdvisory.create(req.body, {
        transaction: t,
      });
      const mesg = `A new Analyst Pick was just posted`;
      // const userId = "general";
      const notifyType = "general";
      const { io } = req.app;
      await Notification.createNotification({
        // userId,
        type: notifyType,
        message: mesg,
      });

      const mesgAdmin = `A admin just created a new Analyst Pick`;
      const userIdAdmin = req.user.id;
      const notifyTypeAdmin = "admin";
      await Notification.createNotification({
        userId: userIdAdmin,
        type: notifyTypeAdmin,
        message: mesgAdmin,
      });

      io.emit("getNotifications", await Notification.fetchAdminNotification());

      return res.status(200).send({
        success: true,
        data: stockAdvisory,
      });
    } catch (error) {
      console.log(error);
      t.rollback();
      return next(error);
    }
  });
};

exports.updateStockAdvisory = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const { stockAdvisoryId, ...other } = req.body;

      let where = { id: stockAdvisoryId };
      let photos = [];
      if (req.file) {
        // const result = await cloudinary.uploader.upload(req.files[i].path);
        // const docPath = result.secure_url;
        const url = `${process.env.APP_URL}/${req.files[i].path}`;
        photos.push({
          name: req.files[i].originalname,
          image: req.files[i].path,
          creatorId,
          url,
        });
      }
      if (photos.length > 0) {
        req.body.image = photos[0].url;
      }
      await StockAdvisory.update(req.body, { where, transaction: t });
      const stockAdvisory = await StockAdvisory.findByPk(stockAdvisoryId);

      const mesg = `Analyst Pick ${stockAdvisory.intro}`;
      // const userId = "general";
      const notifyType = "general";
      const { io } = req.app;
      await Notification.createNotification({
        // userId,
        type: notifyType,
        message: mesg,
      });

      const mesgAdmin = `A admin just updated analyst pick ${stockAdvisory.intro}`;
      const userIdAdmin = req.user.id;
      const notifyTypeAdmin = "admin";
      await Notification.createNotification({
        userId: userIdAdmin,
        type: notifyTypeAdmin,
        message: mesgAdmin,
      });

      io.emit("getNotifications", await Notification.fetchAdminNotification());
      return res.status(200).send({
        success: true,
        message: "StockAdvisory updated successfully",
        data: stockAdvisory,
      });
    } catch (error) {
      console.log(error);
      t.rollback();
      console.log(error);
      return next(error);
    }
  });
};

exports.deleteStockAdvisory = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const { stockAdvisoryId } = req.params;
      const stockAdvisory = await StockAdvisory.destroy({
        where: { id: stockAdvisoryId },
      });

      const mesgAdmin = `A admin just deleted an Analyst Pick`;
      const userIdAdmin = req.user.id;
      const notifyTypeAdmin = "admin";
      await Notification.createNotification({
        userId: userIdAdmin,
        type: notifyTypeAdmin,
        message: mesgAdmin,
      });

      io.emit("getNotifications", await Notification.fetchAdminNotification());
      return res.status(200).send({
        success: true,
        message: "StockAdvisory delete successfully",
      });
    } catch (error) {
      console.log(error);
      t.rollback();
      return next(error);
    }
  });
};

exports.getStockAdvisorys = async (req, res, next) => {
  try {
    const stockAdvisorys = await StockAdvisory.findAll({
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).send({
      success: true,
      data: stockAdvisorys,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getSingleStockAdvisory = async (req, res, next) => {
  try {
    const stockAdvisory = await StockAdvisory.findOne({
      where: { id: req.params.stockAdvisoryId },
    });
    return res.status(200).send({
      success: true,
      data: stockAdvisory,
    });
  } catch (error) {
    return next(error);
  }
};
