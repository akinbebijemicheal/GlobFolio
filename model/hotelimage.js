const Sequelize = require("sequelize");
const db = require("../config/config");
const { nanoid } = require("nanoid");
const Hotel = require("./hotel");

const HotelImage = db.define("hotelimage", {
  id: {
    type: Sequelize.STRING(10),
    autoincrement: false,
    allowNull: false,
    primaryKey: true,
    defaultValue: () => nanoid(10),
  },
  hotelId: {
    type: Sequelize.STRING(10),
    references: {
      model: "hotels",
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

HotelImage.belongsTo(Hotel, { foreignKey: "hotelId" });
Hotel.hasMany(HotelImage, { foreignKey: "hotelId" });

module.exports = HotelImage;
