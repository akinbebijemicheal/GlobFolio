const Sequelize = require("sequelize");
// const sequelise = require("../config/database/connection");
const db = require("../config/config");

const StockAdvisory = db.define(
  "stockAdvisory",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
      primaryKey: true,
    },
    industry: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    intro: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    image: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    country: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    description: {
      allowNull: true,
      type: Sequelize.TEXT,
    },
  },
  { paranoid: true }
);

module.exports = StockAdvisory;
