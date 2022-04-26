const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');
//const Cart = require('./cart')

const Studio = db.define('studio', {
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
        defaultValue: "studio", 
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
    equipment: {
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


Studio.belongsTo(User, {foreignKey: 'userid'})
User.hasMany(Studio, {foreignKey: 'userid'});

module.exports = Studio;