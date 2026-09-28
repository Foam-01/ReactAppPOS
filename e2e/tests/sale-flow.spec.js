// E2E เส้นทางหลักของร้าน: เพิ่มสินค้า → รับสต็อก → ขาย → รายงานตรงกัน → ครบโควตาแพ็กเกจ
const { test, expect } = require("@playwright/test");
const { newShop, register, login } = require("./helpers");

test.describe.configure({ mode: "serial" });

const PRODUCT = { barcode: "8850001234567", name: "กาแฟเย็น E2E", price: "65", cost: "30" };

/** @type {import('@playwright/test').Page} */
let page;
const shop = newShop("ร้านกาแฟ E2E");

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  await register(page, shop, "Free"); // แพ็กเกจ Free = 3 บิล/เดือน (ตั้งใน global-setup)
  await login(page, shop);
});
test.afterAll(() => page.close());

// ปิด popup แจ้งผล (SweetAlert) ถ้ามี
const dismissSwal = async () => {
  const ok = page.locator(".swal2-confirm:visible");
  if (await ok.count()) await ok.click();
};

async function sellOnce(amountReceived) {
  await page.goto("/sale");
  const search = page.getByPlaceholder("ค้นหาชื่อ หรือสแกนบาร์โค้ด แล้วกด Enter");
  await search.fill(PRODUCT.barcode); // สแกนบาร์โค้ด
  await search.press("Enter");
  await expect(page.getByRole("cell", { name: PRODUCT.name })).toBeVisible();

  await page.locator("button[data-target='#modalEndSale']:visible").click();
  const modal = page.locator("#modalEndSale");
  await expect(modal).toBeVisible();
  await modal.locator("#sale-field-1").fill(String(amountReceived));
  await modal.getByRole("button", { name: /จบการขาย/ }).click();
}

test("เพิ่มสินค้าใหม่", async () => {
  await page.goto("/product");
  await page.getByRole("button", { name: "เพิ่มสินค้า" }).click();
  const modal = page.locator("#modalProduct");
  await expect(modal).toBeVisible();
  await modal.getByLabel("บาร์โค้ด").fill(PRODUCT.barcode);
  await modal.getByLabel("ชื่อสินค้า").fill(PRODUCT.name);
  await modal.locator("#product-field-3").fill(PRODUCT.price);
  await modal.getByLabel("ราคาทุน").fill(PRODUCT.cost);
  await modal.getByRole("button", { name: /บันทึกรายการ/ }).click();
  await expect(page.getByText("บันทึกข้อมูลเรียบร้อยแล้ว")).toBeVisible();
  await dismissSwal();
  await expect(page.getByRole("cell", { name: PRODUCT.name })).toBeVisible();
});

test("รับสินค้าเข้าสต็อก 10 ชิ้น", async () => {
  await page.goto("/stock");
  await page.locator("button[data-target='#modalProduct']").click();
  const modal = page.locator("#modalProduct");
  await expect(modal).toBeVisible();
  await modal.getByRole("row", { name: new RegExp(PRODUCT.name) }).getByRole("button", { name: /เลือกรายการ/ }).click();
  await expect(page.locator("#stock-field-1")).toHaveValue(PRODUCT.name);
  await page.locator("#stock-field-2").fill("10");
  await page.getByRole("button", { name: /บันทึกรายการ/ }).click();
  await dismissSwal();
  await expect(page.getByRole("cell", { name: PRODUCT.name })).toBeVisible();
});

test("ขาย: สแกนบาร์โค้ด → รับเงิน 100 → ปิดการขายสำเร็จ", async () => {
  await sellOnce(100);
  await expect(page.getByText("บันทึกการขายแล้ว")).toBeVisible();
  // บิลใหม่ว่างแล้ว ยอดรวมกลับเป็น 0
  await expect(page.getByText("ยังไม่มีรายการสินค้า")).toBeVisible();
});

test("รายงานตรงกับการขาย: บิลขาย, ภาพรวมร้าน, สต็อกคงเหลือ", async () => {
  await page.goto("/billSales");
  await expect(page.getByText("1 บิล")).toBeVisible();

  await page.goto("/home");
  await expect(page.getByRole("heading", { name: "ภาพรวมร้าน" })).toBeVisible();
  await expect(page.getByText("65.00").first()).toBeVisible();
  await expect(page.getByText(PRODUCT.name).first()).toBeVisible(); // สินค้าขายดี / บิลล่าสุด

  await page.goto("/ReportStock");
  const row = page.getByRole("row", { name: new RegExp(PRODUCT.name) });
  await expect(row).toContainText("10"); // รับเข้า
  await expect(row).toContainText("9"); // คงเหลือ
});

test("ครบโควตา 3 บิล/เดือน: บิลที่ 4 ถูกปฏิเสธ พร้อมบอกให้อัปเกรด และสินค้าไม่หายจากบิล", async () => {
  await sellOnce(65);
  await expect(page.getByText("บันทึกการขายแล้ว")).toBeVisible();
  await sellOnce(65);
  await expect(page.getByText("บันทึกการขายแล้ว")).toBeVisible();

  await sellOnce(65);
  await expect(page.getByText(/ใช้จำนวนบิลครบตามแพ็กเกจ/)).toBeVisible();
  await dismissSwal();
  // บิลยังเปิดอยู่พร้อมสินค้า ไม่ต้องหยิบใหม่หลังอัปเกรด
  await page.goto("/sale");
  await expect(page.getByRole("cell", { name: PRODUCT.name })).toBeVisible();
  // ตัวเลขแถบซ้ายเท่ากับโควตาพอดี (B7)
  await expect(page.getByText(/3\s*\/\s*3/)).toBeVisible();
});
