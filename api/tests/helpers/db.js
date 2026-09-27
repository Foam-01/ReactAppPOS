// เครื่องมือเตรียมข้อมูลสำหรับ integration test (ใช้ Postgres จริง ไม่ mock)
const request = require("supertest");
const app = require("../../app");
const conn = require("../../connect");
const service = require("../../controllers/Service");
const PackageModel = require("../../models/PackageModel");
const MemberModel = require("../../models/MemberModel");
const AdminModel = require("../../models/AdminModel");
const ProductModel = require("../../models/ProductModel");

// model แต่ละไฟล์สั่ง sync() เองตอน require (ไม่ await) · ครั้งแรกอาจชนกันขณะสร้างตาราง จึงลองซ้ำ
let synced = false;
async function syncOnce() {
  for (let i = 0; !synced; i++) {
    try {
      await conn.sync();
      synced = true;
    } catch (e) {
      if (i >= 5) throw e;
      await new Promise((r) => setTimeout(r, 200));
    }
  }
}

async function resetDb() {
  await syncOnce();
  const tables = Object.values(conn.models).map((m) => `"${m.getTableName()}"`);
  await conn.query(`TRUNCATE ${tables.join(", ")} RESTART IDENTITY CASCADE`);
}

async function createPackage(attrs = {}) {
  return PackageModel.create({ name: "Free", bill_amount: 100, price: 0, ...attrs });
}

let phoneSeq = 800000000;
async function createMember({ pass = "secret123", packageId, ...attrs } = {}) {
  if (!packageId) packageId = (await createPackage()).id;
  const member = await MemberModel.create({
    name: "ร้านทดสอบ",
    phone: String(++phoneSeq).padStart(10, "0"),
    pass: await service.hashPassword(pass),
    packageId,
    ...attrs,
  });
  return { member, token: service.signToken(member.id, "member"), pass };
}

async function createAdmin({ pwd = "adminpass", ...attrs } = {}) {
  const admin = await AdminModel.create({
    name: "Admin",
    usr: "admin" + Math.random().toString(36).slice(2, 8),
    pwd: await service.hashPassword(pwd),
    level: "admin",
    ...attrs,
  });
  return { admin, token: service.signToken(admin.id, "admin"), pwd };
}

async function createProduct(userId, attrs = {}) {
  return ProductModel.create({
    barcode: "885" + Math.floor(Math.random() * 1e9),
    name: "สินค้าทดสอบ",
    cost: 50,
    price: 100,
    userId,
    ...attrs,
  });
}

const api = () => request(app);
const auth = (token) => ({ Authorization: "Bearer " + token });

// ขายครบ 1 บิลผ่าน API จริง: เปิดบิล → เพิ่มสินค้า (ซ้ำได้) → ปิดการขาย
async function sellBill(token, productIds) {
  await api().get("/billSale/openBill").set(auth(token)).expect(200);
  for (const id of productIds) {
    await api().post("/billSele/sele").set(auth(token)).send({ id }).expect(200);
  }
  return api().get("/billSale/endSale").set(auth(token));
}

module.exports = { app, conn, api, auth, resetDb, createPackage, createMember, createAdmin, createProduct, sellBill };
