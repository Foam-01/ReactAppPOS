const conn = require('../connect');
const { DataTypes } = require('sequelize');

const ProductModel = conn.define("products", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  barcode: {
    type: DataTypes.STRING,
  },
  name: {
    type: DataTypes.STRING,
  },
  cost: {
    type: DataTypes.BIGINT,
  },
  price: {
    type: DataTypes.BIGINT,
  },
  detail: {
    type: DataTypes.STRING,
  },
  userId: {
    type: DataTypes.BIGINT,
  },
});

ProductModel.sync(); // สร้างตารางที่ยังไม่มีเท่านั้น ห้าม alter: .env ชี้ไป DB production

module.exports  = ProductModel;