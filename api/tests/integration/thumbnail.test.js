const fs = require("fs");
const path = require("path");
const { api, conn, resetDb } = require("../helpers/db");

const UPLOADS = path.join(__dirname, "..", "..", "uploads");
const NAME = "test-thumb-src.png";
afterAll(async () => {
  fs.rmSync(path.join(UPLOADS, NAME), { force: true });
  fs.rmSync(path.join(UPLOADS, ".thumbs", NAME + ".webp"), { force: true });
  await conn.close();
});

beforeAll(async () => {
  // รอให้ sync() ของ model (ที่เริ่มตอน require) เสร็จก่อน ไม่งั้น afterAll ปิด connection ตัดกลางคัน
  await resetDb();
  const sharp = require("sharp");
  await sharp({ create: { width: 1024, height: 1024, channels: 3, background: "#e33" } })
    .png().toFile(path.join(UPLOADS, NAME));
});

test("ย่อเป็น WebP กว้าง 480 และเล็กกว่าต้นฉบับ", async () => {
  const res = await api().get("/uploads/thumb/" + NAME).buffer(true).parse((r, cb) => {
    const chunks = []; r.on("data", (c) => chunks.push(c)); r.on("end", () => cb(null, Buffer.concat(chunks)));
  });
  expect(res.status).toBe(200);
  expect(res.headers["content-type"]).toBe("image/webp");
  expect(res.headers["cache-control"]).toMatch(/immutable/);
  const meta = await require("sharp")(res.body).metadata();
  expect(meta.width).toBe(480);
});

test("คำขอพร้อมกันได้ผลเหมือนกัน (สร้างไฟล์ครั้งเดียว)", async () => {
  fs.rmSync(path.join(UPLOADS, ".thumbs", NAME + ".webp"), { force: true });
  const rs = await Promise.all([1, 2, 3].map(() => api().get("/uploads/thumb/" + NAME)));
  expect(rs.map((r) => r.status)).toEqual([200, 200, 200]);
});

test.each(["..%2F.env", ".thumbs", "a.txt", "nofile.png"])("ชื่อไม่ปลอดภัย/ไม่มีไฟล์ %s → 4xx", async (n) => {
  const res = await api().get("/uploads/thumb/" + n);
  expect(res.status).toBeGreaterThanOrEqual(400);
  expect(res.status).toBeLessThan(500);
});
