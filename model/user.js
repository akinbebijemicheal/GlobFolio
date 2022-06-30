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
        allowNull: true
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
        values: ['user', 'admin', "moderator", "publisher"],
        defaultValue: 'user'
    },
    email_verify: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
},
{timestamps: true});

module.exports = User;
