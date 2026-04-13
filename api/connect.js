const { Sequelize } = require("sequelize");
require("dotenv").config(); // 👈 ต้องโหลดบรรทัดนี้ไว้บนสุดเพื่อให้รู้จักไฟล์ .env

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
    port: process.env.DB_PORT,
  },
);

module.exports = sequelize;
