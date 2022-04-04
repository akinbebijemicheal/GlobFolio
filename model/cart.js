const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');
const Product = require('./product')

const Cart = db.define('cart', {
    id :{
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
    productid: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'products',
            key: 'id',
        }
    },
    qty:{
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },

},{
    timestamps: true
});

Cart.belongsTo(User, {foreignKey: 'userid'})
User.hasMany(Cart, {foreignKey: 'userid'});
Cart.hasMany(Product, {foreignKey: 'productid'})
Product.belongsTo(Cart, {foreignKey: 'productid'})


module.exports = Cart;