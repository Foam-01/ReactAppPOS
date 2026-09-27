// unit test ของ controllers/Service.js (ไม่ใช้ฐานข้อมูล)
const jwt = require("jsonwebtoken");
const service = require("../../controllers/Service");

const runMiddleware = (mw, headers = {}) => {
  const req = { headers };
  const res = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    send(body) { this.body = body; return this; },
  };
  let nextCalled = false;
  mw(req, res, () => { nextCalled = true; });
  return { req, res, nextCalled };
};

describe("toPositiveInt", () => {
  test.each([
    [1, 1], ["5", 5], [100000, 100000],
  ])("รับ %p → %p", (input, expected) => {
    expect(service.toPositiveInt(input)).toBe(expected);
  });

  test.each([0, -1, 1.5, "abc", "", null, undefined, NaN, Infinity, "1e400", [], {}])(
    "ปฏิเสธ %p",
    (input) => expect(service.toPositiveInt(input)).toBeNull(),
  );
});

describe("pick (กัน mass assignment)", () => {
  test("เลือกเฉพาะฟิลด์ที่อนุญาต ข้าม undefined", () => {
    const body = { name: "a", price: 0, userId: 999, id: 5, detail: undefined };
    expect(service.pick(body, ["name", "price", "detail"])).toEqual({ name: "a", price: 0 });
  });
  test("body เป็น null/undefined ได้ object ว่าง", () => {
    expect(service.pick(null, ["a"])).toEqual({});
    expect(service.pick(undefined, ["a"])).toEqual({});
  });
});

describe("hashPassword / checkPassword", () => {
  test("hash แล้วตรวจผ่าน และ hash ไม่ใช่ข้อความเดิม", async () => {
    const hash = await service.hashPassword("secret123");
    expect(hash).not.toBe("secret123");
    expect(await service.checkPassword("secret123", hash)).toEqual({ ok: true, needsRehash: false });
    expect(await service.checkPassword("wrong", hash)).toEqual({ ok: false, needsRehash: false });
  });
  test("รหัสเดิมที่เป็น plaintext: ผ่านได้และต้อง rehash", async () => {
    expect(await service.checkPassword("old", "old")).toEqual({ ok: true, needsRehash: true });
    expect((await service.checkPassword("x", "old")).ok).toBe(false);
  });
  test.each([
    ["", "hash"], [null, "hash"], [123, "123"], ["a", null], ["a", ""],
  ])("ข้อมูลว่าง/ผิดชนิด (%p, %p) ไม่ผ่าน", async (plain, stored) => {
    expect((await service.checkPassword(plain, stored)).ok).toBe(false);
  });
});

describe("isMember / isAdmin / isLogin", () => {
  const bearer = (t) => ({ authorization: "Bearer " + t });

  test("ไม่มี token → 401", () => {
    const { res, nextCalled } = runMiddleware(service.isMember);
    expect(res.statusCode).toBe(401);
    expect(nextCalled).toBe(false);
  });
  test("header ไม่ขึ้นต้นด้วย Bearer → 401", () => {
    const token = service.signToken(1, "member");
    expect(runMiddleware(service.isMember, { authorization: token }).res.statusCode).toBe(401);
  });
  test("token ถูกต้อง → next และตั้ง req.auth", () => {
    const { req, nextCalled } = runMiddleware(service.isMember, bearer(service.signToken(7, "member")));
    expect(nextCalled).toBe(true);
    expect(service.getMemberId(req)).toBe(7);
  });
  test("role ไม่ตรง → 403", () => {
    expect(runMiddleware(service.isAdmin, bearer(service.signToken(1, "member"))).res.statusCode).toBe(403);
    expect(runMiddleware(service.isMember, bearer(service.signToken(1, "admin"))).res.statusCode).toBe(403);
  });
  test("isLogin รับได้ทั้งสอง role", () => {
    expect(runMiddleware(service.isLogin, bearer(service.signToken(1, "admin"))).nextCalled).toBe(true);
    expect(runMiddleware(service.isLogin, bearer(service.signToken(1, "member"))).nextCalled).toBe(true);
  });
  test("token ที่เซ็นด้วย secret อื่น → 401", () => {
    const forged = jwt.sign({ id: 1, role: "admin" }, "another-secret-that-is-long-enough-xxxxxxxx");
    expect(runMiddleware(service.isAdmin, bearer(forged)).res.statusCode).toBe(401);
  });
  test("alg none → 401", () => {
    const none = jwt.sign({ id: 1, role: "admin" }, null, { algorithm: "none" });
    expect(runMiddleware(service.isAdmin, bearer(none)).res.statusCode).toBe(401);
  });
  test("token หมดอายุ → 401", () => {
    const expired = jwt.sign({ id: 1, role: "member", exp: Math.floor(Date.now() / 1000) - 10 }, process.env.TOKEN_SECRET);
    expect(runMiddleware(service.isMember, bearer(expired)).res.statusCode).toBe(401);
  });
});

describe("sendError", () => {
  test("ส่ง 500 ข้อความกลาง ๆ ไม่เปิดเผยรายละเอียด", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const res = { headersSent: false, status(c) { this.code = c; return this; }, send(b) { this.body = b; } };
    service.sendError(res, new Error("SELECT * FROM secret_table"));
    expect(res.code).toBe(500);
    expect(JSON.stringify(res.body)).not.toMatch(/secret_table/);
    spy.mockRestore();
  });
  test("ไม่ส่งซ้ำเมื่อส่ง header ไปแล้ว", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const res = { headersSent: true, status: jest.fn(), send: jest.fn() };
    service.sendError(res, new Error("x"));
    expect(res.status).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
