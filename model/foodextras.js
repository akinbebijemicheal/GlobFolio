const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const Food = require('./food');

const FoodExtra = db.define('foodextra', {
    id: {
        type: Sequelize.STRING(10),
        autoincrement: false,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => nanoid(10)
    },
    foodId: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'food',
            key: 'id',
        }
    },
    topping: {
        type: Sequelize.TEXT
    },
    price: {
        type: Sequelize.TEXT
    }
    
});


FoodExtra.belongsTo(Food, {foreignKey: 'foodId'})
Food.hasMany(FoodExtra, {foreignKey: 'foodId'});

module.exports = FoodExtra;