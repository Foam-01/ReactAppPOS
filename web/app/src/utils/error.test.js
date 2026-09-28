import { getErrorMessage } from "./error";

describe("getErrorMessage", () => {
  test("ใช้ข้อความจาก server เมื่อมี", () => {
    expect(getErrorMessage({ response: { data: { message: "ไม่พบสินค้า" } } })).toBe("ไม่พบสินค้า");
    expect(getErrorMessage({ response: { data: "ข้อความตรง ๆ" } })).toBe("ข้อความตรง ๆ");
  });

  test("server ตอบแต่ไม่มีข้อความ → ข้อความกลาง", () => {
    expect(getErrorMessage({ response: { data: {} } })).toBe("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
  });

  test("ไม่มีคำตอบ (เน็ตหลุด / server ล่ม) → บอกให้ตรวจอินเทอร์เน็ต", () => {
    expect(getErrorMessage({ request: {} })).toMatch(/เชื่อมต่อเซิร์ฟเวอร์ไม่ได้/);
    expect(getErrorMessage({ code: "ERR_NETWORK" })).toMatch(/เชื่อมต่อเซิร์ฟเวอร์ไม่ได้/);
  });

  test("error ทั่วไป / ว่าง", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
    expect(getErrorMessage(null)).toBe("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
  });
});
