const Sequelize = require("sequelize");
const db = require("../config/config");
const { nanoid } = require("nanoid");
const Cinema = require("./cinema");

const CinemaImage = db.define("cinemaimage", {
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
      model: "cinema",
      key: "id",
    },
  },
  img_id: {
    type: Sequelize.STRING,
  },
  img_url: {
    type: Sequelize.STRING,
  },
});

CinemaImage.belongsTo(Cinema, { foreignKey: "cinemaId" });
Cinema.hasMany(CinemaImage, { foreignKey: "cinemaId" });

module.exports = CinemaImage;
