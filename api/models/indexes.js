const conn = require("../connect");

// index สำหรับคอลัมน์ที่ใช้กรอง/JOIN บ่อย
// IF NOT EXISTS: รันซ้ำทุกครั้งที่เริ่ม server ได้ ไม่กระทบข้อมูล
const indexes = [
  'CREATE INDEX IF NOT EXISTS "billSales_userId_status_createdAt" ON "billSales" ("userId", "status", "createdAt")',
  'CREATE INDEX IF NOT EXISTS "billSales_userId_status_updatedAt" ON "billSales" ("userId", "status", "updatedAt")',
  'CREATE INDEX IF NOT EXISTS "billSaleDetails_billSaleId" ON "billSaleDetails" ("billSaleId")',
  'CREATE INDEX IF NOT EXISTS "billSaleDetails_productId" ON "billSaleDetails" ("productId")',
  'CREATE INDEX IF NOT EXISTS "products_userId" ON "products" ("userId")',
  'CREATE INDEX IF NOT EXISTS "productlmages_productId" ON "productlmages" ("productId")',
  'CREATE INDEX IF NOT EXISTS "stocks_productId" ON "stocks" ("productId")',
  'CREATE INDEX IF NOT EXISTS "stocks_userId" ON "stocks" ("userId")',
  'CREATE INDEX IF NOT EXISTS "ChangePackages_createdAt" ON "ChangePackages" ("createdAt")',
  'CREATE UNIQUE INDEX IF NOT EXISTS "members_phone" ON "members" ("phone")',
];

module.exports = async function ensureIndexes() {
  for (const sql of indexes) {
    try {
      await conn.query(sql);
    } catch (e) {
      // ฐานข้อมูลใหม่: ตารางอาจยังสร้างไม่เสร็จ จะสร้าง index ในการเริ่ม server ครั้งถัดไป
      console.warn("index skipped:", e.message);
    }
  }
};
