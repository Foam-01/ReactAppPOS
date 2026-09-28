const BillSaleModel = require("../../models/BillSaleModel");
const PackageModel = require("../../models/PackageModel");
const ChangePackageModel = require("../../models/ChangePackageModel");
const { api, auth, conn, resetDb, createMember, createProduct, createAdmin, sellBill } = require("../helpers/db");

let shop, product;
beforeEach(async () => {
  await resetDb();
  shop = await createMember();
  product = await createProduct(shop.member.id, { price: 100 });
});
afterAll(() => conn.close());

const setBillTime = (id, col, date) =>
  conn.query(`UPDATE "billSales" SET "${col}" = :d WHERE id = :id`, { replacements: { d: date, id } });

describe("รายงานบิล", () => {
  test("list ไม่รวมบิลที่ยังเปิด", async () => {
    await sellBill(shop.token, [product.id, product.id]);
    await api().get("/billSale/openBill").set(auth(shop.token));
    const res = await api().get("/billSale/list").set(auth(shop.token));
    expect(res.body.results).toHaveLength(1);
  });

  test("billToday แสดงบิลที่ชำระวันนี้", async () => {
    await sellBill(shop.token, [product.id]);
    const res = await api().get("/billSale/billToday").set(auth(shop.token));
    expect(res.body.results).toHaveLength(1);
  });

  test("listByYearAndMonth รวมยอดตามวัน", async () => {
    await sellBill(shop.token, [product.id, product.id]);
    const bill = await BillSaleModel.findOne();
    await setBillTime(bill.id, "createdAt", new Date(2026, 2, 15, 10, 0, 0));
    const res = await api().get("/billSale/listByYearAndMonth/2026/3").set(auth(shop.token));
    expect(res.body.results).toHaveLength(31);
    expect(res.body.results[14].sum).toBe(200);
    expect(res.body.results[14].results).toHaveLength(1);
  });

  test.each([["1999", "1"], ["2026", "0"], ["2026", "13"], ["abc", "1"]])(
    "listByYearAndMonth ปี/เดือนผิด %s/%s → 400 (boundary)",
    async (y, m) => {
      expect((await api().get(`/billSale/listByYearAndMonth/${y}/${m}`).set(auth(shop.token))).status).toBe(400);
    },
  );

  test("B5: บิลเวลา 23:59:59.500 ต้องถูกนับในรายงานรายวัน", async () => {
    await sellBill(shop.token, [product.id]);
    const bill = await BillSaleModel.findOne();
    await setBillTime(bill.id, "createdAt", new Date(2026, 2, 15, 23, 59, 59, 500));
    const res = await api().get("/billSale/listByYearAndMonth/2026/3").set(auth(shop.token));
    expect(res.body.results[14].sum).toBe(100);
  });

  test("B6: บิลที่ชำระวันนี้เวลา 23:59:59.500 ต้องอยู่ใน billToday", async () => {
    await sellBill(shop.token, [product.id]);
    const bill = await BillSaleModel.findOne();
    const late = new Date();
    late.setHours(23, 59, 59, 500);
    await setBillTime(bill.id, "updatedAt", late);
    await setBillTime(bill.id, "payDate", late);
    const res = await api().get("/billSale/billToday").set(auth(shop.token));
    expect(res.body.results).toHaveLength(1);
  });

  test("B7: countBill นับเฉพาะบิลที่ชำระแล้ว (ไม่นับบิลเปิดค้าง)", async () => {
    await sellBill(shop.token, [product.id]);
    await api().get("/billSale/openBill").set(auth(shop.token));
    const res = await api().get("/package/countBill").set(auth(shop.token));
    expect(res.body.totalBill).toBe(1);
  });
});

describe("B5/B6 ขอบเวลาหลังแก้", () => {
  test("B5: 23:59:59.999 ของวันกลางเดือนนับในวันนั้น ไม่ใช่เฉพาะวันสิ้นเดือน", async () => {
    await sellBill(shop.token, [product.id]);
    const bill = await BillSaleModel.findOne();
    await setBillTime(bill.id, "createdAt", new Date(2026, 2, 10, 23, 59, 59, 999));
    const res = await api().get("/billSale/listByYearAndMonth/2026/3").set(auth(shop.token));
    expect(res.body.results[9].sum).toBe(100);
    expect(res.body.results[10].sum).toBe(0);
  });

  test("B5: วันสุดท้ายของเดือน 23:59:59.999 นับ · 00:00:00.000 ของเดือนถัดไปไม่นับ", async () => {
    await sellBill(shop.token, [product.id]);
    await sellBill(shop.token, [product.id]);
    const [a, b] = await BillSaleModel.findAll({ order: [["id", "ASC"]] });
    await setBillTime(a.id, "createdAt", new Date(2026, 2, 31, 23, 59, 59, 999));
    await setBillTime(b.id, "createdAt", new Date(2026, 3, 1, 0, 0, 0, 0));
    const march = await api().get("/billSale/listByYearAndMonth/2026/3").set(auth(shop.token));
    const april = await api().get("/billSale/listByYearAndMonth/2026/4").set(auth(shop.token));
    expect(march.body.results[30].sum).toBe(100);
    expect(march.body.results.reduce((t, d) => t + d.results.length, 0)).toBe(1);
    expect(april.body.results[0].sum).toBe(100);
  });

  test("B6: บิลเที่ยงคืนพรุ่งนี้ (00:00:00.000) ไม่อยู่ใน billToday", async () => {
    await sellBill(shop.token, [product.id]);
    const bill = await BillSaleModel.findOne();
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    await setBillTime(bill.id, "updatedAt", tomorrow);
    expect((await api().get("/billSale/billToday").set(auth(shop.token))).body.results).toHaveLength(0);
  });

  test("B6: บิลเที่ยงคืนวันนี้ (00:00:00.000) อยู่ใน billToday", async () => {
    await sellBill(shop.token, [product.id]);
    const bill = await BillSaleModel.findOne();
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    await setBillTime(bill.id, "updatedAt", midnight);
    expect((await api().get("/billSale/billToday").set(auth(shop.token))).body.results).toHaveLength(1);
  });
});

describe("รายงานสต็อก", () => {
  test("stockIn/stockOut ไม่นับซ้ำเมื่อมีหลายแถว", async () => {
    await api().post("/stock/save").set(auth(shop.token)).send({ productId: product.id, qty: 10 }).expect(200);
    await api().post("/stock/save").set(auth(shop.token)).send({ productId: product.id, qty: 5 }).expect(200);
    await sellBill(shop.token, [product.id, product.id]);
    await sellBill(shop.token, [product.id]);
    const res = await api().get("/stock/report").set(auth(shop.token));
    expect(res.body.results[0]).toMatchObject({ stockIn: 15, stockOut: 3 });
  });

  test.each([0, -5, 2.5, "x"])("รับสต็อกจำนวน %p → 400 (boundary)", async (qty) => {
    const res = await api().post("/stock/save").set(auth(shop.token)).send({ productId: product.id, qty });
    expect(res.status).toBe(400);
  });
});

describe("แพ็กเกจ / รายงาน backoffice", () => {
  test("happy path: ขอเปลี่ยนแพ็กเกจ → admin อนุมัติ → ขึ้นรายงานรายปี", async () => {
    const pro = await PackageModel.create({ name: "Pro", bill_amount: 1000, price: 499 });
    await api().get(`/package/changePackage/${pro.id}`).set(auth(shop.token)).expect(200);
    const { token } = await createAdmin();
    const list = await api().get("/changePackage/list").set(auth(token));
    expect(list.body.results).toHaveLength(1);
    await api().post("/changePackage/saveChange").set(auth(token))
      .send({ id: list.body.results[0].id, payDate: new Date(), payHour: 10, payMinute: 0, remark: "" })
      .expect(200);
    expect((await api().get("/changePackage/list").set(auth(token))).body.results).toHaveLength(0);
    const year = await api().get("/changePackage/reportSumsalePreYear").set(auth(token));
    expect(year.body.results.find((r) => r.year === new Date().getUTCFullYear()).sum).toBe(499);
  });

  test("B8: reportSumSalePerDay ปีไม่ใช่ตัวเลข → 400", async () => {
    const { token } = await createAdmin();
    const res = await api().post("/changePackage/reportSumSalePerDay").set(auth(token)).send({ year: "abc", month: "1" });
    expect(res.status).toBe(400);
  });

  test("B8: reportSumSalePerMonth ปีไม่ใช่ตัวเลข → 400", async () => {
    const { token } = await createAdmin();
    const res = await api().post("/changePackage/reportSumSalePerMonth").set(auth(token)).send({ year: "abc" });
    expect(res.status).toBe(400);
  });

  test("B8: saveChange ไม่มี id → 400", async () => {
    const { token } = await createAdmin();
    const res = await api().post("/changePackage/saveChange").set(auth(token)).send({ payDate: "2026-01-01" });
    expect(res.status).toBe(400);
  });

  test("B9: ขอเปลี่ยนเป็นแพ็กเกจที่ไม่มีอยู่ → 404 และไม่บันทึก", async () => {
    const res = await api().get("/package/changePackage/999999").set(auth(shop.token));
    expect(res.status).toBe(404);
    expect(await ChangePackageModel.count()).toBe(0);
  });

  test("B9: id แพ็กเกจไม่ใช่ตัวเลข → 400", async () => {
    expect((await api().get("/package/changePackage/abc").set(auth(shop.token))).status).toBe(400);
  });
});
