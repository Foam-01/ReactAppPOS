import Modal from "../../components/Modal";
import EmptyState from "../../components/EmptyState";

// รายการสินค้าในบิลที่เลือก
function BillDetailModal({ bill }) {
  return (
    <Modal
      id="modalBillSaleDetail"
      title="🧾 รายละเอียดสินค้าในบิล"
      modalSize="modal-lg"
    >
      <div className="p-0">
        {" "}
        {/* ปรับ padding เป็น 0 เพื่อให้ตารางชิดขอบ Modal */}
        <div
          className="table-responsive border-0"
          style={{
            maxHeight: "70vh",
            overflowY: "auto",
            position: "relative",
          }}
        >
          <table className="table table-hover align-middle mb-0">
            <thead
              className="table-light text-muted small fw-bold sticky-top"
              style={{ zIndex: 10, top: 0 }}
            >
              <tr className="small text-uppercase fw-bold text-muted border-bottom">
                <th className="ps-3 py-3">บาร์โค้ด</th>
                <th className="py-3">รายการสินค้า</th>
                <th className="py-3 text-end">ราคา</th>
                <th className="py-3 text-center">จำนวน</th>
                <th className="py-3 text-end pe-3">ยอดรวม</th>
              </tr>
            </thead>

            <tbody>
              {bill?.billSaleDetails?.length > 0 ? (
                bill.billSaleDetails.map((item, index) => (
                  <tr key={index}>
                    <td className="ps-3 text-muted small">
                      {item.product.barcode}
                    </td>
                    <td className="fw-bold">{item.product.name}</td>
                    <td className="text-end font-monospace">
                      {Number(item.price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-center">
                      <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill fw-normal">
                        {item.qty}
                      </span>
                    </td>
                    <td className="text-end pe-3 fw-bold text-primary font-monospace">
                      {(item.price * item.qty).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
    <EmptyState icon="fa-info-circle" text="ไม่พบข้อมูลรายการสินค้าในบิลนี้" />
    </td>
                </tr>
              )}
            </tbody>

            {/* ยอดรวมล็อกไว้ด้านล่าง (Sticky Footer) */}
            {bill?.billSaleDetails?.length > 0 && (
              <tfoot
                className="sticky-bottom bg-white"
                style={{
                  zIndex: 10,
                  bottom: 0,
                  boxShadow: "0 -2px 10px rgba(0,0,0,0.05)", // เพิ่มเงาให้ดูมีมิติ
                }}
              >
                <tr className="border-top border-2">
                  <td colSpan="4" className="text-end fw-bold py-3 bg-light">
                    รวมทั้งสิ้น:
                  </td>
                  <td className="text-end pe-3 py-3 fw-bold h5 mb-0 text-primary font-monospace bg-light">
                    {bill.billSaleDetails
                      .reduce((sum, i) => sum + i.price * i.qty, 0)
                      .toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </Modal>
  );
}

export default BillDetailModal;
