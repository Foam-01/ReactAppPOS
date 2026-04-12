const conn = require('../connect');
const { DataTypes } = require('sequelize');
const UserModel = conn.define('user', {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING
    },
    usr: {
        type: DataTypes.STRING
    },
    pwd: {
        type: DataTypes.STRING
    },
    level: {
        type: DataTypes.STRING
    },
    userId: {
        type: DataTypes.BIGINT
    }
})

UserModel.sync({alter: true});

module.exports = UserModel;