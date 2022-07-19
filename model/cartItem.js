const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');
const Food = require('./food');
const FoodExtra = require('./foodextras');
const FoodPackage = require('./foodpackaging');
const FoodOrder = require('./foodorder');

const CartItem = db.define('fooditem', {
    id :{
        type: Sequelize.STRING(10),
        autoincrement: false,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => nanoid(10)
    },
    ordered:{
        type: Sequelize.BOOLEAN,
        default: false
    },
    userId: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'users',
            key: 'id',
        }
    },
    foodId: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'food',
            key: 'id',
        }
    },
    foodextrasId: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'foodextras',
            key: 'id',
        }
    },
    foodpackageId: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'foodpackagings',
            key: 'id',
        }
    },
    orderId:{
        type: Sequelize.STRING(10),
        references:{ 
            model: 'foodorders',
            key: 'id',
        }
    },
    qty:{
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    price:{
        type: Sequelize.BIGINT
    }

},{
    timestamps: true
});

CartItem.belongsTo(User, {foreignKey: 'userId'})
User.hasMany(CartItem, {foreignKey: 'userId'});

Food.hasMany(CartItem, {foreignKey: 'foodId'})
CartItem.belongsTo(Food, {foreignKey: 'foodId'})

CartItem.belongsTo(FoodExtra, {foreignKey: 'foodextrasId'});
FoodExtra.hasMany(CartItem, {foreignKey: 'foodextrasId'});

CartItem.belongsTo(FoodPackage, {foreignKey: 'foodpackageId'});
FoodPackage.hasMany(CartItem, {foreignKey: 'foodpackageId'});

FoodOrder.hasMany(CartItem, {foreignKey: 'orderId'});
CartItem.belongsTo(FoodOrder, {foreignKey: 'orderId'});


module.exports = CartItem;