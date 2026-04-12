const conn = require('../connect');
const { DataTypes } = require('sequelize');

const BillSaleDetailModel = conn.define('billSaleDetail', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    billSaleId: {
        type: DataTypes.BIGINT
    },
    productId: {
        type: DataTypes.BIGINT
    },
    qty: {
        type: DataTypes.BIGINT
    },
    price: {
        type: DataTypes.BIGINT
    },
    userId: {
        type: DataTypes.BIGINT
    }
})

BillSaleDetailModel.sync({ alter: true});

module.exports = BillSaleDetailModel;