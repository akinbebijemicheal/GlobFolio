const Sequelize = require("sequelize");
// const sequelise = require("../config/database/connection");
const db = require("../config/config");

const Sector = db.define(
  "sector",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
      primaryKey: true,
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING,
    },
  },
  { paranoid: true }
);

module.exports = Sector;
