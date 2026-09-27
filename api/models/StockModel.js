const conn = require('../connect');
const { DataTypes } = require('sequelize');
const StockModel = conn.define("stocks", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.BIGINT,
  },
  qty: {
    type: DataTypes.BIGINT,
  },
  userId: {
    type: DataTypes.BIGINT,
  },
});

StockModel.sync(); // สร้างตารางที่ยังไม่มีเท่านั้น ห้าม alter: .env ชี้ไป DB production

module.exports = StockModel;