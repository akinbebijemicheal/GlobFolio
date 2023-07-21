const Sequelize = require('sequelize');
const db = require('../config/config');
const {nanoid} = require('nanoid');

const User = db.define(
  "user",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
      primaryKey: true,
    },
    fullname: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      min: 6,
      max: 20,
    },
    phone_no: {
      type: Sequelize.STRING,
    },
    gender: {
      type: Sequelize.STRING,
    },
    country: {
      type: Sequelize.STRING,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    token: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    userType: {
      type: Sequelize.ENUM,
      values: ["user", "admin", "moderator", "publisher"],
      defaultValue: "user",
    },
    email_verify: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    referralId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    aboutUs: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    isSuspended: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    reason_for_suspension: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    app: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    facebook_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    google_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    apple_id: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    planId: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    hasActiveSubscription: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    },
    expiredAt: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  { timestamps: true }
);

module.exports = User;
