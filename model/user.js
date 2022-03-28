const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');

const User = db.define('User', {
    id: {
        type: Sequelize.STRING(10),
        autoincrement: false,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => nanoid(10)
    },
    fullname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        min: 6,
        max: 20
    },
    phone_no: {
        type: Sequelize.STRING
    },
    country: {
      type: Sequelize.STRING  
    },
    role: {
        type: Sequelize.ENUM,
        values: ['user', "vendor", 'admin'],
        defaultValue: 'user'
    },
    serviceType: {
        type: Sequelize.ENUM,
        values: ["food", "studio", "hotel", "cinema", "vr_gaming", "consumer"],
        defaultValue: "consumer"
    },
    verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
},
{timestamps: true});

module.exports = User;
