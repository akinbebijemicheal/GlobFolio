const Sequelize = require('sequelize');
require('dotenv').config();

const database = process.env.DATABASE;
const username = process.env.USER;
const password = null;

var db = new Sequelize(database, username, password, {
    host: 'localhost',
    dialect: 'mysql',
  
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
});

module.exports = db