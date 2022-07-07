const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');
const User = require('./user');
const CartItem = require('./cartitem')

const Cart = db.define('cart', {
    id :{
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
    cartitemId: {
        type: Sequelize.STRING(10),
        references:{ 
            model: 'cartitems',
            key: 'id',
        }
    }

},{
    timestamps: true
});

Cart.belongsTo(User, {foreignKey: 'userId'})
User.hasMany(Cart, {foreignKey: 'userId'});
Cart.hasMany(CartItem, {foreignKey: 'cartitemId'})
CartItem.belongsTo(Cart, {foreignKey: 'cartitemId'})


module.exports = Cart;