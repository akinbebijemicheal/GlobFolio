/*const Sequelize = require('sequelize');
const db = require('../config/config');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

db.define("Session", {
    sid: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    userId: Sequelize.STRING,
    expires: Sequelize.DATE,
    data: Sequelize.TEXT,
    flash: Sequelize.STRING
  });
  
  function extendDefaultFields(defaults, session) {
    return {
      data: defaults.data,
      expires: defaults.expires,
      userId: session.userId,
    };
  }
  
  var store = new SequelizeStore({
    db: db,
    table: "Session",
    extendDefaultFields: extendDefaultFields,
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: 24 * 60 * 60 * 1000,
  });

  module.exports = {
      session,
      store
  } */