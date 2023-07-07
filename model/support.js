const Sequelize = require("sequelize");
const db = require("../config/config");

// const sequelise = require("../config/database/connection");

const Support = db.define(
  "supports",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
      primaryKey: true,
    },
    email: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    name: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    phone: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    subject: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    message: {
      allowNull: true,
      type: Sequelize.TEXT,
    },
  },
  { paranoid: true }
);

module.exports = Support;
