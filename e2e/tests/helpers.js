// ขั้นตอนที่ใช้ซ้ำใน E2E · ทำผ่านหน้าเว็บจริงเหมือนผู้ใช้ (ไม่ยิง API ลัด)
const { expect } = require("@playwright/test");

let seq = 0;
// เบอร์ 10 หลักไม่ซ้ำกันในแต่ละรอบ
const newShop = (name = "ร้านทดสอบ E2E") => ({
  name,
  phone: "08" + String(Date.now() % 1e7).padStart(7, "0") + String(seq++ % 10),
  pass: "secret123",
});

async function register(page, shop, packageName = "Free") {
  await page.goto("/");
  const card = page.locator(".card", { hasText: packageName }).filter({
    has: page.getByRole("button", { name: "สมัครแพ็กเกจนี้" }),
  });
  await card.getByRole("button", { name: "สมัครแพ็กเกจนี้" }).click();

  const modal = page.locator("#modalRegister");
  await expect(modal).toBeVisible();
  await modal.locator("#package-field-1").fill(shop.name);
  await modal.locator("#package-field-2").fill(shop.phone);
  await modal.locator("#package-field-3").fill(shop.pass);
  await modal.locator("button[type=submit]").click();

  await page.getByRole("button", { name: "ยืนยัน" }).click();
  await expect(page.getByText("สมัครใช้งานสำเร็จ")).toBeVisible();
}

async function login(page, shop) {
  if (!/\/login$/.test(page.url())) await page.goto("/login");
  await page.locator("#login-phone").fill(shop.phone);
  await page.locator("#login-pass").fill(shop.pass);
  await page.getByRole("button", { name: /เข้าสู่ระบบ/ }).click();
  await expect(page).toHaveURL(/\/home$/);
}

module.exports = { newShop, register, login };
