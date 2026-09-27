const conn = require('../connect');
const { DataTypes } = require('sequelize');

const BillSaleModel = conn.define("billSales", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  payDate: {
    type: DataTypes.DATE,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "open",
    allowNull: false,
  },
  userId: {
    type: DataTypes.BIGINT,
  },
});

BillSaleModel.sync(); // สร้างตารางที่ยังไม่มีเท่านั้น ห้าม alter: .env ชี้ไป DB production

module.exports = BillSaleModel;