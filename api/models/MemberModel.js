const conn = require('../connect');
const { DataTypes } = require('sequelize');


const MemberModel = conn.define("members", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  packageId: {
    type: DataTypes.BIGINT,
  },
  name: {
    type: DataTypes.STRING(255),
  },
  phone: {
    type: DataTypes.STRING(255),
  },
  pass: {
    type: DataTypes.STRING(255),
  },
});
// หากสร้างตารางมาแล้ว ให้ปิดเอาไว้
MemberModel.sync(); // สร้างตารางที่ยังไม่มีเท่านั้น ห้าม alter: .env ชี้ไป DB production
module.exports = MemberModel;