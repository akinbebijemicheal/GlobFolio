const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');
//const Cart = require('./cart')

const Product = db.define('product', {
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
        type: Sequelize.ENUM,
        values: ["food", "studio", "hotel", "cinema", "game", "rent"]
    },
    description: {
        type: Sequelize.STRING
    },
    ingredients: {
        type: Sequelize.STRING
    },
    view_date: {
        type: Sequelize.DATE
    },
    genre: {
        type: Sequelize.STRING
    },
    location: {
        type: Sequelize.STRING
    },
    storyline: {
        type: Sequelize.STRING
    },
    rating: {
        type: Sequelize.DECIMAL
    },
    cast: {
        type: Sequelize.STRING
    },
    duration: {
        type: Sequelize.STRING
    },
    per_time: {
        type: Sequelize.STRING
    },
    equipment: {
        type: Sequelize.STRING
    },
    age_rate: {
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
    rating: {
        type: Sequelize.FLOAT
    },
    link: {
        type: Sequelize.STRING
    }
}, {timestamps: true});


Product.belongsTo(User, {foreignKey: 'userid'})
User.hasMany(Product, {foreignKey: 'userid'});

module.exports = Product;