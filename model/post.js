const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');

const Post = db.define('post', {
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
    title: {
        type: Sequelize.STRING
    },
    serviceType: {
        type: Sequelize.ENUM,
        values: ["food", "studio", "hotel", "cinema", "vr_gaming", "rent"]
    },
    description: {
        type: Sequelize.STRING
    },
    img_id: {
        type: Sequelize.STRING,
    },
    img_url: {
        type: Sequelize.STRING
    },
    price: {
        type: Sequelize.STRING
    }, 
    rate: {
        type: Sequelize.DECIMAL
    }
}, {timestamps: true});


Post.belongsTo(User, {foreignKey: 'userid'})
User.hasMany(Post, {foreignKey: 'userid'});

module.exports = Post;