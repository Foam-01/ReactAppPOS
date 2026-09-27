// ชุดทดสอบ API: ใช้ Postgres จริงที่เปิดเฉพาะตอนเทส (embedded-postgres) ไม่แตะฐานข้อมูลใน .env
module.exports = {
  testEnvironment: "node",
  globalSetup: "./tests/helpers/globalSetup.js",
  globalTeardown: "./tests/helpers/globalTeardown.js",
  setupFiles: ["./tests/helpers/env.js"],
  testTimeout: 30000,
  collectCoverageFrom: ["controllers/**/*.js", "models/**/*.js", "app.js", "connect.js", "!controllers/Temp1.js"],
};
