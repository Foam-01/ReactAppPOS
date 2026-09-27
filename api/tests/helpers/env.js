// ตั้งค่าก่อนโหลดโมดูลใด ๆ: dotenv ไม่ทับตัวแปรที่ตั้งไว้แล้ว จึงไม่ไปต่อฐานข้อมูลจริงใน .env
process.env.DATABASE_URL = `postgres://postgres:postgres@127.0.0.1:${process.env.TEST_PG_PORT}/pos_test`;
process.env.DB_SSL = "false";
process.env.TOKEN_SECRET = "test-secret-".padEnd(48, "x");
process.env.TZ = "Asia/Bangkok";
// model แต่ละไฟล์เรียก sync() เองตอน require · ปิด alter ไม่ให้ชนกับ sync ของชุดทดสอบ
process.env.NODE_ENV = "production";
process.env.DOTENV_CONFIG_QUIET = "true";
