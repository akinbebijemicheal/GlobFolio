const Sequelize = require("sequelize");
const db = require('../config/config');

const Payment = db.define(
  "payments",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
      primaryKey: true
    },
    userId: {
      allowNull: true,
      type: Sequelize.UUID
    },
    payment_category: {
      allowNull: true,
      type: Sequelize.STRING
    },
    payment_reference: {
      allowNull: true,
      type: Sequelize.STRING
    },
    amount: {
      type: Sequelize.FLOAT,
      allowNull: true
    }
  },
  { paranoid: true }
);

module.exports = Payment;
