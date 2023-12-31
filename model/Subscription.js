const Sequelize = require("sequelize");
// const sequelise = require("../config/database/connection");
const db = require("../config/config");
const User = require("./user");
const SubscriptionPlan = require("./SubscriptionPlan");


const Subscription = db.define(
  "subscriptions",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
      primaryKey: true
    },
    userId: {
      allowNull: true,
      type: Sequelize.UUID
    },
    planId: {
      allowNull: true,
      type: Sequelize.UUID
    },
    expiredAt: {
      allowNull: true,
      type: Sequelize.DATE
    },
    amount: {
      allowNull: true,
      type: Sequelize.FLOAT
    },
    status: {
      allowNull: true,
      type: Sequelize.BOOLEAN,
      defaultValue: true
    }
  },
  { paranoid: true }
);

Subscription.belongsTo(User, { foreignKey: "userId" });
User.hasOne(Subscription, { foreignKey: "userId" });

Subscription.belongsTo(SubscriptionPlan, { foreignKey: "planId", as: "subscriptionPlan" });
SubscriptionPlan.hasMany(Subscription, { foreignKey: "planId", as: "subscriptions" });
module.exports = Subscription;
