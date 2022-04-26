const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');
//const Cart = require('./cart')

const Food = db.define('food', {
    id: {
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
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    productType: {
        type: Sequelize.STRING,
        defaultValue: "food" 
    },
    description: {
        type: Sequelize.STRING
    },
    ingredients: {
        type: Sequelize.STRING
    },
    img_id: {
        type: Sequelize.TEXT,
    },
    img_url: {
        type: Sequelize.TEXT
    },
    price: {
        type: Sequelize.STRING,
    }, 
    link: {
        type: Sequelize.STRING
    }
}, {timestamps: true});


Food.belongsTo(User, {foreignKey: 'userid'})
User.hasMany(Food, {foreignKey: 'userid'});

module.exports = Food;