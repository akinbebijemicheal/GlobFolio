const Sequelize = require("sequelize");
const db = require("../config/config");
const { nanoid } = require("nanoid");
const Rent = require("./renting");

const RentImage = db.define("rentimage", {
  id: {
    type: Sequelize.STRING(10),
    autoincrement: false,
    allowNull: false,
    primaryKey: true,
    defaultValue: () => nanoid(10),
  },
  rentId: {
    type: Sequelize.STRING(10),
    references: {
      model: "rent",
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

RentImage.belongsTo(Rent, { foreignKey: "rentId" });
Rent.hasMany(RentImage, { foreignKey: "rentId" });

module.exports = RentImage;
