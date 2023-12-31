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
const userStockAdvisory = require("../model/userStockAdvisorySave");
const { cloudinary } = require("../util/cloudinary");

exports.createStockAdvisorySave = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const { userId, stockAdvisoryId } = req.query;
      const stockAdvisory = await StockAdvisory.findByPk(stockAdvisoryId);
      if (!stockAdvisory) {
        return res.status(400).send({
          success: false,
          message: "Analyst Pick not found",
        });
      }

      const stockAdvisorySaveCheck = await userStockAdvisory.findOne({
        where: { userId, stockAdvisoryId },
      });
      if (stockAdvisorySaveCheck !== null) {
        return res.status(400).send({
          success: false,
          message: "Analyst Pick already saved",
        });
      }
      const stockAdvisorySave = await userStockAdvisory.create(
        { userId, stockAdvisoryId },
        {
          transaction: t,
        }
      );

        const mesg = `You just saved an analyst pick`;
        const notifyType = "user";
        const { io } = req.app;
        await Notification.createNotification({
          userId,
          type: notifyType,
          message: mesg,
        });
      return res.status(200).send({
        success: true,
        message: "Analyst Pick Saved successfully",
        data: stockAdvisorySave,
      });
    } catch (error) {
      console.log(error);
      t.rollback();
      return next(error);
    }
  });
};

exports.deleteStockAdvisorySave = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const { stockAdvisoryIds, userId } = req.body;
      console.log(req.body);

      for (let i = 0; i < stockAdvisoryIds.length; i++) {
        console.log(stockAdvisoryIds[i]);
        await userStockAdvisory.destroy({
          where: { stockAdvisoryId: stockAdvisoryIds[i], userId },
        });
      }
            const mesg = `You just deleted a saved analyst pick`;
            const notifyType = "user";
            const { io } = req.app;
            await Notification.createNotification({
              userId,
              type: notifyType,
              message: mesg,
            });

      return res.status(200).send({
        success: true,
        message: "Analyst Pick Save deleted successfully",
      });
    } catch (error) {
      console.log(error);
      t.rollback();
      return next(error);
    }
  });
};

exports.getStockAdvisorysSave = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const stockAdvisorys = await userStockAdvisory.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: StockAdvisory,
        },
      ],
    });
    return res.status(200).send({
      success: true,
      data: stockAdvisorys,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getSingleStockAdvisorySave = async (req, res, next) => {
  try {
    const { userId, stockAdvisoryId } = req.query;
    const stockAdvisorys = await userStockAdvisory.findOne({
      where: { userId, stockAdvisoryId },
      include: [
        {
          model: StockAdvisory,
        },
      ],
    });
    return res.status(200).send({
      success: true,
      data: stockAdvisorys,
    });
  } catch (error) {
    return next(error);
  }
};
