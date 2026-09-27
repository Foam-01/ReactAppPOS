// ร้าน A ต้องมองไม่เห็นและแก้ไม่ได้ ข้อมูลของร้าน B (ทุก endpoint ที่รับ id จาก client)
const ProductModel = require("../../models/ProductModel");
const StockModel = require("../../models/StockModel");
const UserModel = require("../../models/UserModel");
const BillSaleDetailModel = require("../../models/BillSaleDetailModel");
const { api, auth, conn, resetDb, createMember, createProduct } = require("../helpers/db");

let a, b, productB;
beforeEach(async () => {
  await resetDb();
  a = await createMember();
  b = await createMember();
  productB = await createProduct(b.member.id, { name: "ของร้าน B" });
});
afterAll(() => conn.close());

test("รายการสินค้าเห็นเฉพาะของร้านตัวเอง", async () => {
  await createProduct(a.member.id, { name: "ของร้าน A" });
  const res = await api().get("/product/list").set(auth(a.token));
  expect(res.body.results.map((p) => p.name)).toEqual(["ของร้าน A"]);
});

test("แก้/ลบสินค้าร้านอื่นไม่ได้", async () => {
  await api().post("/product/update").set(auth(a.token)).send({ id: productB.id, name: "ถูกแก้", price: 1 });
  await api().delete(`/product/delete/${productB.id}`).set(auth(a.token));
  await productB.reload();
  expect(productB.name).toBe("ของร้าน B");
  expect(Number(productB.price)).toBe(100);
});

test("สร้างสินค้าโดยส่ง userId ของร้านอื่นมา → ถูกผูกกับร้านตัวเอง", async () => {
  await api().post("/product/insert").set(auth(a.token)).send({ name: "x", price: 1, cost: 1, barcode: "1", userId: b.member.id });
  expect(await ProductModel.count({ where: { userId: b.member.id } })).toBe(1);
});

test("รับสต็อกเข้าสินค้าร้านอื่นไม่ได้ (404)", async () => {
  const res = await api().post("/stock/save").set(auth(a.token)).send({ productId: productB.id, qty: 5 });
  expect(res.status).toBe(404);
  expect(await StockModel.count()).toBe(0);
});

test("ขายสินค้าร้านอื่นไม่ได้ (404)", async () => {
  await api().get("/billSale/openBill").set(auth(a.token));
  const res = await api().post("/billSele/sele").set(auth(a.token)).send({ id: productB.id });
  expect(res.status).toBe(404);
});

test("แก้จำนวน/ลบรายการในบิลของร้านอื่นไม่ได้", async () => {
  await api().get("/billSale/openBill").set(auth(b.token));
  await api().post("/billSele/sele").set(auth(b.token)).send({ id: productB.id });
  const detail = await BillSaleDetailModel.findOne();
  await api().post("/billSale/updateQty").set(auth(a.token)).send({ id: detail.id, qty: 99 });
  await api().delete(`/billSale/deleteItem/${detail.id}`).set(auth(a.token));
  await detail.reload();
  expect(Number(detail.qty)).toBe(1);
});

test("ผู้ใช้ (พนักงาน) ของร้านอื่น: มองไม่เห็น แก้ไม่ได้ ลบไม่ได้", async () => {
  const userB = await UserModel.create({ name: "พนักงาน B", usr: "b1", level: "user", userId: b.member.id });
  expect((await api().get("/user/list").set(auth(a.token))).body.results).toEqual([]);
  await api().post("/user/edit").set(auth(a.token)).send({ id: userB.id, name: "ถูกแก้" });
  await api().delete(`/user/delete/${userB.id}`).set(auth(a.token));
  await userB.reload();
  expect(userB.name).toBe("พนักงาน B");
});

test("user/list ไม่ส่งรหัสผ่านกลับไป", async () => {
  await api().post("/user/insert").set(auth(a.token)).send({ name: "n", usr: "u", pwd: "p", level: "user" });
  const res = await api().get("/user/list").set(auth(a.token));
  expect(res.body.results[0].pwd).toBeUndefined();
  const saved = await UserModel.findOne();
  expect(saved.pwd).toMatch(/^\$2[aby]\$/);
});
