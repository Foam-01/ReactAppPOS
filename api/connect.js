const { Sequelize } = require("sequelize");
require("dotenv").config(); // โดนโหลดบรรทัดนี้ไว้บนสุดเพื่อให้รู้จักไฟล์ .env

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
    port: process.env.DB_PORT,
    // 👇 เพิ่ม 6 บรรทัดนี้เข้าไปครับ เพื่อให้คุยกับ Supabase ผ่าน SSL ได้
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
);

module.exports = sequelize;
