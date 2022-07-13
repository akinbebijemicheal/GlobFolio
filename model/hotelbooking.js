const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const Hotel = require('./hotel');
const User = require('./user');
const HotelExtra = require('./hotelextras');
const Transaction = require('./usertransactions');

const HotelBooking = db.define('hotelbooking', {
    id: {
        type: Sequelize.STRING(10),
        autoincrement: false,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => nanoid(10)
    },
    buyerId: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'users',
            key: 'id',
        }
    },
    hotelId: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'hotels',
            key: 'id',
        }
    },
    hotelextrasId: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'hotelextras',
            key: 'id',
        }
    },
    transactionId: {
        type: Sequelize.STRING,
        references:{ 
            model: 'usertransactions',
            key: 'id',
        }
    },
    quantity:{
        type: Sequelize.INTEGER,
    },
    scheduled_date:{
        type: Sequelize.DATEONLY
    },
    scheduled_time:{
        type: Sequelize.TIME
    },
    transaction_url: {
        type: Sequelize.STRING,
    },
    ref_no:{
        type: Sequelize.STRING,
    },
    access_code:{
        type: Sequelize.STRING,
    }

    
});


HotelBooking.belongsTo(Hotel, {foreignKey: 'hotelId'})
Hotel.hasMany(HotelBooking, {foreignKey: 'hotelId'});

HotelBooking.belongsTo(User, {foreignKey: 'buyerId'});
User.hasMany(HotelBooking, {foreignKey: 'buyerId'});

HotelBooking.belongsTo(HotelExtra, {foreignKey: 'hotelextrasId'});
HotelExtra.hasMany(HotelBooking, {foreignKey: 'hotelextrasId'});

HotelBooking.belongsTo(Transaction, {foreignKey: 'transactionId'});
Transaction.hasOne(HotelBooking, {foreignKey: 'transactionId'});



module.exports = HotelBooking;