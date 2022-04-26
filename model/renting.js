const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');
//const Cart = require('./cart')

const Rent = db.define('rent', {
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
        defaultValue: "rent"
    },
    description: {
        type: Sequelize.STRING
    },
    location: {
        type: Sequelize.STRING
    },
    per_time: {
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


Rent.belongsTo(User, {foreignKey: 'userid'})
User.hasMany(Rent, {foreignKey: 'userid'});

module.exports = Rent;