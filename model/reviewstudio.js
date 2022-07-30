const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const Studio = require('./studio_book');
const User = require('./user');

const StudioReview = db.define('studioreview', {
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
    studioId: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'studios',
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


StudioReview.belongsTo(Studio, {foreignKey: 'studioId'})
Studio.hasMany(StudioReview, {foreignKey: 'studioId'});

StudioReview.belongsTo(User, {foreignKey: 'userId'})
User.hasMany(StudioReview, {foreignKey: 'userId'});

module.exports = StudioReview;