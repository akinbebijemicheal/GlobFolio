const Sequelize = require("sequelize");
const db = require("../config/config");
const { nanoid } = require("nanoid");

const Feedback = db.define(
  "feedback",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
      primaryKey: true,
    },
    rating: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    subject: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    message: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  },
  { timestamps: true }
);

module.exports = Feedback;
