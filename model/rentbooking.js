const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');
const Rent = require('./renting');
const Transaction = require('./usertransactions');

const RentBooking = db.define('rentbooking', {
    id: {
        type: Sequelize.STRING(10),
        autoincrement: false,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => nanoid(10)
    },
    rentId:{
        type: Sequelize.STRING(10),
        references:{
            model: 'rents',
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
    pickup_date:{
        type: Sequelize.DATEONLY
    },
    delivery_date:{
        type: Sequelize.DATEONLY
    },
    rent_days:{
        type: Sequelize.INTEGER,
    },
    location:{
        type: Sequelize.STRING,
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


RentBooking.belongsTo(Rent, {foreignKey: "rentId"});
Rent.hasMany(RentBooking, {foreignKey: "rentId"});

RentBooking.belongsTo(User, {foreignKey: 'buyerId'});
User.hasMany(RentBooking, {foreignKey: 'buyerId'});

RentBooking.belongsTo(Transaction, {foreignKey: 'transactionId'});
Transaction.hasOne(RentBooking, {foreignKey: 'transactionId'});

module.exports = RentBooking;