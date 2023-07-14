/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
const { Op } = require("sequelize");
const Notification = require("../model/Notification");
const NotificationService = require("../helpers/notification");
const db = require("../config/config");


exports.getAllAdminNotifications = async (req, res, next) => {
  try {
    const { level, role } = req._credentials;

    let notifications = await Notification.findAll({
      where: {
        type: "admin"
      },
      order: [["createdAt", "DESC"]]
    });

    if (level !== 1) {
      // Get privileged Notifications
      notifications = notifications.filter(_notification => {
        // Check if the sub admin is permitted to view this message
        const _privilegedMsg = role.privileges.filter(_priv =>
          _notification.message.toLowerCase().includes(_priv.toLowerCase())
        );
        if (_privilegedMsg.length > 0) {
          return _notification;
        }
      });
    }

    return res.status(200).send({
      success: true,
      data: notifications
    });
  } catch (error) {
    return next(error);
  }
};

exports.getAllAUserNotifications = async (req, res, next) => {
  try {
    const userId = req.params.userId
    const notifications = await Notification.findAll({
      where: {
        [Op.or]: [
          { [Op.and]: [{ userId: userId }, { type: "user" }] },
          { type: "general" },
        ],
        [Op.or]: [{ status: "pending" }, { status: "unread" }],
      },
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).send({
      success: true,
      data: notifications
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
