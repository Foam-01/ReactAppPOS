import Template from "../components/Template";
import Swal from "sweetalert2";
import axios from "axios";
import config from "../config";
import Modal from "../components/Modal";
import { useEffect, useState } from "react";
import * as dayjs from "dayjs";

function BillSales() {
  const [billSales, setBillSales] = useState([]);
  const [selectBill, setSelectBill] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(config.api_path + "/billSale/list", config.headers());
      if (res.data.message === "success") {
        setBillSales(res.data.results);
      }
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.response?.data?.message || e.message,
        icon: "error",
      });
    }
  };

  // ฟังก์ชันคำนวณยอดรวมต่อบิล
  const calculateTotal = (details) => {
    if (!details) return 0;
    return details.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
  };

  return (
    <Template>
      <div className="p-4 bg-light min-vh-100">
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          
          {/* ส่วนหัวของ Card */}
          <div className="card-header border-0 py-4 px-4 d-flex justify-content-between align-items-center bg-white">
            <div>
              <h5 className="mb-1 fw-bold text-dark">
                <i className="fas fa-file-invoice-dollar text-primary me-2"></i>
                รายงานบิลขาย
              </h5>
              <p className="text-muted small mb-0">ตรวจสอบประวัติและรายละเอียดการขายทั้งหมดของระบบ</p>
            </div>
            <span className="badge bg-primary rounded-pill px-3 py-2 shadow-sm">
              {billSales.length} Transactions
            </span>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-dark text-white">
                  <tr className="small text-uppercase fw-bold" style={{ letterSpacing: "1px" }}>
                    <th className="py-3 ps-4 border-0">เครื่องมือ</th>
                    <th className="py-3 border-0">หมายเลขบิล</th>
                    <th className="py-3 border-0">วันที่ทำรายการ</th>
                    <th className="py-3 border-0 text-end pe-4">ยอดเงินสุทธิ</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {billSales.length > 0 ? (
                    billSales.map((item, index) => (
                      <tr key={index} className="border-bottom">
                        {/* เครื่องมือ: เพิ่ม py-3 เพื่อให้แถวสูงขึ้น ไม่ดูอึดอัด */}
                        <td className="ps-4 py-3">
                          <button
                            data-toggle="modal"
                            data-target="#modalBillSaleDetail"
                            onClick={() => setSelectBill(item)}
                            className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm border-0"
                            style={{ 
                                fontSize: "13px", 
                                fontWeight: "500",
                                background: "linear-gradient(45deg, #0d6efd, #0a58ca)" 
                            }}
                          >
                            <i className="fas fa-file-alt me-2"></i>ดูรายละเอียด
                          </button>
                        </td>

                        {/* หมายเลขบิล: ใช้ Badge สีอ่อนให้ดูสะอาด */}
                        <td className="py-3">
                          <span className="badge bg-light text-primary border px-2 py-1 fw-bold font-monospace">
                            #{item.id}
                          </span>
                        </td>

                        {/* วันที่ทำรายการ: จัดกลุ่ม Icon กับ Text ให้มีช่องไฟ */}
                        <td className="py-3">
                          <div className="d-flex align-items-center">
                            <div className="mr-3 bg-light text-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm me-3" 
                                 style={{ width: "38px", height: "38px", minWidth: "38px" }}>
                              <i className="far fa-calendar-alt " style={{ fontSize: "14px" }}></i>
                            </div>
                            <div>
                              <div className="fw-bold text-dark mb-0" style={{ fontSize: "0.9rem" }}>
                                {dayjs(item.createdAt).format("DD MMM YYYY")}
                              </div>
                              <div className="text-muted small font-monospace" style={{ fontSize: "0.75rem" }}>
                                {dayjs(item.createdAt).format("HH:mm:ss")}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* ยอดเงินสุทธิ */}
                        <td className="text-end pe-4 py-3 fw-bold text-dark font-monospace h6 mb-0">
                          {calculateTotal(item.billSaleDetails).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                          <span className="text-muted small ms-1" style={{ fontSize: '0.8rem' }}>฿</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-5">
                        <EmptyState />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="card-footer bg-white border-0 py-3 text-center">
            <small className="text-muted">สิ้นสุดรายงาน — ข้อมูลอัปเดตล่าสุด {dayjs().format("HH:mm:ss")}</small>
          </div>
        </div>
      </div>

      {/* Modal Details: ส่วนแสดงรายละเอียดสินค้าในบิล */}
      <Modal id="modalBillSaleDetail" title="🧾 รายละเอียดสินค้าในบิล" modalSize="modal-lg">
        <div className="p-3">
          <div className="table-responsive border rounded-3 overflow-hidden shadow-sm">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted small text-uppercase fw-bold">
                <tr>
                  <th className="py-3 ps-3 border-0">รายการสินค้า</th>
                  <th className="py-3 border-0 text-end">ราคา</th>
                  <th className="py-3 border-0 text-center">จำนวน</th>
                  <th className="py-3 border-0 text-end pe-3">ยอดรวม</th>
                </tr>
              </thead>
              <tbody>
                {selectBill?.billSaleDetails?.map((item, index) => (
                  <tr key={index}>
                    <td className="ps-3 py-3 fw-bold text-dark">{item.product.name}</td>
                    <td className="text-end font-monospace text-muted">
                      {item.price.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-center">
                      <span className="badge bg-light text-dark border fw-normal px-3 py-2 font-monospace">
                        {item.qty}
                      </span>
                    </td>
                    <td className="text-end pe-3 fw-bold text-primary font-monospace">
                      {(item.qty * item.price).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              {selectBill?.billSaleDetails && (
                <tfoot className="table-light border-top border-2">
                  <tr className="fw-bold">
                    <td colSpan="3" className="text-end py-3">รวมทั้งสิ้น (Total):</td>
                    <td className="text-end pe-3 py-3 h5 mb-0 text-primary font-monospace">
                      {calculateTotal(selectBill.billSaleDetails).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </Modal>
    </Template>
  );
}

// Component สำหรับแสดงผลเมื่อไม่มีข้อมูล
const EmptyState = () => (
  <div className="py-5 text-center">
    <img
      src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png"
      alt="empty"
      style={{ width: "80px", opacity: "0.3" }}
      className="mb-3"
    />
    <h6 className="text-muted fw-light">ไม่พบข้อมูลบิลขายในระบบ</h6>
  </div>
);

export default BillSales;