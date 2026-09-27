const conn = require('../connect');
const { DataTypes } = require('sequelize');

const BillSaleDetailModel = conn.define("billSaleDetails", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  billSaleId: {
    type: DataTypes.BIGINT,
  },
  productId: {
    type: DataTypes.BIGINT,
  },
  qty: {
    type: DataTypes.BIGINT,
  },
  price: {
    type: DataTypes.BIGINT,
  },
  userId: {
    type: DataTypes.BIGINT,
  },
});

BillSaleDetailModel.sync(); // สร้างตารางที่ยังไม่มีเท่านั้น ห้าม alter: .env ชี้ไป DB production

module.exports = BillSaleDetailModel;