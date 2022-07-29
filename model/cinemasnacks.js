const Sequelize = require("sequelize");
const db = require("../config/config");
const { nanoid } = require("nanoid");
const Cinema = require("./cinema");

const CinemaSnack = db.define("cinemasnack", {
  id: {
    type: Sequelize.STRING(10),
    autoincrement: false,
    allowNull: false,
    primaryKey: true,
    defaultValue: () => nanoid(10),
  },
  cinemaId: {
    type: Sequelize.STRING(10),
    references: {
      model: 'cinemas',
      key: 'id',
    },
  },
  name: {
    type: Sequelize.STRING,
  },
  price:{
    type: Sequelize.BIGINT,
  }
});

CinemaSnack.belongsTo(Cinema, { foreignKey: "cinemaId" });
Cinema.hasMany(CinemaSnack, { foreignKey: "cinemaId" });

module.exports = CinemaSnack;
