const { defineConfig, devices } = require("@playwright/test");
const { WEB_PORT } = require("./env");

module.exports = defineConfig({
  testDir: "./tests",
  // ข้อมูลใช้ร่วมกันใน DB เดียว และ API จำกัดการล็อกอิน 10 ครั้ง/15 นาที → รันทีละไฟล์ตามลำดับ
  workers: 1,
  fullyParallel: false,
  timeout: 60000,
  expect: { timeout: 10000 },
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  globalSetup: require.resolve("./global-setup"),
  globalTeardown: require.resolve("./global-teardown"),
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    locale: "th-TH",
    timezoneId: "Asia/Bangkok",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
