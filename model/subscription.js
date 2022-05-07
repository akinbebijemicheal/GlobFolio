const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');

const Subscription = db.define('subscription', {
    id: {
        type: Sequelize.STRING(10),
        autoincrement: false,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => nanoid(10)
    },
    userId: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'users',
            key: 'id',
        }
    },
    sub_type: {
        type: Sequelize.ENUM,
        values: ["free", "basic", "standard", "premium"],
        defaultValue: null
    },
    status:{
        type: Sequelize.ENUM,
        values: ["active", "expired"],
        defaultValue: null
    },
    expire_date: {
        type: Sequelize.DATE
    }
},{timestamps: true});

Subscription.belongsTo(User, {foreignKey: 'userId'})
User.hasOne(Subscription, {foreignKey: 'userId'});

module.exports = Subscription;