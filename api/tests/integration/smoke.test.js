const { api, resetDb, conn } = require("../helpers/db");
beforeAll(resetDb);
afterAll(() => conn.close());
test("server ตอบ /package/list ได้จาก DB ทดสอบ", async () => {
  const res = await api().get("/package/list");
  expect(res.status).toBe(200);
  expect(res.body).toEqual([]);
});
