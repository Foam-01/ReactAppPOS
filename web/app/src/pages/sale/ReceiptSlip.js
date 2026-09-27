import * as dayjs from "dayjs";

// สลิปใบเสร็จ (id="slip" ใช้ตอนสั่งพิมพ์)
function ReceiptSlip({ lastBill, memberInfo }) {
  return (
    <div
      id="slip"
      className="receipt-paper mx-auto bg-white text-dark p-3 shadow-sm"
    >
      <style>{`
        .receipt-paper {
          width: 80mm;
          max-width: 100%;
          font-family: 'Courier New', Courier, monospace, 'Sarabun', sans-serif;
          font-size: 12px;
          color: #000;
        }
        .receipt-paper * {
          line-height: 1.4 !important;
        }
        .receipt-paper p, .receipt-paper div, .receipt-paper td { margin: 0; padding: 0; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .fw-bold { font-weight: bold; }
        .dashed-line { border-bottom: 1px dashed #000; margin: 8px 0; height: 1px; }
        table.w-100 { width: 100%; }
        table td { vertical-align: top; padding: 2px 0; }

        /* 🌟 โค้ดบังคับให้ปริ้นต์สีดำและเส้นต่างๆ ออกมาให้ครบ 🌟 */
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * { visibility: hidden; }
          #slip, #slip * { visibility: visible; color: #000 !important; }
          #slip { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 80mm; 
            padding: 0; margin: 0;
            box-shadow: none !important; border: none !important;
          }
          @page { size: auto; margin: 0mm; }
        }
      `}</style>

      {lastBill && lastBill.id ? (
        <>
          <div className="text-center mb-2">
            <div className="fw-bold" style={{ fontSize: "18px" }}>
              POS ON CLOUD
            </div>
            <div>123 ถ.ตัวอย่าง แขวงทดสอบ</div>
            <div>เขตจำลอง กรุงเทพฯ 10000</div>
            <div>TAX ID: 0105555000000</div>
            <div className="fw-bold mt-2" style={{ fontSize: "14px" }}>
              ใบเสร็จรับเงิน / ย่อ
            </div>
            <div>(RECEIPT)</div>
          </div>

          <table className="w-100 mt-2">
            <tbody>
              <tr>
                <td className="text-left">เลขที่บิล (No):</td>
                <td className="text-right fw-bold">#{lastBill.id}</td>
              </tr>
              <tr>
                <td className="text-left">วันที่ (Date):</td>
                <td className="text-right">
                  {dayjs(lastBill.createdAt).format("DD/MM/YYYY HH:mm")}
                </td>
              </tr>
              <tr>
                <td className="text-left">พนักงาน:</td>
                <td className="text-right">{memberInfo?.name || "Admin"}</td>
              </tr>
            </tbody>
          </table>

          <div className="dashed-line"></div>

          <table className="w-100">
            <thead>
              <tr className="fw-bold">
                <td className="text-left">รายการ (Item)</td>
                <td className="text-right">รวม</td>
              </tr>
            </thead>
            {lastBill.billSaleDetails?.map((item, index) => (
              <tbody key={index}>
                <tr>
                  <td colSpan="2" className="text-left fw-bold pt-1">
                    {item.product?.name || "ไม่ระบุชื่อ"}
                  </td>
                </tr>
                <tr>
                  <td
                    className="text-left text-muted"
                    style={{ paddingLeft: "10px" }}
                  >
                    {item.qty} x {Number(item.price).toLocaleString("th-TH")}
                  </td>
                  <td className="text-right">
                    {(item.qty * item.price).toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tbody>
            ))}
          </table>

          <div className="dashed-line"></div>

          {/* 🌟 ส่วนตารางสรุปยอดที่แก้ Logic เข้าไปแล้ว 🌟 */}
          {(() => {
            // คำนวณยอดรวมของบิลนี้
            const billTotal =
              lastBill.billSaleDetails?.reduce(
                (sum, item) => sum + item.price * item.qty,
                0,
              ) || 0;
            // ถ้า Backend ส่งยอดที่รับมาให้ (lastBill.pay) ก็ใช้ค่านั้น ถ้าไม่มีก็ถือว่าจ่ายพอดีเป๊ะ
            const cashReceived = lastBill.pay
              ? Number(lastBill.pay)
              : billTotal;
            // คำนวณเงินทอน
            const change = cashReceived - billTotal;

            return (
              <table className="w-100">
                <tbody>
                  <tr>
                    <td className="text-left">รวมเป็นเงิน:</td>
                    <td className="text-right">
                      {billTotal.toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                  <tr className="fw-bold" style={{ fontSize: "14px" }}>
                    <td className="text-left py-1">ยอดสุทธิ (TOTAL):</td>
                    <td className="text-right py-1">
                      {billTotal.toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-left">รับเงินสด:</td>
                    <td className="text-right">
                      {cashReceived.toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-left">เงินทอน:</td>
                    <td className="text-right">
                      {change.toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                </tbody>
              </table>
            );
          })()}

          <div className="dashed-line"></div>

          <div className="text-center mt-3 pb-4">
            <div className="fw-bold">ขอบคุณที่ใช้บริการ</div>
            <div>Thank you, please come again.</div>

            <div className="mt-3">
              <svg
                width="140"
                height="35"
                viewBox="0 0 120 30"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 0h4v30H0zM6 0h2v30H6zM10 0h6v30h-6zM20 0h2v30h-2zM26 0h8v30h-8zM36 0h2v30h-2zM42 0h4v30h-4zM50 0h6v30h-6zM58 0h2v30h-2zM64 0h4v30h-4zM72 0h2v30h-2zM78 0h8v30h-8zM88 0h2v30h-2zM92 0h4v30h-4zM100 0h6v30h-6zM108 0h2v30h-2zM114 0h6v30h-6z"
                  fill="#000"
                />
              </svg>
              <div
                style={{
                  fontSize: "11px",
                  letterSpacing: "4px",
                  marginTop: "2px",
                }}
              >
                {String(lastBill.id).padStart(10, "0")}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-5 text-muted">
          <i className="fa-solid fa-receipt fa-2x mb-2 opacity-50"></i>
          <div>ไม่พบข้อมูลสลิป</div>
        </div>
      )}
    </div>
  );
}

export default ReceiptSlip;
