import config from "../config";

// mock เฉพาะชั้น HTTP · ตรรกะ cache ทำงานจริง
jest.mock("axios", () => ({ get: jest.fn() }));

let getMemberInfo;
let axios;
beforeEach(() => {
  jest.resetModules(); // cache ใหม่ทุกเทส · ต้อง require axios ใหม่ให้เป็นตัวเดียวกับที่ module ใช้
  axios = require("axios");
  axios.get.mockReset();
  localStorage.setItem(config.token_name, "token-A");
  ({ getMemberInfo } = require("./memberCache"));
});

test("เรียกซ้ำใช้ผลเดิม ไม่ยิง API ใหม่", async () => {
  axios.get.mockResolvedValue({ data: { message: "success", result: { name: "ร้าน A" } } });
  await getMemberInfo();
  const again = await getMemberInfo();
  expect(again.result.name).toBe("ร้าน A");
  expect(axios.get).toHaveBeenCalledTimes(1);
});

test("force = true โหลดใหม่", async () => {
  axios.get.mockResolvedValue({ data: { message: "success" } });
  await getMemberInfo();
  await getMemberInfo(true);
  expect(axios.get).toHaveBeenCalledTimes(2);
});

test("เปลี่ยนบัญชี (token ใหม่) ไม่ได้ข้อมูลของคนเดิม", async () => {
  axios.get.mockResolvedValueOnce({ data: { result: { name: "ร้าน A" } } });
  axios.get.mockResolvedValueOnce({ data: { result: { name: "ร้าน B" } } });
  expect((await getMemberInfo()).result.name).toBe("ร้าน A");
  localStorage.setItem(config.token_name, "token-B");
  expect((await getMemberInfo()).result.name).toBe("ร้าน B");
});

test("error ไม่ถูกเก็บ เรียกครั้งถัดไปลองใหม่", async () => {
  axios.get.mockRejectedValueOnce(new Error("down"));
  axios.get.mockResolvedValueOnce({ data: { result: { name: "ร้าน A" } } });
  await expect(getMemberInfo()).rejects.toThrow("down");
  await new Promise((r) => setTimeout(r, 0));
  expect((await getMemberInfo()).result.name).toBe("ร้าน A");
});
