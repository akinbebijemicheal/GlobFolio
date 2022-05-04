const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const Hotel = require('./hotel');
//const Cart = require('./cart')

const HotelExtra = db.define('hotelextra', {
    id: {
        type: Sequelize.STRING(10),
        autoincrement: false,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => nanoid(10)
    },
    hotelId: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'hotels',
            key: 'id',
        }
    },
    room:{
        type: Sequelize.TEXT
    },
    pricing: {
        type: Sequelize.TEXT
    }
    
}, {timestamps: true});


HotelExtra.belongsTo(Hotel, {foreignKey: 'hotelId'})
Hotel.hasMany(HotelExtra, {foreignKey: 'hotelId'});

module.exports = HotelExtra;