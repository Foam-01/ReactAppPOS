// endpoint ที่เพิ่มเพื่อ performance ต้องให้ผลเท่ากับการคำนวณเดิมที่หน้าเว็บ
const { api, auth, conn, resetDb, createMember, createProduct, sellBill } = require("../helpers/db");
const BillSaleModel = require("../../models/BillSaleModel");
const ProductModel = require("../../models/ProductModel");

let shop, p1, p2;
beforeEach(async () => {
  await resetDb();
  shop = await createMember();
  p1 = await createProduct(shop.member.id, { name: "กาแฟ", price: 65 });
  p2 = await createProduct(shop.member.id, { name: "ชา", price: 35 });
});
afterAll(() => conn.close());

const setCreated = (id, date) =>
  conn.query(`UPDATE "billSales" SET "createdAt" = :d WHERE id = :id`, { replacements: { d: date, id } });

// สูตรเดิมของ web/app/src/pages/Home.js (คำนวณจาก /billSale/list)
const legacyDashboard = (bills) => {
  const sumBill = (b) => b.billSaleDetails.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);
  const key = (d) => {
    const x = new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  };
  const week = {};
  const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - 6);
  for (const b of bills) if (new Date(b.createdAt) >= start) week[key(b.createdAt)] = (week[key(b.createdAt)] || 0) + sumBill(b);
  const qty = {};
  bills.forEach((b) => b.billSaleDetails.forEach((i) => {
    const n = i.product?.name || "ไม่ระบุชื่อ";
    qty[n] = (qty[n] || 0) + Number(i.qty);
  }));
  return {
    totalBills: bills.length,
    totalSales: bills.reduce((s, b) => s + sumBill(b), 0),
    week,
    top: Object.entries(qty).map(([name, q]) => ({ name, qty: q })).sort((a, b) => b.qty - a.qty || a.name.localeCompare(b.name)).slice(0, 5),
    recentIds: [...bills].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map((b) => b.id),
  };
};

describe("GET /billSale/summary", () => {
  test("ผลเท่ากับสูตรเดิมของหน้าภาพรวมร้าน", async () => {
    await sellBill(shop.token, [p1.id, p1.id, p2.id]);
    await sellBill(shop.token, [p2.id]);
    await sellBill(shop.token, [p1.id]);
    await sellBill(shop.token, [p2.id, p2.id]);
    const bills = await BillSaleModel.findAll({ order: [["id", "ASC"]] });
    const now = new Date();
    await setCreated(bills[0].id, new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 1));
    await setCreated(bills[1].id, new Date(Date.now() - 3 * 86400000));
    await setCreated(bills[2].id, new Date(Date.now() - 30 * 86400000)); // นอกช่วง 7 วัน
    // บิลเปิดค้างและบิลว่างต้องไม่ถูกนับ
    await api().get("/billSale/openBill").set(auth(shop.token));
    await BillSaleModel.create({ userId: shop.member.id, status: "pay" });
    // สินค้าที่ถูกลบ → "ไม่ระบุชื่อ"
    await ProductModel.destroy({ where: { id: p2.id } });

    const legacy = legacyDashboard((await api().get("/billSale/list").set(auth(shop.token))).body.results);
    const { results } = (await api().get("/billSale/summary").set(auth(shop.token))).body;

    expect(results.totalBills).toBe(legacy.totalBills);
    expect(results.totalSales).toBe(legacy.totalSales);
    expect(Object.fromEntries(results.weekSales.map((w) => [w.date, w.total]))).toEqual(legacy.week);
    expect(results.topProducts).toEqual(legacy.top);
    expect(results.recentBills.map((b) => b.id)).toEqual(legacy.recentIds);
    expect(results.recentBills[0].billSaleDetails[0]).toHaveProperty("product");
  });

  test("ร้านใหม่ไม่มีบิล: ค่าเป็นศูนย์/ว่าง", async () => {
    const { results } = (await api().get("/billSale/summary").set(auth(shop.token))).body;
    expect(results).toEqual({
      totalBills: 0, totalSales: 0, weekSales: [], topProducts: [], recentBills: [],
      stock: { productCount: 2, totalStock: 0, negativeCount: 0 },
    });
  });

  test("เห็นเฉพาะของร้านตัวเอง และต้องล็อกอิน", async () => {
    const other = await createMember();
    const op = await createProduct(other.member.id);
    await sellBill(other.token, [op.id]);
    expect((await api().get("/billSale/summary").set(auth(shop.token))).body.results.totalBills).toBe(0);
    expect((await api().get("/billSale/summary")).status).toBe(401);
  });
});

test("summary.stock เท่ากับสูตรเดิมที่คำนวณจาก /stock/report", async () => {
  await api().post("/stock/save").set(auth(shop.token)).send({ productId: p1.id, qty: 10 }).expect(200);
  await sellBill(shop.token, [p1.id, p1.id, p2.id]); // p2 ติดลบ
  await api().get("/billSale/openBill").set(auth(shop.token));
  await api().post("/billSele/sele").set(auth(shop.token)).send({ id: p1.id }); // บิลเปิดก็ถูกนับในรายงานเดิม
  const report = (await api().get("/stock/report").set(auth(shop.token))).body.results;
  const legacy = {
    productCount: report.length,
    totalStock: report.reduce((t, i) => t + (Number(i.stockIn) - Number(i.stockOut)), 0),
    negativeCount: report.filter((i) => Number(i.stockIn) - Number(i.stockOut) < 0).length,
  };
  const { stock } = (await api().get("/billSale/summary").set(auth(shop.token))).body.results;
  expect(stock).toEqual(legacy);
  expect(stock).toEqual({ productCount: 2, totalStock: 6, negativeCount: 1 });
});

describe("GET /billSale/list แบ่งหน้า", () => {
  // ใส่ 25 บิลด้วย SQL (เรียก API ทีละบิลจะชน rate limit 300 ครั้ง/นาที)
  beforeEach(async () => {
    const uid = shop.member.id;
    await conn.query(`INSERT INTO "billSales" (status, "userId", "createdAt", "updatedAt")
      SELECT 'pay', ${uid}, now() - g * interval '1 minute', now() FROM generate_series(1, 25) g`);
    await conn.query(`INSERT INTO "billSaleDetails" ("productId", qty, price, "billSaleId", "userId", "createdAt", "updatedAt")
      SELECT p.id, 1, p.price, b.id, ${uid}, now(), now() FROM "billSales" b CROSS JOIN products p WHERE b."userId" = ${uid}`);
  });

  test("ไม่ส่ง page: คืนทุกบิลโครงเดิม (ไม่มี total)", async () => {
    const res = await api().get("/billSale/list").set(auth(shop.token));
    expect(res.body.results).toHaveLength(25);
    expect(res.body.total).toBeUndefined();
  });

  test("page/limit: นับเป็นบิล ไม่ใช่แถวรายการ และเรียงใหม่ก่อน", async () => {
    const p1r = await api().get("/billSale/list?page=1&limit=10").set(auth(shop.token));
    const p3r = await api().get("/billSale/list?page=3&limit=10").set(auth(shop.token));
    expect(p1r.body.total).toBe(25);
    expect(p1r.body.results).toHaveLength(10);
    expect(p1r.body.results[0].billSaleDetails).toHaveLength(2);
    expect(p3r.body.results).toHaveLength(5);
    const all = (await api().get("/billSale/list").set(auth(shop.token))).body.results.map((b) => b.id);
    expect(p1r.body.results.map((b) => b.id)).toEqual(all.slice(0, 10));
  });

  test("q ค้นเลขบิลเหมือนการค้นเดิม และอักขระพิเศษไม่ทำให้พัง", async () => {
    const res = await api().get("/billSale/list?page=1&q=1").set(auth(shop.token));
    const all = (await api().get("/billSale/list").set(auth(shop.token))).body.results;
    expect(res.body.total).toBe(all.filter((b) => String(b.id).includes("1")).length);
    for (const q of ["%", "_", "\\", "' OR 1=1 --"]) {
      const r = await api().get("/billSale/list").query({ page: 1, q }).set(auth(shop.token));
      expect(r.status).toBe(200);
      expect(r.body.total).toBe(0);
    }
  });

  test.each([["0", "10"], ["abc", "x"], ["1", "5000"]])("page=%s limit=%s ใช้ค่าที่ปลอดภัย", async (page, limit) => {
    const r = await api().get(`/billSale/list?page=${page}&limit=${limit}`).set(auth(shop.token));
    expect(r.status).toBe(200);
    expect(r.body.results.length).toBeLessThanOrEqual(100);
  });
});

describe("อื่น ๆ", () => {
  test("countBill ใช้ count() ได้ค่าเท่าเดิม", async () => {
    await sellBill(shop.token, [p1.id]);
    await sellBill(shop.token, [p1.id]);
    expect((await api().get("/package/countBill").set(auth(shop.token))).body.totalBill).toBeGreaterThanOrEqual(2);
  });

  test("package/list และ bank/list มี Cache-Control สาธารณะ 5 นาที", async () => {
    for (const url of ["/package/list", "/bank/list"]) {
      expect((await api().get(url)).headers["cache-control"]).toBe("public, max-age=300");
    }
  });

  test("endpoint ที่ต้องล็อกอินไม่ถูกตั้ง cache สาธารณะ", async () => {
    const r = await api().get("/billSale/list").set(auth(shop.token));
    expect(r.headers["cache-control"] || "").not.toMatch(/public/);
  });
});
