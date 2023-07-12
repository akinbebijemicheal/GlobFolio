const Sequelize = require("sequelize");
const db = require('../config/config');
const User = require("./user");

const Transaction = db.define(
  "transactions",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
      primaryKey: true
    },
    TransactionId: {
      type: Sequelize.STRING,
      allowNull: true
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: true
    },
    amount: {
      type: Sequelize.FLOAT,
      allowNull: true
    },
    status: {
      type: Sequelize.STRING,
      allowNull: true
    },
    type: {
      type: Sequelize.STRING,
      allowNull: true
    },
    paymentReference: {
      type: Sequelize.STRING,
      allowNull: true
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true
    }
  },
  { paranoid: true }
);

User.hasMany(Transaction, {
  foreignKey: "userId",
  as: "transactions"
});

Transaction.belongsTo(User, {
  foreignKey: "userId",
  as: "user"
});

module.exports = Transaction;
