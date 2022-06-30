const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');

const Rent = db.define('rent', {
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
        type: Sequelize.TEXT
    },
    location: {
        type: Sequelize.STRING
    },
    equipment:{
        type: Sequelize.TEXT
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
    }
}, {timestamps: true});

module.exports = Rent;