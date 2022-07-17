const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');
const Cinema = require('./cinema');
const Transaction = require('./usertransactions');

const CinemaBooking = db.define('cinemabooking', {
    id: {
        type: Sequelize.STRING(10),
        autoincrement: false,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => nanoid(10)
    },
    cinemaId:{
        type: Sequelize.STRING(10),
        references:{
            model: 'cinemas',
            key: 'id'
        }
    },
    buyerId: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'users',
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
}, {timestamps: true});


CinemaBooking.belongsTo(Cinema, {foreignKey: "cinemaId"});
Cinema.hasMany(CinemaBooking, {foreignKey: "cinemaId"});

CinemaBooking.belongsTo(User, {foreignKey: 'buyerId'});
User.hasMany(CinemaBooking, {foreignKey: 'buyerId'});

CinemaBooking.belongsTo(Transaction, {foreignKey: 'transactionId'});
Transaction.hasOne(CinemaBooking, {foreignKey: 'transactionId'});

module.exports = CinemaBooking;