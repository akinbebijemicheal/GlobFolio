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
    userid: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'users',
            key: 'id',
        }
    },
    sub_type: {
        type: Sequelize.ENUM,
        values: ["free", "basic", "standard", "premium"]
    },
    expire_date: {
        type: Sequelize.DATEONLY
    }
},{timestamps: true});

Subscription.belongsTo(User, {foreignKey: 'userid'})
User.hasMany(Subscription, {foreignKey: 'userid'});

module.exports = Subscription;