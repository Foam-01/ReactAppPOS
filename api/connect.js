const { Sequelize } = require("sequelize");
require("dotenv").config();

let sequelize;

// 💡 เช็คว่าถ้ามี DATABASE_URL (ตอนรันบน Render) ให้ดึงใช้ทันที
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  // 💻 ถ้าไม่มี (ตอนรันเทสในเครื่อง Local) ให้ใช้แบบแยกบรรทัดเหมือนเดิม
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: "postgres",
      logging: false,
      port: process.env.DB_PORT,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    },
  );
}

module.exports = sequelize;
