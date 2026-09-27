const conn = require('../connect');
const { DataTypes } = require('sequelize');
const UserModel = conn.define("users", {
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
  userId: {
    type: DataTypes.BIGINT,
  },
});

UserModel.sync(); // สร้างตารางที่ยังไม่มีเท่านั้น ห้าม alter: .env ชี้ไป DB production

module.exports = UserModel;