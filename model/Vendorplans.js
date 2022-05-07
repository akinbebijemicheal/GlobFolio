
const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');

const VendorPlan = db.define('vendorplan', {
    id: {
        type: Sequelize.STRING(10),
        autoincrement: false,
        allowNull: false,
        primaryKey: true,
        defaultValue: () => nanoid(10)
    },
    sub_type:{
        type: Sequelize.ENUM,
        values: ["free", "basic", "standard", "premium"],
      defaultValue: null
    },
    price: {
      type: Sequelize.STRING,
    },
    interval: {
      type: Sequelize.STRING,
    },
    plan_id: {
      type: Sequelize.STRING,
    },
    plan_code:{
      type: Sequelize.STRING,
    },
    page_url: {
      type: Sequelize.STRING,
    },
    page_id: {
      type: Sequelize.STRING,
    },
},{timestamps: true});

module.exports = VendorPlan;