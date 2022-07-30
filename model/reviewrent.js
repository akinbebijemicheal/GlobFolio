const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const Rent = require('./renting');
const User = require('./user');

const RentReview = db.define('rentreview', {
    id: {
        type: Sequelize.STRING(10),
        autoincrement: false,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => nanoid(10)
    },
    userId:{
        type: Sequelize.STRING,
        references:{ 
            model: 'users',
            key: 'id',
        }
    },
    rentId: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'rents',
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


RentReview.belongsTo(Rent, {foreignKey: 'rentId'})
Rent.hasMany(RentReview, {foreignKey: 'rentId'});

RentReview.belongsTo(User, {foreignKey: 'userId'})
User.hasMany(RentReview, {foreignKey: 'userId'});

module.exports = RentReview;