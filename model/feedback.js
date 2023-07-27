const Sequelize = require("sequelize");
const db = require("../config/config");
const { nanoid } = require("nanoid");
const User = require("./user");

const Feedback = db.define(
  "feedback",
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: true,
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


Feedback.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Feedback, { foreignKey: "userId" });

module.exports = Feedback;
