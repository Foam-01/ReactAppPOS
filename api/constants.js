// สถานะบิลขาย (ค่าที่เก็บในคอลัมน์ billSales.status)
const BILL_STATUS = Object.freeze({
  OPEN: "open", // บิลที่กำลังขาย ยังไม่ชำระ
  PAY: "pay", // ชำระเงินแล้ว
});

module.exports = { BILL_STATUS };
