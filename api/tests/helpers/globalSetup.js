const fs = require("fs");
const os = require("os");
const path = require("path");
const EmbeddedPostgres = require("embedded-postgres").default;

// ขอพอร์ตว่างจากระบบ (กันชนกับ Postgres ที่ค้างจากรอบก่อน)
const freePort = () =>
  new Promise((resolve, reject) => {
    const srv = require("net").createServer();
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
    srv.on("error", reject);
  });

module.exports = async () => {
  const port = await freePort();
  // env.js อ่านค่านี้ (worker สืบทอด process.env จาก globalSetup)
  process.env.TEST_PG_PORT = String(port);
  // โฟลเดอร์ใหม่ทุกรอบ: ถ้ารอบก่อนถูกหยุดกลางคัน จะไม่ชน shared memory ของโฟลเดอร์เดิม
  const databaseDir = fs.mkdtempSync(path.join(os.tmpdir(), "pos-test-pg-"));
  fs.rmdirSync(databaseDir);
  const pg = new EmbeddedPostgres({
    databaseDir,
    initdbFlags: ["--encoding=UTF8", "--locale=C"],
    user: "postgres",
    password: "postgres",
    port,
    persistent: false,
    onLog: () => {},
    onError: () => {},
  });
  await pg.initialise();
  await pg.start();
  await pg.createDatabase("pos_test");
  globalThis.__PG__ = pg;
  globalThis.__PG_DIR__ = databaseDir;
};
