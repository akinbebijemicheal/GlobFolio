const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');
const Food = require('./food');
const FoodExtra = require('./foodextras');
const FoodPackage = require('./foodpackaging');
const FoodOrder = require('./foodorder');
const CartItem = require('./cartItem');

const CartItemExtra = db.define(
  "fooditemextra",
  {
    id: {
      type: Sequelize.STRING(10),
      autoincrement: false,
      allowNull: false,
      primaryKey: true,
      defaultValue: () => nanoid(10),
    },
    // cartId: {
    //   type: Sequelize.STRING,
    //   references: {
    //     model: "fooditems",
    //     key: "id",
    //   },
    // },
    userId: {
      type: Sequelize.STRING(10),
      references: {
        model: "users",
        key: "id",
      },
    },
    foodId: {
      type: Sequelize.STRING(10),
      references: {
        model: "food",
        key: "id",
      },
    },
    // foodextraId: {
    //   // type: Sequelize.STRING(10),
    //   // references:{
    //   //     model: 'foodextras',
    //   //     key: 'id',
    //   // }
    //   //   allowNull: true,
    //   //   type: Sequelize.TEXT,
    //   //   get: function () {
    //   //     if (this.getDataValue("foodExtras") !== undefined) {
    //   //       return JSON.parse(this.getDataValue("foodExtras"));
    //   //     }
    //   //   },
    //   //   set(value) {
    //   //     this.setDataValue("foodExtras", JSON.stringify(value));
    //   //   },
    //   type: Sequelize.STRING,
    //   allowNull: true,
    // },
    qty: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    price: {
      type: Sequelize.BIGINT,
    },
  },
  {
    timestamps: true,
  }
);

CartItemExtra.belongsTo(User, { foreignKey: "userId" });
User.hasMany(CartItemExtra, { foreignKey: "userId" });

CartItem.hasMany(CartItemExtra, { foreignKey: "cartItemId" });
CartItemExtra.belongsTo(CartItem, { foreignKey: "cartItemId" });

CartItemExtra.belongsTo(FoodExtra, { foreignKey: "foodextrasId" });
FoodExtra.hasMany(CartItemExtra, { foreignKey: "foodextrasId" });

// CartItem.belongsTo(FoodPackage, {foreignKey: 'foodpackageId'});
// FoodPackage.hasMany(CartItem, {foreignKey: 'foodpackageId'});

// FoodOrder.hasMany(CartItem, {foreignKey: 'orderId'});
// CartItem.belongsTo(FoodOrder, {foreignKey: 'orderId'});


module.exports = CartItemExtra;