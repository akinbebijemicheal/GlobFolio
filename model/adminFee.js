const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');

const Fee = db.define('adminfee', {
    id: {
        type: Sequelize.STRING(10),
        autoincrement: false,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => nanoid(10)
    },
   type:{
       type: Sequelize.STRING
   },
   description:{
       type: Sequelize.STRING
   },
   value:{
       type: Sequelize.FLOAT
   }
},
{timestamps: true});

module.exports = Fee;
