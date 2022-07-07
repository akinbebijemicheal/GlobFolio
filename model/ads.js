const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');

const Ads = db.define('Ads', {
    id :{
        type: Sequelize.STRING(10),
        autoincrement: false,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => nanoid(10)
    },
    title: {
        type: Sequelize.STRING
    },
    ref_link: {
        type: Sequelize.STRING
    },
    img_id: {
        type: Sequelize.STRING
    },
    img_url:{
        type: Sequelize.STRING
    }
}, {timestamps: true});

// Ads.belongsTo(User, {foreignKey: 'userid'})
// User.hasMany(Ads, {foreignKey: 'userid'});


module.exports = Ads