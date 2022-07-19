// const Sequelize = require("sequelize");
// const db = require("../config/config");
// const { nanoid } = require("nanoid");
// const Cinema = require("./cinema");

// const CinemaTime = db.define("cinematime", {
//   id: {
//     type: Sequelize.STRING(10),
//     autoincrement: false,
//     allowNull: false,
//     primaryKey: true,
//     defaultValue: () => nanoid(10),
//   },
//   cinemaId: {
//     type: Sequelize.STRING(10),
//     references: {
//       model: 'cinemas',
//       key: 'id',
//     },
//   },
//   morning: {
//     type: Sequelize.TIME,
//   },
//   afternoon: {
//     type: Sequelize.TIME,
//   },
//   evening:{
//     type: Sequelize.TIME,
//   }
// });

// CinemaTime.belongsTo(Cinema, { foreignKey: "cinemaId" });
// Cinema.hasMany(CinemaTime, { foreignKey: "cinemaId" });

// module.exports = CinemaTime;
