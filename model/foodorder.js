const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');
// const Cart = require('./cartItem')

const Order = db.define('foodorder', {
    id :{
        type: Sequelize.STRING(10),
        autoincrement: false,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => nanoid(10)
    },
    userId: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'users',
            key: 'id',
        }
    },
    new: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    paid:{
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    address: {
        type: Sequelize.STRING
    },
    phone_no: {
        type: Sequelize.STRING
    },
    sub_total: {
        type: Sequelize.BIGINT
    },
    note:{
        type: Sequelize.TEXT
    },
    status: {
        type: Sequelize.ENUM,
        values: ["in_progress", "delivered", "cancelled"],
    },
    checkout_url:{
        type: Sequelize.STRING
    },
    ref_no:{
        type: Sequelize.STRING
    },
    access_code:{
        type: Sequelize.STRING
    }
}, {timestamps: true});

Order.belongsTo(User, {foreignKey: 'userId'})
User.hasMany(Order, {foreignKey: 'userId'});


module.exports = Order