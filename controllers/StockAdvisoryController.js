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
const { cloudinary } = require("../util/cloudinary");

exports.createStockAdvisory = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const { intro, country, industry, description } = req.body;
      let photos = [];
      const request = {
        intro,
        country,
        industry,
        description,
        status: "approved",
      };
      if (req.files || req.file) {
        for (let i = 0; i < req.files.length; i++) {
          const result = await cloudinary.uploader.upload(req.files[i].path);
          console.log(result);

          request.image = result.secure_url;
        }
      }

      console.log(request);
      const stockAdvisory = await StockAdvisory.create(request, {
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

      const mesgAdmin = `A admin just created a new Admin  Pick`;
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
      const request = req.body;
      if (req.files || req.file) {
        for (let i = 0; i < req.files.length; i++) {
          const result = await cloudinary.uploader.upload(req.files[i].path);
          console.log(result);

          request.image = result.secure_url;
        }
      }
      await StockAdvisory.update(request, {
        where,
        transaction: t,
      });
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
        message: "Analyst Pick updated successfully",
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
      const stockAdvisory = await StockAdvisory.findByPk(stockAdvisoryId);
      if (!stockAdvisory) {
        return res.status(400).send({
          success: false,
          message: "StockAdvisory not found",
        });
      }
      await StockAdvisory.destroy({
        where: { id: stockAdvisoryId },
      });

      const mesgAdmin = `A admin just deleted an Admin  Pick`;
      const userIdAdmin = req.user.id;
      const notifyTypeAdmin = "admin";
      const { io } = req.app;

      await Notification.createNotification({
        userId: userIdAdmin,
        type: notifyTypeAdmin,
        message: mesgAdmin,
      });

      io.emit("getNotifications", await Notification.fetchAdminNotification());
      return res.status(200).send({
        success: true,
        message: "Analyst Pick delete successfully",
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
    let page; // page number
    let limit = 20;
    // let offset;
    let stockAdvisorys;
    let totalPages;
    let data;
    if (!req.query.page) {
      // if page not sent
      page = 0;

      data = await StockAdvisory.count({
        where: { status: "approved" },
        order: [["createdAt", "DESC"]],
      });

      if (data > 0) {
        totalPages = Math.ceil(data / limit);
        stockAdvisorys = await StockAdvisory.findAll({
          where: { status: "approved" },
          order: [["createdAt", "DESC"]],
        });
        return res.status(200).send({
          success: true,
          data: stockAdvisorys,
          totalpage: totalPages,
          count: stockAdvisorys.length,
          totalcount: data,
        });
      } else {
        return res.status(200).send({
          success: true,
          data: null,
        });
      }
    } else {
      //if page is sent
      page = +req.query.page;
      const getPagination = (page) => {
        limit = 20;
        h = page - 1;
        let offset = h * limit;

        return { limit, offset };
      };

      data = await StockAdvisory.count({
        where: { status: "approved" },
        order: [["createdAt", "DESC"]],
      });

      const { offset } = getPagination(page);
      if (data > 0) {
        let totalPages = Math.ceil(data / limit);

        stockAdvisorys = await StockAdvisory.findAll({
          where: { status: "approved" },
          order: [["createdAt", "DESC"]],
          limit,
          offset,
        });
        return res.status(200).send({
          success: true,
          data: stockAdvisorys,
          totalpage: totalPages,
          count: stockAdvisorys.length,
          totalcount: data,
        });
      } else {
        return res.status(200).send({
          success: true,
          data: null,
        });
      }
    }
  } catch (error) {
    return next(error);
  }
};

exports.getStockAdvisorysFree = async (req, res, next) => {
  try {
    let page; // page number
    let limit = 10;
    // let offset;
    let stockAdvisorys;
    let totalPages;
    let data;
    if (!req.query.page) {
      // if page not sent
      page = 0;

      data = await StockAdvisory.count({
        where: { status: "approved" },
        order: [["createdAt", "DESC"]],
      });

      if (data > 0) {
        totalPages = Math.ceil(data / limit);
        stockAdvisorys = await StockAdvisory.findAll({
          where: { status: "approved" },
          attributes: ["intro", "image", "industry", "countries"],
          order: [["createdAt", "DESC"]],
        });
        return res.status(200).send({
          success: true,
          data: stockAdvisorys,
          totalpage: totalPages,
          count: stockAdvisorys.length,
          totalcount: data,
        });
      } else {
        return res.status(200).send({
          success: true,
          data: null,
        });
      }
    } else {
      //if page is sent
      page = +req.query.page;
      const getPagination = (page) => {
        limit = 10;
        h = page - 1;
        let offset = h * limit;

        return { limit, offset };
      };

      data = await StockAdvisory.count({
        where: { status: "approved" },
        order: [["createdAt", "DESC"]],
      });

      const { offset } = getPagination(page);
      if (data > 0) {
        let totalPages = Math.ceil(data / limit);

        stockAdvisorys = await StockAdvisory.findAll({
          where: { status: "approved" },
          attributes: ["intro", "image", "industry"],
          order: [["createdAt", "DESC"]],
          limit,
          offset,
        });
        return res.status(200).send({
          success: true,
          data: stockAdvisorys,
          totalpage: totalPages,
          count: stockAdvisorys.length,
          totalcount: data,
        });
      } else {
        return res.status(200).send({
          success: true,
          data: null,
        });
      }
    }
  } catch (error) {
    return next(error);
  }
};

exports.getSingleStockAdvisory = async (req, res, next) => {
  try {
    const stockAdvisory = await StockAdvisory.findOne({
      where: { status: "pending" },
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

/////////////////////////Draft//////////////////

exports.createStockAdvisoryDraft = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const { intro, country, industry, description } = req.body;
      let photos = [];
      const request = {
        intro,
        country,
        industry,
        description,
        status: "pending",
      };
      if (req.files || req.file) {
        for (let i = 0; i < req.files.length; i++) {
          const result = await cloudinary.uploader.upload(req.files[i].path);
          console.log(result);

          request.image = result.secure_url;
        }
      }

      console.log(request);
      const stockAdvisory = await StockAdvisory.create(request, {
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

exports.getStockAdvisorysDraft = async (req, res, next) => {
  try {
    const stockAdvisorys = await StockAdvisory.findAll({
      where: { status: "pending" },
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

exports.stockAdvisoryToDraft = async (req, res, next) => {
  sequelize.transaction(async (t) => {
    try {
      const { stockAdvisoryId } = req.body;

      let where = { id: stockAdvisoryId };

      await StockAdvisory.update(
        { status: "approved" },
        {
          where,
          transaction: t,
        }
      );
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

      const mesgAdmin = `A admin just added Analyst Pick ${stockAdvisory.intro} from draft`;
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
        message: "Analyst Pick added to main successfully",
      });
    } catch (error) {
      console.log(error);
      t.rollback();
      console.log(error);
      return next(error);
    }
  });
};

exports.getSingleStockAdvisoryDraft = async (req, res, next) => {
  try {
    const stockAdvisory = await StockAdvisory.findOne({
      where: { id: req.params.stockAdvisoryId, status: "pending" },
    });
    return res.status(200).send({
      success: true,
      data: stockAdvisory,
    });
  } catch (error) {
    return next(error);
  }
};
