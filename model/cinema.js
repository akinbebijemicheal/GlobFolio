const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');

const Cinema = db.define('cinema', {
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
    view_date: {
        type: Sequelize.DATE
    },
    genre: {
        type: Sequelize.STRING
    },
    storyline: {
        type: Sequelize.STRING
    },
    cast: {
        type: Sequelize.STRING
    },
    duration: {
        type: Sequelize.STRING
    },
    seat:{
        type: Sequelize.INTEGER
    },
    age_rate: {
        type: Sequelize.STRING
    },
    price: {
        type: Sequelize.STRING,
    }, 
    rating: {
        type: Sequelize.FLOAT
    },
    morning: {
        type: Sequelize.TIME,
    },
    afternoon: {
        type: Sequelize.TIME,
    },
    evening:{
        type: Sequelize.TIME,
    }
}, {timestamps: true});

module.exports = Cinema;