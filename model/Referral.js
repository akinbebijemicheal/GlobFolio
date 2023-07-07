const Sequelize = require("sequelize");
// const sequelise = require("../config/database/connection");
const db = require("../config/config");


const Referral = db.define(
  "referral",
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
    referredId: {
      allowNull: true,
      type: Sequelize.UUID
    }
  },
  { paranoid: true }
);

module.exports = Referral;
