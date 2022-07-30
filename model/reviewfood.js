const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const Food = require('./food');
const User = require('./user');

const FoodReview = db.define('foodreview', {
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
    foodId: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'food',
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


FoodReview.belongsTo(Food, {foreignKey: 'foodId'})
Food.hasMany(FoodReview, {foreignKey: 'foodId'});

FoodReview.belongsTo(User, {foreignKey: 'userId'})
User.hasMany(FoodReview, {foreignKey: 'userId'});

module.exports = FoodReview;