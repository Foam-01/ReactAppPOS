const fs = require("fs");

module.exports = async () => {
  const pg = globalThis.__PG__;
  if (!pg) return;
  await pg.stop();
  fs.rmSync(globalThis.__PG_DIR__, { recursive: true, force: true });
};
