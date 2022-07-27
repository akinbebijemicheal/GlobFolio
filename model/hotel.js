const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');


const Hotel = db.define('hotel', {
    id: {
        type: Sequelize.STRING(10),
        autoincrement: false,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => nanoid(10)
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING
    },
    amenities:{
        type: Sequelize.TEXT
    },
    location: {
        type: Sequelize.STRING
    },
    rating: {
        type: Sequelize.FLOAT
    }
}, {timestamps: true});

module.exports = Hotel;