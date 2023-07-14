// const Sequelize = require("sequelize");
const { Op } = require("sequelize");

// local imports
const Notification = require("../model/Notification");

exports.createNotification = async ({ userId, type, message }) => {
  try {



    const request = {
      userId,
      type,
      message
    };
    await Notification.create(request);
  

    console.log("Notification sent");
    return true;
  } catch (error) {
    return error;
  }
};

exports.fetchUserNotification = async ({ userId }) => {
  try {
    const notifications = await Notification.findAll({
      where: {
        [Op.or]: [{userId: userId}, {type: "user"}],
        [Op.or]: [{ status: "pending" }, { status: "unread" }],
      },
      order: [["createdAt", "DESC"]],
      limit: 5,
    });
    return notifications;
  } catch (error) {
    return error;
  }
};


exports.fetchUserNotificationApi = async notifyParam => {
  try {

    
    const { userId } = notifyParam;
    const notifications = await Notification.findAll({
      where: {
        [Op.or]: [{ userId: userId }, { type: "general" }],
        [Op.or]: [{ status: "pending" }, { status: "unread" }],
      },
      order: [["createdAt", "DESC"]],
      limit: 5,
    });
    return notifications;
  } catch (error) {
    return error;
  }
};

exports.fetchAdminNotification = async () => {
  try {
    const notifications = await Notification.findAll({
      where: {
        type: "admin",
        [Op.or]: [{ status: "pending" }, { status: "unread" }]
      },
      order: [["createdAt", "DESC"]],
      limit: 5
    });
    return JSON.parse(JSON.stringify(notifications));
  } catch (error) {
    return error;
  }
};

exports.updateNotification = async id => {
  try {
    await Notification.update(
      { isRead: true, status: "read" },
      { where: { id } }
    );
    return true;
  } catch (error) {
    return error;
  }
};

exports.deleteNotifications = async id => {
  try {
    await Notification.destroy({ where: { id } });
    return true;
  } catch (error) {
    return error;
  }
};



exports.fetchUserNotificationApi2 = async (senderId) => {
  try {
    const notifications = await Notification.findAll({
      where: {
        userId: senderId,
        type: "user",
        [Op.or]: [{ status: "pending" }, { status: "unread" }],
      },
      order: [["createdAt", "DESC"]],
      limit: 5,
    });
    return notifications;
  } catch (error) {
    return error;
  }
};