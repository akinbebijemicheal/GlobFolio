const Sequelize = require("sequelize");
// const sequelise = require("../config/database/connection");
const db = require("../config/config");
const SubscriptionPlan = require("./SubscriptionPlan");

const SubscriptionPlanPackage = db.define(
  "subscription_plan_packages",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
      primaryKey: true
    },
    planId: {
      allowNull: true,
      type: Sequelize.UUID
    },
    benefit: {
      allowNull: true,
      type: Sequelize.STRING
    }
  },
  { paranoid: true }
);

SubscriptionPlan.hasMany(SubscriptionPlanPackage, {
  foreignKey: "planId",
  as: "benefits"
});

SubscriptionPlanPackage.belongsTo(SubscriptionPlan, {
  foreignKey: "planId",
  as: "plan"
});

module.exports = SubscriptionPlanPackage;
