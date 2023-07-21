const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');


const Picture = db.define('picture', {
    id: {
        type: Sequelize.STRING(10),
        autoincrement: false,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => nanoid(10)
    },
    userid: {
        type: Sequelize.UUID,
        references:{ 
            model: 'users',
            key: 'id',
        }
    },
    content_id: {
        type: Sequelize.STRING
    },
    secure_url: {
        type: Sequelize.STRING,
    }
}, {timestamps: true});

Picture.belongsTo(User, {foreignKey: 'userid'})
User.hasOne(Picture, {foreignKey: 'userid'});

module.exports = Picture;