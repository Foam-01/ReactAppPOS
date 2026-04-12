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

ProductModel.sync({alter: true});

module.exports  = ProductModel;