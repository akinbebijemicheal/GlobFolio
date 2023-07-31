const Sequelize = require("sequelize");
// const sequelise = require("../config/database/connection");
const db = require("../config/config");


const SubscriptionPlan = db.define(
  "subscription_plans",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
      primaryKey: true,
    },
    name: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    duration: {
      //months
      allowNull: true,
      type: Sequelize.FLOAT,
    },
    amount: {
      allowNull: true,
      type: Sequelize.FLOAT,
    },
    appleId: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    googleId: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    chatAccess: {
      type: Sequelize.TEXT,
      allowNull: true,
      get: function () {
        if (this.getDataValue("chatAccess") !== undefined) {
          return JSON.parse(this.getDataValue("chatAccess"));
        }
      },
      set(value) {
        this.setDataValue("chatAccess", JSON.stringify(value));
      },
    },
    analystPickAccess: {
      type: Sequelize.TEXT,
      allowNull: true,
      get: function () {
        if (this.getDataValue("analystPickAccess") !== undefined) {
          return JSON.parse(this.getDataValue("analystPickAccess"));
        }
      },
      set(value) {
        this.setDataValue("analystPickAccess", JSON.stringify(value));
      },
    },
    privateMessaging: {
      allowNull: true,
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  },
  { paranoid: true }
);

module.exports = SubscriptionPlan;
