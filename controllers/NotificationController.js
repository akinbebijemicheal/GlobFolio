/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
const { Op } = require("sequelize");
const Notification = require("../model/Notification");
const NotificationService = require("../helpers/notification");
const db = require("../config/config");


exports.getAllAdminNotifications = async (req, res, next) => {
  try {
 



     let page; // page number
     let limit = 20;
     // let offset;
     let notifications;
     let totalPages;
     let data;
     if (!req.query.page) {
       // if page not sent
       page = 0;

       data = await Notification.count({
         where: { type: "admin" },
         order: [["createdAt", "DESC"]],
       });

       if (data > 0) {
         totalPages = Math.ceil(data / limit);
         notifications = await Notification.findAll({
           where: { type: "admin" },
           order: [["createdAt", "DESC"]],
         });
         return res.status(200).send({
           success: true,
           data: notifications,
           totalpage: totalPages,
           count: notifications.length,
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

       data = await Notification.count({
         where: { type: "admin" },
         order: [["createdAt", "DESC"]],
       });

       const { offset } = getPagination(page);
       if (data > 0) {
         let totalPages = Math.ceil(data / limit);

         notifications = await Notification.findAll({
           where: { type: "admin" },
           order: [["createdAt", "DESC"]],
           limit,
           offset,
         });
         return res.status(200).send({
           success: true,
           data: notifications,
           totalpage: totalPages,
           count: notifications.length,
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

exports.getAllAUserNotifications = async (req, res, next) => {
  try {
    const userId = req.params.userId


     let page; // page number
     let limit = 20;
     // let offset;
     let notifications;
     let totalPages;
     let data;
     if (!req.query.page) {
       // if page not sent
       page = 0;

       data = await Notification.count({
         where: {
           [Op.or]: [
             { [Op.and]: [{ userId: userId }, { type: "user" }] },
             { type: "general" },
           ],
           status: "pending",
         },
         order: [["createdAt", "DESC"]],
       });

       if (data > 0) {
         totalPages = Math.ceil(data / limit);
         notifications = await Notification.findAll({
           where: {
             [Op.or]: [
               { [Op.and]: [{ userId: userId }, { type: "user" }] },
               { type: "general" },
             ],
             status: "pending",
           },
           order: [["createdAt", "DESC"]],
         });
         return res.status(200).send({
           success: true,
           data: notifications,
           totalpage: totalPages,
           count: notifications.length,
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

       data = await Notification.count({
         where: {
           [Op.or]: [
             { [Op.and]: [{ userId: userId }, { type: "user" }] },
             { type: "general" },
           ],
           status: "pending",
         },
         order: [["createdAt", "DESC"]],
       });

       const { offset } = getPagination(page);
       if (data > 0) {
         let totalPages = Math.ceil(data / limit);

         notifications = await Notification.findAll({
           where: {
             [Op.or]: [
               { [Op.and]: [{ userId: userId }, { type: "user" }] },
               { type: "general" },
             ],
             status: "pending",
           },
           order: [["createdAt", "DESC"]],
           limit,
           offset,
         });
         return res.status(200).send({
           success: true,
           data: notifications,
           totalpage: totalPages,
           count: notifications.length,
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

exports.getAllAUserNotificationss = async (req, res, next) => {
  try {
    const userId = req.params.userId
    const notifications = await Notification.findAll({
      where: {
        [Op.or]: [
          { [Op.and]: [{ userId: userId }, { type: "user" }] },
          { type: "general" },
        ],
        status: "pending",
      },
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).send({
      success: true,
      data: notifications,
    });
  } catch (error) {
    return next(error);
  }
};


exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const data = {
      status: "read",
      isRead: true
    };
    const notification = await Notification.findByPk(req.params.notificationId);
    if (!notification) {
      return res.status(200).send({
        success: true,
        message: "Notification mark as read"
      });
    }
    await Notification.update(data, {
      where: { id: req.params.notificationId }
    });
    const { io } = req.app;
    if (notification.type === "admin") {
      io.emit(
        "getNotifications",
        await NotificationService.fetchAdminNotification()
      );
    } else if (notification.type === "user") {
      io.emit(
        "getNotifications",
        await NotificationService.fetchUserNotificationApi({
          userId: notification.userId
        })
      );
    }

    return res.status(200).send({
      success: true,
      message: "Notification mark as read"
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  sequelize.transaction(async t => {
    try {
      const { notificationId } = req.params;
      await NotificationService.deleteNotifications(notificationId);
      return res.status(200).send({
        success: true,
        message: "Notification deleted"
      });
    } catch (error) {
      return next(error);
    }
  });
};
