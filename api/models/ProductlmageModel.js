const conn = require('../connect');
const { DataTypes } = require('sequelize');
const ProductlmageModel = conn.define('productlmage' , {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    productId: {
        type: DataTypes.BIGINT
    },
    imageName: {
        type: DataTypes.STRING
    },
    isMain: {
        type: DataTypes.BOOLEAN
    }
})


ProductlmageModel.sync({alter: true})

module.exports = ProductlmageModel;