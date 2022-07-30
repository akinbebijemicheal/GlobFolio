const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const Cinema = require('./cinema');
const User = require('./user');

const CinemaReview = db.define('cinemareview', {
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
    cinemaId: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'cinemas',
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


CinemaReview.belongsTo(Cinema, {foreignKey: 'cinemaId'})
Cinema.hasMany(CinemaReview, {foreignKey: 'cinemaId'});

CinemaReview.belongsTo(User, {foreignKey: 'userId'})
User.hasMany(CinemaReview, {foreignKey: 'userId'});

module.exports = CinemaReview;