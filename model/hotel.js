const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');
//const Cart = require('./cart')

const Hotel = db.define('hotel', {
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
        defaultValue: "hotel"
    },
    description: {
        type: Sequelize.STRING
    },
    location: {
        type: Sequelize.STRING
    },
    img_id: {
        type: Sequelize.STRING,
    },
    img_url: {
        type: Sequelize.STRING
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


Hotel.belongsTo(User, {foreignKey: 'userid'})
User.hasMany(Hotel, {foreignKey: 'userid'});

module.exports = Hotel;