const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const STATE_FILE = path.join(__dirname, ".e2e-state.json");

// ปิดทั้ง process tree (npx → react-scripts → node) บน Windows ต้องใช้ taskkill /T
const kill = (pid) => {
  if (!pid) return;
  try {
    if (process.platform === "win32") execSync(`taskkill /PID ${pid} /T /F`, { stdio: "ignore" });
    else process.kill(-pid, "SIGTERM");
  } catch (e) {
    /* ปิดไปแล้ว */
  }
};

module.exports = async () => {
  const state = fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) : {};
  kill(state.webPid);
  kill(state.apiPid);
  if (globalThis.__E2E_PG__) await globalThis.__E2E_PG__.stop();
  if (state.dataDir) fs.rmSync(state.dataDir, { recursive: true, force: true });
  fs.rmSync(STATE_FILE, { force: true });
};
