const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');
const Product = require('./product')

const CartItem = db.define('cartitem', {
    id :{
        type: Sequelize.STRING(10),
        autoincrement: false,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => nanoid(10)
    },
    userid: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'users',
            key: 'id',
        }
    },
    productid: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'products',
            key: 'id',
        }
    },
    qty:{
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    price:{
        type: Sequelize.STRING
    }

},{
    timestamps: true
});

CartItem.belongsTo(User, {foreignKey: 'userid'})
User.hasMany(CartItem, {foreignKey: 'userid'});
CartItem.hasMany(Product, {foreignKey: 'productid'})
Product.belongsTo(CartItem, {foreignKey: 'productid'})
CartItem.belongsTo(Cart, {foreignKey: 'cartitemid'})


module.exports = Cart;