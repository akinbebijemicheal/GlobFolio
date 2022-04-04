const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');
const Cart = require('./cart')

const Order = db.define('order', {
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
    cartid: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'carts',
            key: 'id',
        }
    },
    address: {
        type: Sequelize.STRING
    },
    delivery: {
        type: Sequelize.STRING
    }
}, {timestamps: true});

Order.belongsTo(User, {foreignKey: 'userid'})
User.hasMany(Order, {foreignKey: 'userid'});
Order.hasMany(Cart, {foreignKey: 'cartid'})
Cart.belongsTo(Order, {foreignKey: 'cartid'})


module.exports = Order