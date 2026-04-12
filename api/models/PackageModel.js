const conn = require('../connect');
const { DataTypes } = require('sequelize');

const PackageModel = conn.define('package', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255)
    },
    bill_amount: {
        type: DataTypes.BIGINT
    },
    price: {
        type: DataTypes.BIGINT
    }
}, {
    // กำหนดชื่อคอลัมน์ Timestamps ให้ตรงกับในฐานข้อมูล (จากรูปที่ 6)
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updateAt' // ระบุชื่อเป็น updateAt ตามที่ปรากฏใน pgAdmin ของคุณ
});

module.exports = PackageModel;