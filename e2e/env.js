// พอร์ตเฉพาะของ E2E (ไม่ชนกับ dev server ปกติ 3000–3002)
module.exports = {
  API_PORT: 3150,
  WEB_PORT: 3155,
  DB_PORT: 54350,
  TOKEN_SECRET: "e2e-secret-".padEnd(48, "x"),
};
