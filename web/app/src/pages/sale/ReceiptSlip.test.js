import { render, screen } from "@testing-library/react";
import ReceiptSlip from "./ReceiptSlip";

// ReceiptSlip ใช้ `import * as dayjs` ซึ่ง webpack เรียกได้ แต่ Jest (CommonJS) ห่อเป็น object
// ติดธง __esModule ให้ Jest ส่งตัวฟังก์ชันจริงมาแทน (ไม่ได้ mock พฤติกรรม)
jest.mock("dayjs", () => {
  const dayjs = jest.requireActual("dayjs");
  dayjs.__esModule = true;
  return dayjs;
});

// ราคา/จำนวนจาก API เป็นข้อความ (BIGINT ของ Postgres)
const lastBill = {
  id: 42,
  createdAt: "2026-09-28T10:30:00+07:00",
  billSaleDetails: [
    { qty: "2", price: "65", product: { name: "กาแฟ", barcode: "885001" } },
    { qty: "1", price: "35", product: null },
  ],
};

test("แสดงรายการ ยอดรวม และชื่อสินค้าที่ถูกลบเป็น 'ไม่ระบุชื่อ'", () => {
  render(<ReceiptSlip lastBill={lastBill} memberInfo={{ name: "ร้านทดสอบ" }} />);
  expect(screen.getByText("กาแฟ")).toBeInTheDocument();
  expect(screen.getByText("ไม่ระบุชื่อ")).toBeInTheDocument();
  expect(screen.getByText("130.00")).toBeInTheDocument();
  // รวม 2×65 + 1×35 = 165 · ไม่มียอดรับเงิน → ถือว่าจ่ายพอดี เงินทอน 0
  expect(screen.getAllByText("165.00").length).toBeGreaterThanOrEqual(3);
  expect(screen.getByText("0.00")).toBeInTheDocument();
});

test("ไม่มีบิล: แสดงข้อความแทนสลิปว่าง", () => {
  render(<ReceiptSlip lastBill={{}} memberInfo={{}} />);
  expect(screen.getByText("ไม่พบข้อมูลสลิป")).toBeInTheDocument();
});
