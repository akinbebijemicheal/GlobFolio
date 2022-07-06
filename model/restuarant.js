// const Sequelize = require('sequelize');
// const db = require('../config/config');
// const {nanoid} = require('nanoid');
// const User = require('./user');


// const Restaurant = db.define('restuarant', {
//     id: {
//         type: Sequelize.STRING(10),
//         autoincrement: false,
//         allowNull: false,
//         primaryKey: true,
//         defaultValue: () => nanoid(10)
//     },
//     userId: {
//         type: Sequelize.STRING,
//         references:{ 
//             model: 'users',
//             key: 'id',
//         }
//     },
//     restuarant: {
//         type: Sequelize.TEXT,
//     },
//     address:{
//         type: Sequelize.TEXT,
//     },
//     contact_no:{
//         type: Sequelize.STRING,
//     }
// },
// {timestamps: true});

// Restaurant.belongsTo(User, {foreignKey: 'userId'})
// User.hasMany(Restaurant, {foreignKey: 'userId'});




// module.exports = Restaurant;
