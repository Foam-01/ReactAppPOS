const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("db_workshop_pos", "postgres", "1234", {
  host: "db",
  dialect: "postgres",
  logging: false,
  // --- เพิ่มส่วนนี้เข้าไปครับ ---
  define: {
    freezeTableName: true, // ห้ามเปลี่ยนชื่อตารางเอง (เช่น จาก admin เป็น admins)
    timestamps: true, // เปิดใช้ createdAt, updatedAt อัตโนมัติ
  },
  // --------------------------
});

module.exports = sequelize;
