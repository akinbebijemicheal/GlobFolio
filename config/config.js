const Sequelize = require('sequelize');
require('dotenv').config();

const database = 'deependappcom_database' || process.env.DATABASE;
const username = 'root' || process.env.USER;
const password = 'root' || process.env.PASSWORD;
const host = 'localhost' || process.env.HOST

const url = process.env.DB_URL


var db = new Sequelize(database, username, password, {
    host: host,
    port: 8889,
    dialect: 'mysql',
    pool: {
      maxConnections: 10,
      minConnections: 0,
      maxIdleTime: 10000
    }
});

module.exports = db