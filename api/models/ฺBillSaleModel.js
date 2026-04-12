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

BillSaleModel.sync({alter: true});

module.exports = BillSaleModel;