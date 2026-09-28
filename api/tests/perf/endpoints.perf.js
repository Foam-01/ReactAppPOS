// วัดขนาด/เวลาตอบของ endpoint หนัก ๆ ด้วยข้อมูลจำลองร้านที่ขายมาราว 1 ปี
// รัน: npx jest --runInBand --testRegex "perf/.*\.perf\.js$" (ไม่รวมในชุดเทสปกติ)
const { api, auth, conn, resetDb, createMember, createProduct } = require("../helpers/db");

const BILLS = 5000;
const ITEMS_PER_BILL = 3;
const PRODUCTS = 40;

let shop;
beforeAll(async () => {
  await resetDb();
  shop = await createMember();
  const products = [];
  for (let i = 0; i < PRODUCTS; i++) {
    products.push(await createProduct(shop.member.id, {
      name: "สินค้า " + i,
      price: 20 + i,
      detail: "รายละเอียดสินค้ายาว ๆ ".repeat(10),
    }));
  }
  const uid = shop.member.id;
  // ใส่ตรงด้วย SQL (เร็วกว่าเรียก API ทีละบิล) · กระจายวันย้อนหลัง 365 วัน
  await conn.query(`
    INSERT INTO "billSales" ("status","userId","payDate","createdAt","updatedAt")
    SELECT 'pay', ${uid}, t, t, t
    FROM (SELECT now() - (random() * interval '365 days') AS t FROM generate_series(1, ${BILLS})) s`);
  await conn.query(`
    INSERT INTO "billSaleDetails" ("productId","qty","price","billSaleId","userId","createdAt","updatedAt")
    SELECT p.id, 1 + (random() * 3)::int, p.price, b.id, ${uid}, b."createdAt", b."createdAt"
    FROM "billSales" b
    CROSS JOIN generate_series(1, ${ITEMS_PER_BILL}) g
    JOIN LATERAL (SELECT id, price FROM products WHERE "userId" = ${uid}
                  ORDER BY random() + g * 0 + b.id * 0 LIMIT 1) p ON true`);
  await conn.query(`
    INSERT INTO stocks ("productId","qty","userId","createdAt","updatedAt")
    SELECT id, 100, ${uid}, now(), now() FROM products, generate_series(1, 20)`);
  // index เดียวกับที่ production สร้างตอนเริ่ม server (models/indexes.js)
  await require("../../models/indexes")();
  await conn.query("ANALYZE");
}, 120000);
afterAll(() => conn.close());

const measure = async (label, path) => {
  const runs = [];
  let size = 0;
  for (let i = 0; i < 3; i++) {
    const t0 = process.hrtime.bigint();
    const res = await api().get(path).set(auth(shop.token)).set("Accept-Encoding", "identity");
    runs.push(Number(process.hrtime.bigint() - t0) / 1e6);
    expect(res.status).toBe(200);
    size = Buffer.byteLength(res.text || "");
  }
  runs.sort((a, b) => a - b);
  console.log(`${label.padEnd(34)} ${(size / 1024).toFixed(0).padStart(7)} KB  median ${runs[1].toFixed(0).padStart(5)} ms`);
};

test("baseline", async () => {
  await measure("GET /billSale/list", "/billSale/list");
  await measure("GET /stock/report", "/stock/report");
  await measure("GET /stock/list", "/stock/list");
  await measure("GET /billSale/list?page=1 (new)", "/billSale/list?page=1&limit=20");
  await measure("GET /billSale/listByYearAndMonth", `/billSale/listByYearAndMonth/${new Date().getFullYear()}/${new Date().getMonth() + 1}`);
  await measure("GET /package/countBill", "/package/countBill");
  const summary = await api().get("/billSale/summary").set(auth(shop.token));
  if (summary.status === 200) await measure("GET /billSale/summary (new)", "/billSale/summary");
}, 300000);
