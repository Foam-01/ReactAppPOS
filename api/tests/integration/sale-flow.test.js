const BillSaleModel = require("../../models/BillSaleModel");
const BillSaleDetailModel = require("../../models/BillSaleDetailModel");
const PackageModel = require("../../models/PackageModel");
const { api, auth, conn, resetDb, createMember, createProduct, sellBill } = require("../helpers/db");

let shop, product;
beforeEach(async () => {
  await resetDb();
  shop = await createMember();
  product = await createProduct(shop.member.id, { price: 100 });
});
afterAll(() => conn.close());

const addItem = (token, id) => api().post("/billSele/sele").set(auth(token)).send({ id });

describe("happy path การขาย", () => {
  test("เปิดบิล → เพิ่มสินค้า 2 ครั้ง → แก้จำนวน → ปิดการขาย → บิลล่าสุด", async () => {
    const open = await api().get("/billSale/openBill").set(auth(shop.token));
    expect(open.body.result.status).toBe("open");

    await addItem(shop.token, product.id).expect(200);
    await addItem(shop.token, product.id).expect(200);
    const info = await api().get("/billSale/currentBillInfo").set(auth(shop.token));
    const [detail] = info.body.results.billSaleDetails;
    expect(Number(detail.qty)).toBe(2);

    await api().post("/billSale/updateQty").set(auth(shop.token)).send({ id: detail.id, qty: 3 }).expect(200);
    expect((await api().get("/billSale/endSale").set(auth(shop.token))).status).toBe(200);

    const last = await api().get("/billSale/lastBill").set(auth(shop.token));
    const bill = last.body.result[0];
    expect(bill.id).toBe(open.body.result.id);
    expect(bill.billSaleDetails).toHaveLength(1);
    expect(Number(bill.billSaleDetails[0].qty) * Number(bill.billSaleDetails[0].price)).toBe(300);
    expect((await BillSaleModel.findByPk(bill.id)).payDate).not.toBeNull();
  });

  test("openBill เรียกซ้ำได้บิลเดิม", async () => {
    const r1 = await api().get("/billSale/openBill").set(auth(shop.token));
    const r2 = await api().get("/billSale/openBill").set(auth(shop.token));
    expect(r2.body.result.id).toBe(r1.body.result.id);
  });

  test("ราคาในบิลมาจากฐานข้อมูล ไม่เชื่อราคาที่ client ส่ง", async () => {
    await api().get("/billSale/openBill").set(auth(shop.token));
    await api().post("/billSele/sele").set(auth(shop.token)).send({ id: product.id, price: 1 });
    expect(Number((await BillSaleDetailModel.findOne()).price)).toBe(100);
  });

  test("ลบรายการในบิลที่ยังเปิดได้", async () => {
    await api().get("/billSale/openBill").set(auth(shop.token));
    await addItem(shop.token, product.id);
    const detail = await BillSaleDetailModel.findOne();
    await api().delete(`/billSale/deleteItem/${detail.id}`).set(auth(shop.token)).expect(200);
    expect(await BillSaleDetailModel.count()).toBe(0);
  });
});

describe("error / edge case", () => {
  test("ปิดการขายบิลว่าง → 400 และบิลยังเปิดอยู่", async () => {
    await api().get("/billSale/openBill").set(auth(shop.token));
    expect((await api().get("/billSale/endSale").set(auth(shop.token))).status).toBe(400);
    expect(await BillSaleModel.count({ where: { status: "open" } })).toBe(1);
  });

  test("ปิดการขายโดยไม่เคยเปิดบิล → 400", async () => {
    expect((await api().get("/billSale/endSale").set(auth(shop.token))).status).toBe(400);
  });

  test("เพิ่มสินค้าโดยไม่มีบิลเปิด → 400", async () => {
    expect((await addItem(shop.token, product.id)).status).toBe(400);
  });

  test("เพิ่มสินค้าที่ไม่มีอยู่ → 404", async () => {
    await api().get("/billSale/openBill").set(auth(shop.token));
    expect((await addItem(shop.token, 999999)).status).toBe(404);
  });

  test.each([0, -1, 1.5, "abc", null])("แก้จำนวนเป็น %p → 400 (boundary)", async (qty) => {
    await api().get("/billSale/openBill").set(auth(shop.token));
    await addItem(shop.token, product.id);
    const detail = await BillSaleDetailModel.findOne();
    const res = await api().post("/billSale/updateQty").set(auth(shop.token)).send({ id: detail.id, qty });
    expect(res.status).toBe(400);
    await detail.reload();
    expect(Number(detail.qty)).toBe(1);
  });

  test("บิลที่ปิดแล้วไม่อยู่ใน currentBillInfo และบิลใหม่ถูกเปิดแยก", async () => {
    await sellBill(shop.token, [product.id]);
    const cur = await api().get("/billSale/currentBillInfo").set(auth(shop.token));
    expect(cur.body.results).toBeNull();
    await api().get("/billSale/openBill").set(auth(shop.token));
    expect(await BillSaleModel.count()).toBe(2);
  });
});

describe("concurrent case", () => {
  test("กดเพิ่มสินค้าเดียวกัน 10 ครั้งพร้อมกัน → 1 แถว qty 10", async () => {
    await api().get("/billSale/openBill").set(auth(shop.token));
    const results = await Promise.all(Array.from({ length: 10 }, () => addItem(shop.token, product.id)));
    expect(results.every((r) => r.status === 200)).toBe(true);
    const details = await BillSaleDetailModel.findAll();
    expect(details).toHaveLength(1);
    expect(Number(details[0].qty)).toBe(10);
  });

  test("เปิดบิลพร้อมกัน 5 ครั้ง → มีบิลเปิดใบเดียว", async () => {
    await Promise.all(Array.from({ length: 5 }, () => api().get("/billSale/openBill").set(auth(shop.token))));
    expect(await BillSaleModel.count({ where: { status: "open" } })).toBe(1);
  });

  test("ปิดการขายพร้อมกัน 2 ครั้ง → สำเร็จครั้งเดียว", async () => {
    await api().get("/billSale/openBill").set(auth(shop.token));
    await addItem(shop.token, product.id);
    const results = await Promise.all([1, 2].map(() => api().get("/billSale/endSale").set(auth(shop.token))));
    expect(results.map((r) => r.status).sort()).toEqual([200, 400]);
  });
});

describe("บั๊กที่พบ (ยืนยันด้วยเทส)", () => {
  test("B1: แก้จำนวนสินค้าในบิลที่ชำระแล้วไม่ได้", async () => {
    await sellBill(shop.token, [product.id]);
    const detail = await BillSaleDetailModel.findOne();
    const res = await api().post("/billSale/updateQty").set(auth(shop.token)).send({ id: detail.id, qty: 50 });
    await detail.reload();
    expect(Number(detail.qty)).toBe(1);
    expect(res.status).toBe(404);
  });

  test("B1: ลบรายการในบิลที่ชำระแล้วไม่ได้", async () => {
    await sellBill(shop.token, [product.id]);
    const detail = await BillSaleDetailModel.findOne();
    const res = await api().delete(`/billSale/deleteItem/${detail.id}`).set(auth(shop.token));
    expect(await BillSaleDetailModel.count()).toBe(1);
    expect(res.status).toBe(404);
  });

  test("B2: ปิดการขายเกินโควตาบิลต่อเดือนของแพ็กเกจไม่ได้", async () => {
    const pkg = await PackageModel.create({ name: "Tiny", bill_amount: 1, price: 0 });
    const small = await createMember({ packageId: pkg.id });
    const p = await createProduct(small.member.id);
    expect((await sellBill(small.token, [p.id])).status).toBe(200);
    const second = await sellBill(small.token, [p.id]);
    expect(second.status).toBe(403);
    expect(await BillSaleModel.count({ where: { userId: small.member.id, status: "pay" } })).toBe(1);
  });
});

describe("B1/B2 edge cases หลังแก้", () => {
  test("B1: บิลที่ยังเปิดอยู่ยังแก้จำนวนและลบรายการได้ตามปกติ", async () => {
    await api().get("/billSale/openBill").set(auth(shop.token));
    await addItem(shop.token, product.id);
    const detail = await BillSaleDetailModel.findOne();
    await api().post("/billSale/updateQty").set(auth(shop.token)).send({ id: detail.id, qty: 4 }).expect(200);
    await detail.reload();
    expect(Number(detail.qty)).toBe(4);
    await api().delete(`/billSale/deleteItem/${detail.id}`).set(auth(shop.token)).expect(200);
    expect(await BillSaleDetailModel.count()).toBe(0);
  });

  test("B1: id ไม่ใช่ตัวเลข / ไม่มีอยู่ → 404 ไม่ใช่ 500", async () => {
    await api().get("/billSale/openBill").set(auth(shop.token));
    for (const id of ["abc", "999999", "-1"]) {
      expect((await api().delete(`/billSale/deleteItem/${id}`).set(auth(shop.token))).status).toBe(404);
      expect((await api().post("/billSale/updateQty").set(auth(shop.token)).send({ id, qty: 2 })).status).toBe(404);
    }
  });

  test("B1: แก้รายการของบิลที่ปิดแล้ว ขณะมีบิลใหม่เปิดอยู่ → ยังแก้ไม่ได้", async () => {
    await sellBill(shop.token, [product.id]);
    const paidDetail = await BillSaleDetailModel.findOne();
    await api().get("/billSale/openBill").set(auth(shop.token));
    await addItem(shop.token, product.id);
    expect((await api().post("/billSale/updateQty").set(auth(shop.token)).send({ id: paidDetail.id, qty: 9 })).status).toBe(404);
    await paidDetail.reload();
    expect(Number(paidDetail.qty)).toBe(1);
  });

  test("B2: บิลเดือนก่อนไม่นับในโควตาเดือนนี้", async () => {
    const pkg = await PackageModel.create({ name: "Tiny", bill_amount: 1, price: 0 });
    const small = await createMember({ packageId: pkg.id });
    const p = await createProduct(small.member.id);
    await sellBill(small.token, [p.id]);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    await conn.query(`UPDATE "billSales" SET "createdAt" = :d WHERE "userId" = :u`, {
      replacements: { d: lastMonth, u: small.member.id },
    });
    expect((await sellBill(small.token, [p.id])).status).toBe(200);
  });

  test("B2: แพ็กเกจไม่กำหนดจำนวนบิล (null) = ไม่จำกัด", async () => {
    const pkg = await PackageModel.create({ name: "Unlimited", bill_amount: null, price: 0 });
    const big = await createMember({ packageId: pkg.id });
    const p = await createProduct(big.member.id);
    for (let i = 0; i < 3; i++) expect((await sellBill(big.token, [p.id])).status).toBe(200);
  });

  test("B2: ครบโควตาแล้ว บิลยังเปิดอยู่พร้อมสินค้า และข้อความบอกให้อัปเกรด", async () => {
    const pkg = await PackageModel.create({ name: "Tiny", bill_amount: 1, price: 0 });
    const small = await createMember({ packageId: pkg.id });
    const p = await createProduct(small.member.id);
    await sellBill(small.token, [p.id]);
    const res = await sellBill(small.token, [p.id]);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/อัปเกรด/);
    const open = await api().get("/billSale/currentBillInfo").set(auth(small.token));
    expect(open.body.results.billSaleDetails).toHaveLength(1);
  });

  test("B2: ปิดการขายพร้อมกันจาก 2 เครื่องตอนเหลือโควตา 1 บิล → ผ่านได้แค่บิลเดียว", async () => {
    const pkg = await PackageModel.create({ name: "Two", bill_amount: 2, price: 0 });
    const shop2 = await createMember({ packageId: pkg.id });
    const p = await createProduct(shop2.member.id);
    await sellBill(shop2.token, [p.id]);
    await api().get("/billSale/openBill").set(auth(shop2.token));
    await addItem(shop2.token, p.id);
    const results = await Promise.all([1, 2].map(() => api().get("/billSale/endSale").set(auth(shop2.token))));
    expect(results.filter((r) => r.status === 200)).toHaveLength(1);
    expect(await BillSaleModel.count({ where: { userId: shop2.member.id, status: "pay" } })).toBe(2);
  });
});

describe("B7: ตัวเลขบิลที่แถบซ้ายตรงกับโควตา", () => {
  test("countBill เท่ากับจำนวนที่ใช้ตรวจโควตาพอดี ตอนถูกบล็อก", async () => {
    const pkg = await PackageModel.create({ name: "Two", bill_amount: 2, price: 0 });
    const s = await createMember({ packageId: pkg.id });
    const p = await createProduct(s.member.id);
    await sellBill(s.token, [p.id]);
    await sellBill(s.token, [p.id]);
    expect((await sellBill(s.token, [p.id])).status).toBe(403); // บิลที่ 3 เปิดค้าง
    const res = await api().get("/package/countBill").set(auth(s.token));
    expect(res.body.totalBill).toBe(2);
  });

  test("บิลเปิดว่างจากการเข้าหน้าขายไม่ทำให้ตัวเลขเพิ่ม", async () => {
    await api().get("/billSale/openBill").set(auth(shop.token));
    expect((await api().get("/package/countBill").set(auth(shop.token))).body.totalBill).toBe(0);
  });
});
