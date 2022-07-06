const Sequelize = require("sequelize");
const db = require("../config/config");
const { nanoid } = require("nanoid");
const Studio = require("./studio_book");

const StudioImage = db.define("studioimage", {
  id: {
    type: Sequelize.STRING(10),
    autoincrement: false,
    allowNull: false,
    primaryKey: true,
    defaultValue: () => nanoid(10),
  },
  studioId: {
    type: Sequelize.STRING(10),
    references: {
      model: "studios",
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

StudioImage.belongsTo(Studio, { foreignKey: "studioId" });
Studio.hasMany(StudioImage, { foreignKey: "studioId" });

module.exports = StudioImage;
