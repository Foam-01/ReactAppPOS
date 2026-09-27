const conn = require("../connect");
const { DataTypes } = require("sequelize");
const ChangePackageModel = conn.define("ChangePackages", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  packageId: {
    type: DataTypes.BIGINT,
  },
  userId: {
    type: DataTypes.BIGINT,
  },
  payDate: {
    type: DataTypes.DATE,
  },
  payHour: {
    type: DataTypes.BIGINT,
  },
  payMinute: {
    type: DataTypes.BIGINT,
  },
  payRemark: {
    type: DataTypes.STRING,
  },
});

ChangePackageModel.sync(); // สร้างตารางที่ยังไม่มีเท่านั้น ห้าม alter: .env ชี้ไป DB production

module.exports = ChangePackageModel;
