const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');
const Game = require('./vr_gaming');
const Transaction = require('./usertransactions');

const GameBooking = db.define('gamebooking', {
    id: {
        type: Sequelize.STRING(10),
        autoincrement: false,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => nanoid(10)
    },
    gameId:{
        type: Sequelize.STRING(10),
        references:{
            model: 'gamings',
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
    },
    commission:{
        type: Sequelize.FLOAT
    }

}, {timestamps: true});


GameBooking.belongsTo(Game, {foreignKey: "gameId"});
Game.hasMany(GameBooking, {foreignKey: "gameId"});

GameBooking.belongsTo(User, {foreignKey: 'buyerId'});
User.hasMany(GameBooking, {foreignKey: 'buyerId'});

GameBooking.belongsTo(Transaction, {foreignKey: 'transactionId'});
Transaction.hasOne(GameBooking, {foreignKey: 'transactionId'});

module.exports = GameBooking;