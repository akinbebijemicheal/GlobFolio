const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const Hotel = require('./hotel');
const User = require('./user');

const HotelReview = db.define('hotelreview', {
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
    userId:{
        type: Sequelize.STRING,
        references:{ 
            model: 'users',
            key: 'id',
        }
    },
    rating: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validator:{
            min: 0,
            max: 5
        }
    },
    comment: {
        type: Sequelize.TEXT,
        defaultValue: null
    }
    
});


HotelReview.belongsTo(Hotel, {foreignKey: 'hotelId'})
Hotel.hasMany(HotelReview, {foreignKey: 'hotelId'});

HotelReview.belongsTo(User, {foreignKey: 'userId'})
User.hasMany(HotelReview, {foreignKey: 'userId'});
module.exports = HotelReview;