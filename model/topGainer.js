const Sequelize = require("sequelize");
// const sequelise = require("../config/database/connection");
const db = require("../config/config");

const TopGainer = db.define(
  "topGainer",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
      primaryKey: true,
    },
    symbol: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    name: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    price: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    percentageChange: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    industry: {
      allowNull: true,
      type: Sequelize.STRING,
    },
  },
  { paranoid: true }
);

module.exports = TopGainer;
