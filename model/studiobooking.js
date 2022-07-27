const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');
const Studio = require('./studio_book');
const Transaction = require('./usertransactions');

const StudioBooking = db.define('studiobooking', {
    id: {
        type: Sequelize.STRING(10),
        autoincrement: false,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => nanoid(10)
    },
    studioId:{
        type: Sequelize.STRING(10),
        references:{
            model: 'studios',
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
    start_date:{
        type: Sequelize.DATEONLY
    },
    end_date:{
        type: Sequelize.DATEONLY
    },
    transaction_url: {
        type: Sequelize.STRING,
    },
    ref_no:{
        type: Sequelize.STRING,
    },
    access_code:{
        type: Sequelize.STRING,
    },
    commission:{
        type: Sequelize.FLOAT
    }

}, {timestamps: true});


StudioBooking.belongsTo(Studio, {foreignKey: "studioId"});
Studio.hasMany(StudioBooking, {foreignKey: "studioId"});

StudioBooking.belongsTo(User, {foreignKey: 'buyerId'});
User.hasMany(StudioBooking, {foreignKey: 'buyerId'});

StudioBooking.belongsTo(Transaction, {foreignKey: 'transactionId'});
Transaction.hasOne(StudioBooking, {foreignKey: 'transactionId'});

module.exports = StudioBooking;