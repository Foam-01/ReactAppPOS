// E2E: สมัครสมาชิก → เข้าสู่ระบบ → ออกจากระบบ และ error flow ที่ผู้ใช้เจอจริง
const { test, expect } = require("@playwright/test");
const { newShop, register, login } = require("./helpers");

test("สมัครแพ็กเกจ → เข้าสู่ระบบ → เห็นหน้าภาพรวม → ออกจากระบบ", async ({ page }) => {
  const shop = newShop();
  await register(page, shop);

  // หลังสมัครเสร็จ ระบบพาไปหน้าเข้าสู่ระบบ
  await expect(page).toHaveURL(/\/login$/);
  await login(page, shop);

  await expect(page.getByRole("heading", { name: "ภาพรวมร้าน" })).toBeVisible();
  // ร้านใหม่ยังไม่มีบิล → เห็นขั้นตอนเริ่มต้นใช้งาน
  await expect(page.getByText("เริ่มต้นใช้งาน")).toBeVisible();

  await page.getByRole("button", { name: /ออกจากระบบ/ }).first().click();
  await page.getByRole("button", { name: "ใช่, ออกจากระบบ" }).click();
  await expect(page).toHaveURL(/\/login$/);

  // ออกแล้วเข้าหน้าในระบบไม่ได้
  await page.goto("/home");
  await expect(page).toHaveURL(/\/login$/);
});

test("รหัสผ่านผิด: แจ้งเตือนและยังอยู่หน้าเข้าสู่ระบบ", async ({ page }) => {
  await page.goto("/login");
  await page.locator("#login-phone").fill("0899999999");
  await page.locator("#login-pass").fill("wrong-password");
  await page.getByRole("button", { name: /เข้าสู่ระบบ/ }).click();
  await expect(page.locator(".swal2-popup")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("token หมดอายุ/ไม่ถูกต้อง: เด้งไปหน้าเข้าสู่ระบบพร้อมแจ้ง", async ({ page }) => {
  await page.goto("/login");
  await page.evaluate(() => localStorage.setItem("pos_token", "expired.or.forged"));
  await page.goto("/home");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText(/เซสชันหมดอายุ/)).toBeVisible();
});
