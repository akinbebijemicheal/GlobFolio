const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');
const Restaurant = require('./restuarant')
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
        type: Sequelize.TEXT
    },
    ingredients: {
        type: Sequelize.TEXT
    },
    restuarantId:{
        type: Sequelize.STRING,
        references:{ 
            model: 'restuarants',
            key: 'id',
        }
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
    // toppings_price: {
    //     type: Sequelize.TEXT
    // },
    link: {
        type: Sequelize.STRING
    }
}, {timestamps: true});


Food.belongsTo(User, {foreignKey: 'userid'})
User.hasMany(Food, {foreignKey: 'userid'});
Food.belongsTo(Restaurant, {foreignKey: 'restuarantId'})
Restaurant.hasMany(Food, {foreignKey: 'restuarantId'});

module.exports = Food;