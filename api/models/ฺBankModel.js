const conn = require("../connect");
const { DataTypes } = require("sequelize");
const BankModel = conn.define("banks", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  bankType: {
    type: DataTypes.STRING,
  },
  bankCode: {
    type: DataTypes.STRING,
  },
  bankName: {
    type: DataTypes.STRING,
  },
  bankBranch: {
    type: DataTypes.STRING,
  },
});

BankModel.sync({ alter: true});

module.exports = BankModel; 