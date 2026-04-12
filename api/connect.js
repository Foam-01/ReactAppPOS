const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("db_workshop_pos", "postgres", "1234", {
  host: "db",
  dialect: "postgres",
  logging: false,
});

module.exports = sequelize;
