const conn = require('../connect');
const { DataTypes } = require('sequelize');
const StockModel = conn.define('stock', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    productId: {
        type: DataTypes.BIGINT
    },
    qty: {
        type: DataTypes.BIGINT
    },
    userId: {
        type: DataTypes.BIGINT
    }
})

StockModel.sync({ alter: true });

module.exports = StockModel;