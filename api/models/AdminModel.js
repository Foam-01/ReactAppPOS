const e = require("cors");
const conn = require("../connect");
const { DataTypes } = require("sequelize");
const AdminModel = conn.define("admins", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  usr: {
    type: DataTypes.STRING,
  },
  pwd: {
    type: DataTypes.STRING,
  },
  level: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
});

AdminModel.sync({ alter: true });

module.exports = AdminModel;
