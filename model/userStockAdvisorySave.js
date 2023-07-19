const Sequelize = require("sequelize");
// const sequelise = require("../config/database/connection");
const db = require("../config/config");
const User = require("./user");
const StockAdvisory = require("./stockAdvisory");


const StockAdvisorySave = db.define(
  "userStockAdvisorySave",
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
    stockAdvisoryId: {
      type: Sequelize.UUID,
      allowNull: true,
    },
  },
  { paranoid: true }
);

StockAdvisorySave.belongsTo(User, { foreignKey: "userId" });
User.hasMany(StockAdvisorySave, { foreignKey: "userId" });


StockAdvisorySave.belongsTo(StockAdvisory, { foreignKey: "stockAdvisoryId" });
StockAdvisory.hasMany(StockAdvisorySave, { foreignKey: "stockAdvisoryId" });


module.exports = StockAdvisorySave;
