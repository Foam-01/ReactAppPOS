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
