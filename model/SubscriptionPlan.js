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
    countries: {
      type: Sequelize.TEXT,
      allowNull: true,
      get: function () {
        if (this.getDataValue("countries") !== undefined) {
          return JSON.parse(this.getDataValue("countries"));
        }
      },
      set(value) {
        this.setDataValue("countries", JSON.stringify(value));
      },
    },
    chatUsers: {
      allowNull: true,
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  },
  { paranoid: true }
);

module.exports = SubscriptionPlan;
