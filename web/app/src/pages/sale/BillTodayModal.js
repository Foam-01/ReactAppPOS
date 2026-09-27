import Modal from "../../components/Modal";
import EmptyState from "../../components/EmptyState";
import * as dayjs from "dayjs";

// รายการบิลของวันนี้
function BillTodayModal({ billToday, onSelectBill }) {
  return (
    <Modal
      id="modalBillToday"
      title="📅 รายการบิลของวันนี้"
      modalSize="modal-lg"
    >
      <div className="p-2">
        <div className="table-responsive border rounded-3 overflow-hidden shadow-sm">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-muted small fw-bold">
              <tr className="small text-uppercase fw-bold text-muted">
                <th width="120px" className="text-center py-3 border-0"></th>
                <th className="py-3 border-0">เลขบิล</th>
                <th className="py-3 border-0 text-end pe-4">
                  วัน เวลาที่ขาย
                </th>
              </tr>
            </thead>
            <tbody>
              {billToday.length > 0 ? (
                billToday.map((item, index) => (
                  <tr key={index}>
                    <td className="text-center py-2">
                      {/* เพิ่มคลาส text-nowrap เข้าไปครับ */}
                      <button
                        onClick={(e) => onSelectBill(item)}
                        data-toggle="modal"
                        data-target="#modalBillSaleDetail"
                        className="btn btn-sm btn-outline-primary rounded-pill px-3 d-inline-flex align-items-center justify-content-center text-nowrap"
                        style={{ height: "32px", fontSize: "0.85rem" }}
                      >
                        <i
                          className="fa-solid fa-eye me-1"
                          style={{ fontSize: "0.85rem" }}
                        ></i>
                        ดูรายการ
                      </button>
                    </td>
                    <td className="fw-bold text-dark fs-6">#{item.id}</td>
                    <td className="text-end pe-4 text-muted">
                      {/* จัด Badge ให้ตรงกลางเหมือนกัน */}
                      <span className="badge bg-light text-dark fw-normal border d-inline-flex align-items-center px-2 py-1">
                        <i className="fa-solid fa-clock me-2 opacity-50"></i>
                        {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">
    <EmptyState icon="fa-folder-open" text="ยังไม่มีรายการขายในวันนี้" />
    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

export default BillTodayModal;
