const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');

const Message = db.define('message', {
    id: {
        type: Sequelize.STRING(10),
        autoincrement: false,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => nanoid(10)
    },
    userid: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'Users',
            key: 'id',
        }
    },
    reciever: {
        type: Sequelize.STRING
    },
    content: {
        type: Sequelize.STRING
    }
}, {timestamps: true});



Message.belongsTo(User, {foreignKey: 'userid'})
User.hasMany(Message, {foreignKey: 'userid'});

module.exports = Message;