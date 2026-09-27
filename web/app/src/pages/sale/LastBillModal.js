import Modal from "../../components/Modal";
import EmptyState from "../../components/EmptyState";

// รายละเอียดบิลล่าสุด + พิมพ์ซ้ำ
function LastBillModal({ lastBill, onPrint }) {
  return (
    <Modal
      id="modalLastBill"
      title="🧾 รายละเอียดบิลล่าสุด"
      modalSize="modal-lg"
    >
      <div className="p-2">
        {/* สรุปข้อมูลหัวบิลสั้นๆ */}
        <div className="d-flex justify-content-between mb-3 small text-muted px-2">
          <span>
            เลขที่บิล:{" "}
            <span className="fw-bold text-dark">{lastBill?.id || "-"}</span>
          </span>
          <span>
            วันที่:{" "}
            <span className="fw-bold text-dark">
              {lastBill?.createdAt
                ? new Date(lastBill.createdAt).toLocaleDateString()
                : "-"}
            </span>
          </span>
        </div>

        <div
          className="table-responsive border rounded shadow-sm"
          style={{ maxHeight: "60vh" }}
        >
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small fw-bold sticky-top">
              <tr
                className="small text-uppercase"
                style={{ letterSpacing: "0.5px" }}
              >
                <th className="ps-3" width="150">
                  บาร์โค้ด
                </th>
                <th>รายการสินค้า</th>
                <th className="text-end" width="100">
                  ราคา
                </th>
                <th className="text-center" width="80">
                  จำนวน
                </th>
                <th className="text-end pe-3" width="120">
                  ยอดรวม
                </th>
              </tr>
            </thead>
            <tbody className="small">
              {lastBill?.billSaleDetails !== undefined &&
              lastBill.billSaleDetails.length > 0 ? (
                lastBill.billSaleDetails.map((item, index) => (
                  <tr key={index}>
                    <td className="ps-3 text-muted">
                      {item.product.barcode}
                    </td>
                    <td>
                      <div className="fw-bold">{item.product.name}</div>
                    </td>
                    <td className="text-end">
                      {Number(item.price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-center fw-bold text-primary bg-light">
                      {item.qty}
                    </td>
                    <td className="text-end pe-3 fw-bold">
                      {(item.price * item.qty).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
    <EmptyState icon="fa-file-invoice" text="ไม่พบข้อมูลรายการในบิลนี้" />
    </td>
                </tr>
              )}
            </tbody>
            {/* ส่วนสรุปท้ายตาราง */}
            <tfoot className="table-light fw-bold">
              <tr>
                <td colSpan="4" className="text-end">
                  รวมทั้งสิ้น
                </td>
                <td className="text-end pe-3 text-primary h5 mb-0 fw-bold">
                  {lastBill?.billSaleDetails
                    ?.reduce((sum, item) => sum + item.price * item.qty, 0)
                    .toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="text-center mt-4 mb-2">
          <button
            onClick={onPrint}
            className="btn btn-primary px-4 rounded-pill ms-2 shadow-sm"
          >
            <i className="fa-solid fa-print me-2"></i> พิมพ์บิลอีกครั้ง
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default LastBillModal;
