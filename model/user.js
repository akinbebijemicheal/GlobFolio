const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');

const User = db.define('user', {
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
        unique: true,
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
    address: {
        type: Sequelize.STRING
    },
    role: {
        type: Sequelize.ENUM,
        values: ['user', "vendor", 'admin'],
        defaultValue: 'user'
    },
    serviceType: {
        type: Sequelize.ENUM,
        values: ["food", "studio", "hotel", "cinema", "vr_gaming", "rent", "consumer"],
        defaultValue: "consumer"
    },
    email_verify: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    business: {
        type: Sequelize.STRING,
        defaultValue: null,
    },
    sub_status: {
        type: Sequelize.ENUM,
        values: ['active', 'inactive'],
        defaultValue: 'inactive'
    }
},
{timestamps: true});

module.exports = User;
