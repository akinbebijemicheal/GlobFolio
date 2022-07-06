const Sequelize = require("sequelize");
const db = require("../config/config");
const { nanoid } = require("nanoid");
const Game = require("./vr_gaming");

const GameImage = db.define("gameimage", {
  id: {
    type: Sequelize.STRING(10),
    autoincrement: false,
    allowNull: false,
    primaryKey: true,
    defaultValue: () => nanoid(10),
  },
  gameId: {
    type: Sequelize.STRING(10),
    references: {
      model: "gamings",
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

GameImage.belongsTo(Game, { foreignKey: "gameId" });
Game.hasMany(GameImage, { foreignKey: "gameId" });

module.exports = GameImage;
