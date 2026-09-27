const MemberModel = require("../../models/MemberModel");
const AdminModel = require("../../models/AdminModel");
const { api, auth, conn, resetDb, createMember, createAdmin, createPackage } = require("../helpers/db");

beforeEach(resetDb);
afterAll(() => conn.close());

describe("POST /member/signin", () => {
  test("happy path: ได้ token ที่ใช้เรียก API ของ member ได้", async () => {
    const { member, pass } = await createMember();
    const res = await api().post("/member/signin").send({ phone: member.phone, pass });
    expect(res.status).toBe(200);
    const info = await api().get("/member/info").set(auth(res.body.token));
    expect(info.status).toBe(200);
    expect(info.body.result.id).toBe(member.id);
  });

  test("รหัสผิด / เบอร์ไม่มี / ชนิดข้อมูลผิด → 401 ข้อความเดียวกัน (ไม่บอกว่าเบอร์มีจริง)", async () => {
    const { member } = await createMember();
    const wrongPass = await api().post("/member/signin").send({ phone: member.phone, pass: "nope" });
    const noUser = await api().post("/member/signin").send({ phone: "0999999999", pass: "nope" });
    const badType = await api().post("/member/signin").send({ phone: { $ne: null }, pass: "x" });
    for (const r of [wrongPass, noUser, badType]) {
      expect(r.status).toBe(401);
      expect(r.body.token).toBeUndefined();
    }
    expect(wrongPass.body).toEqual(noUser.body);
  });

  test("รหัส plaintext เดิม: เข้าได้ และถูกแปลงเป็น bcrypt", async () => {
    const pkg = await createPackage();
    const m = await MemberModel.create({ name: "เก่า", phone: "0811111111", pass: "legacy1", packageId: pkg.id });
    const res = await api().post("/member/signin").send({ phone: "0811111111", pass: "legacy1" });
    expect(res.status).toBe(200);
    await m.reload();
    expect(m.pass).toMatch(/^\$2[aby]\$/);
  });
});

describe("POST /admin/signin", () => {
  test("happy path + รหัสผิด", async () => {
    const { admin, pwd } = await createAdmin();
    const ok = await api().post("/admin/signin").send({ usr: admin.usr, pwd });
    expect(ok.status).toBe(200);
    expect((await api().get("/admin/info").set(auth(ok.body.token))).status).toBe(200);
    expect((await api().post("/admin/signin").send({ usr: admin.usr, pwd: "x" })).status).toBe(401);
  });
});

describe("Authorization ตาม role", () => {
  test("ไม่มี token → 401 ทุก endpoint ที่ต้องล็อกอิน", async () => {
    const endpoints = [
      ["get", "/product/list"], ["get", "/billSale/list"], ["get", "/stock/report"],
      ["get", "/user/list"], ["get", "/member/info"], ["get", "/admin/list"], ["get", "/member/list"],
    ];
    for (const [method, url] of endpoints) {
      expect([url, (await api()[method](url)).status]).toEqual([url, 401]);
    }
  });

  test("member เรียก endpoint ของ admin → 403", async () => {
    const { token } = await createMember();
    for (const url of ["/admin/list", "/member/list", "/changePackage/list"]) {
      expect([url, (await api().get(url).set(auth(token))).status]).toEqual([url, 403]);
    }
    const create = await api().post("/admin/create").set(auth(token)).send({ usr: "hack", pwd: "x" });
    expect(create.status).toBe(403);
    expect(await AdminModel.count()).toBe(0);
  });

  test("admin เรียก endpoint ของร้าน (member) → 403", async () => {
    const { token } = await createAdmin();
    expect((await api().get("/product/list").set(auth(token))).status).toBe(403);
  });

  test("admin เปลี่ยน level ตัวเองผ่าน ChangeProfile ไม่ได้", async () => {
    const { admin, token } = await createAdmin({ level: "user" });
    await api().post("/admin/ChangeProfile").set(auth(token)).send({ name: "ใหม่", level: "admin" });
    await admin.reload();
    expect(admin.name).toBe("ใหม่");
    expect(admin.level).toBe("user");
  });
});
