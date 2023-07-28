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
      primaryKey: true
    },
    name: {
      allowNull: true,
      type: Sequelize.STRING
    },
    duration: {
      //years
      allowNull: true,
      type: Sequelize.FLOAT
    },
    amount: {
      allowNull: true,
      type: Sequelize.FLOAT
    }
  },
  { paranoid: true }
);

module.exports = SubscriptionPlan;
