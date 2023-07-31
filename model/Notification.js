const Sequelize = require("sequelize");
const db = require("../config/config");

// const sequelise = require("../config/database/connection");

const Notifications = db.define(
  "notifications",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
      primaryKey: true
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: true
    },
    type: {
      allowNull: true,
      type: Sequelize.ENUM("user", "admin", "general")
    },
    message: {
      allowNull: true,
      type: Sequelize.TEXT
    },
    isRead: {
      allowNull: true,
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    status: {
      allowNull: true,
      type: Sequelize.ENUM,
      values: ["pending", "read", "unread"],
      defaultValue: "pending"
    }
  },
  { paranoid: true }
);

module.exports = Notifications;
