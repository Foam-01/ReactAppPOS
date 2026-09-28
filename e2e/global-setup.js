// เปิดระบบจริงทั้งชุดสำหรับ E2E: Postgres ชั่วคราว → API → เว็บ (dev server)
// ไม่แตะฐานข้อมูลใน api/.env · ทุกอย่างถูกปิดใน global-teardown
const { spawn } = require("child_process");
const fs = require("fs");
const net = require("net");
const os = require("os");
const path = require("path");
const { API_PORT, WEB_PORT, DB_PORT, TOKEN_SECRET } = require("./env");

const ROOT = path.join(__dirname, "..");
const API_DIR = path.join(ROOT, "api");
const WEB_DIR = path.join(ROOT, "web", "app");
const STATE_FILE = path.join(__dirname, ".e2e-state.json");

const { Client } = require("pg");

const waitForPort = (port, timeoutMs, label) =>
  new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const tryOnce = () => {
      const sock = net.connect(port, "127.0.0.1");
      sock.once("connect", () => { sock.destroy(); resolve(); });
      sock.once("error", () => {
        sock.destroy();
        if (Date.now() > deadline) reject(new Error(`${label} ไม่เปิดที่พอร์ต ${port}`));
        else setTimeout(tryOnce, 500);
      });
    };
    tryOnce();
  });

const waitFor = async (check, timeoutMs, label) => {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try { if (await check()) return; } catch (e) { /* ลองใหม่ */ }
    if (Date.now() > deadline) throw new Error(`รอ ${label} ไม่สำเร็จ`);
    await new Promise((r) => setTimeout(r, 500));
  }
};

const startProcess = (name, cmd, args, cwd, env) => {
  const logPath = path.join(__dirname, "test-results", `${name}.log`);
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  const log = fs.createWriteStream(logPath);
  const child = spawn(cmd, args, { cwd, env: { ...process.env, ...env }, shell: true });
  child.stdout.pipe(log);
  child.stderr.pipe(log);
  return child.pid;
};

module.exports = async () => {
  // embedded-postgres เป็น ESM อย่างเดียว
  const { default: EmbeddedPostgres } = await import("embedded-postgres");
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "pos-e2e-pg-"));
  fs.rmdirSync(dataDir);
  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    initdbFlags: ["--encoding=UTF8", "--locale=C"],
    user: "postgres",
    password: "postgres",
    port: DB_PORT,
    persistent: false,
    onLog: () => {},
    onError: () => {},
  });
  await pg.initialise();
  await pg.start();
  await pg.createDatabase("pos_e2e");
  globalThis.__E2E_PG__ = pg;

  const apiPid = startProcess("api", "node", ["server.js"], API_DIR, {
    PORT: String(API_PORT),
    DATABASE_URL: `postgres://postgres:postgres@127.0.0.1:${DB_PORT}/pos_e2e`,
    DB_SSL: "false",
    TOKEN_SECRET,
    CORS_ORIGINS: `http://localhost:${WEB_PORT}`,
    NODE_ENV: "development", // ให้ model สร้างตารางครบตอนเริ่ม
    DOTENV_CONFIG_QUIET: "true",
  });
  const webPid = startProcess("web", "npx", ["react-scripts", "start"], WEB_DIR, {
    PORT: String(WEB_PORT),
    BROWSER: "none",
    REACT_APP_API_PATH: `http://localhost:${API_PORT}`,
  });
  fs.writeFileSync(STATE_FILE, JSON.stringify({ apiPid, webPid, dataDir }));

  await waitForPort(API_PORT, 60000, "API");

  // รอให้ model สร้างตารางเสร็จ แล้วใส่แพ็กเกจตั้งต้น (ข้อมูลที่ admin ต้องมีก่อนเปิดให้สมัคร)
  const db = new Client({ connectionString: `postgres://postgres:postgres@127.0.0.1:${DB_PORT}/pos_e2e` });
  db.on("error", () => {}); // server ปิดตอน teardown ไม่ให้ process ล้ม
  await db.connect();
  await waitFor(
    async () => (await db.query(`SELECT to_regclass('public.packages') AS t`)).rows[0].t,
    30000,
    "ตาราง packages",
  );
  await db.query(
    `INSERT INTO packages (name, bill_amount, price, "createdAt", "updateAt")
     VALUES ('Free', 3, 0, now(), now()), ('Pro', 1000, 499, now(), now())`,
  );
  await db.end();

  await waitForPort(WEB_PORT, 240000, "เว็บ");
  // dev server เปิดพอร์ตก่อน compile เสร็จ: รอจนหน้าเว็บตอบจริง
  await waitFor(
    async () => (await fetch(`http://localhost:${WEB_PORT}/`)).ok,
    240000,
    "เว็บ compile",
  );
};
