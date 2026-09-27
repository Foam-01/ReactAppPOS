const { Sequelize } = require("sequelize");
const pg = require("pg");

// NUMERIC (ราคาเงิน) ให้คืนเป็น number เหมือน BIGINT เดิม ไม่ใช่ string
// ค่าเงินไม่เกิน 2 ตำแหน่งทศนิยม อยู่ในช่วงที่ number แทนได้แม่นยำ
pg.types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v)));
require("dotenv").config();

let sequelize;

// ตรวจใบรับรอง SSL ของ DB เมื่อมี CA (ดาวน์โหลดจาก Supabase > Database Settings > SSL)
// ตั้ง DB_SSL_CA=path/to/prod-ca-2021.crt เพื่อกัน MITM
// DB_SSL=false: ปิด SSL (ใช้กับฐานข้อมูลในเครื่อง เช่น Postgres ของชุดทดสอบ)
const ssl = process.env.DB_SSL === "false"
  ? false
  : process.env.DB_SSL_CA
  ? {
      require: true,
      rejectUnauthorized: true,
      ca: require("fs").readFileSync(process.env.DB_SSL_CA, "utf8"),
    }
  : { require: true, rejectUnauthorized: false };

// ค่า default ของ Sequelize คือ max 5 connection
const pool = { max: 10, min: 0, acquire: 30000, idle: 10000 };

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    pool: pool,
    dialectOptions: {
      ssl: ssl,
      // 💡 เพิ่มบรรทัดนี้เข้าไปครับ เพื่อแก้ปัญหา (ENOIDENTIFIER) บน Render
      application_name: "foam-pos",
    },
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: "postgres",
      logging: false,
      pool: pool,
      port: process.env.DB_PORT,
      dialectOptions: {
        ssl: ssl,
      },
    },
  );
}

module.exports = sequelize;
