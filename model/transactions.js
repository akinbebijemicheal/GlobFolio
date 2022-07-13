
// const Sequelize = require('sequelize');
// const db = require('../config/config');
// const {nanoid} = require('nanoid');
// const User = require('./user');

// const Transaction = db.define('transaction', {
//     id: {
//         type: Sequelize.STRING(10),
//         autoincrement: false,
//         allowNull: false,
//         primaryKey: true,
//         defaultValue: () => nanoid(10)
//     },
//     userId:{
//         type: Sequelize.STRING,
//         references:{ 
//         model: 'users',
//         key: 'id',
//     }
//     },
//     ref_no: {
//         type: Sequelize.STRING
//     },
//     sub_type: {
//         type: Sequelize.STRING
//     },
//     price: {
//         type: Sequelize.STRING
//     },
//     interval: {
//         type: Sequelize.STRING
//     },
//     status:{
//     type: Sequelize.STRING
//     },
//     start_date: {
//         type: Sequelize.DATE
//     },
//     end_date:{
//         type: Sequelize.DATE
//     }
// },{timestamps: true});

// Transaction.belongsTo(User, {foreignKey: 'userId'})
// User.hasMany(Transaction, {foreignKey: 'userId'});

// module.exports = Transaction;



       