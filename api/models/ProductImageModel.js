const conn = require('../connect');
const { DataTypes } = require('sequelize');
// ชื่อตารางในฐานข้อมูลสะกดเป็น productlmages (ตัว L) ตั้งแต่แรก ห้ามเปลี่ยน
// (response ของ API ก็ใช้ key "productlmages" ตามชื่อนี้)
const ProductImageModel = conn.define("productlmages", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.BIGINT,
  },
  imageName: {
    type: DataTypes.STRING,
  },
  isMain: {
    type: DataTypes.BOOLEAN,
  },
});


ProductImageModel.sync(); // สร้างตารางที่ยังไม่มีเท่านั้น ห้าม alter: .env ชี้ไป DB production

module.exports = ProductImageModel;