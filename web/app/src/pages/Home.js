import { useEffect, useState } from "react";
import Template from "../components/Template";
import axios from "axios";
import config from "../config";
import Swal from "sweetalert2";
import * as dayjs from "dayjs";
import Modal from "../components/Modal"; // 🌟 อย่าลืม Import Modal เข้ามาด้วยนะครับ

function Home() {
  const [products, setProducts] = useState([]);
  const [bills, setBills] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 เพิ่ม State สำหรับเก็บบิลที่ถูกเลือกเพื่อดูรายละเอียด
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [resProducts, resBills, resStocks] = await Promise.all([
        axios
          .get(config.api_path + "/product/list", config.headers())
          .catch(() => ({ data: { results: [] } })),
        axios
          .get(config.api_path + "/billSale/list", config.headers())
          .catch(() => ({ data: { results: [] } })),
        axios
          .get(config.api_path + "/stock/report", config.headers())
          .catch(() => ({ data: { results: [] } })),
      ]);

      setProducts(resProducts.data.results || []);
      setBills(resBills.data.results || []);
      setStocks(resStocks.data.results || []);
    } catch (e) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูล Dashboard ได้",
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalSales = () => {
    return bills.reduce((total, bill) => {
      const billSum =
        bill.billSaleDetails?.reduce(
          (sum, item) => sum + Number(item.price) * Number(item.qty),
          0,
        ) || 0;
      return total + billSum;
    }, 0);
  };

  const calculateTotalStock = () => {
    return stocks.reduce(
      (total, item) => total + (Number(item.stockIn) - Number(item.stockOut)),
      0,
    );
  };

  const recentBills = [...bills]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <Template>
      <div className="container-fluid p-0">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold text-dark mb-1">ภาพรวมระบบ (Dashboard)</h4>
            <p className="text-muted small mb-0">
              ข้อมูลสรุปสถิติร้านค้าของคุณ อัปเดตล่าสุด:{" "}
              {dayjs().format("HH:mm น.")}
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="btn btn-light bg-white border shadow-sm rounded-pill px-3 py-2 btn-hover"
          >
            <i
              className={`fas fa-sync-alt text-primary ${isLoading ? "fa-spin" : ""} me-2`}
            ></i>
            รีเฟรชข้อมูล
          </button>
        </div>

        {/* KPI Cards Section */}
        <div className="row g-3 mb-4">
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden dashboard-card">
              <div className="card-body p-4 position-relative">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <p className="text-muted fw-bold mb-1 small text-uppercase">
                      ยอดขายรวม (บาท)
                    </p>
                    <h3 className="fw-bold text-dark mb-0 font-monospace">
                      {calculateTotalSales().toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                      })}
                    </h3>
                  </div>
                  <div
                    className="icon-box bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "48px", height: "48px" }}
                  >
                    <i className="fas fa-wallet fs-5"></i>
                  </div>
                </div>
                <div className="mt-3 text-success small fw-bold">
                  <i className="fas fa-arrow-up me-1"></i> อัปเดตจากทุกบิลขาย
                </div>
                <div
                  className="position-absolute opacity-10"
                  style={{
                    right: "-15px",
                    bottom: "-20px",
                    transform: "scale(2.5)",
                  }}
                >
                  <i className="fas fa-chart-line text-success"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden dashboard-card">
              <div className="card-body p-4 position-relative">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <p className="text-muted fw-bold mb-1 small text-uppercase">
                      จำนวนบิลขาย
                    </p>
                    <h3 className="fw-bold text-dark mb-0 font-monospace">
                      {bills.length.toLocaleString()}
                    </h3>
                  </div>
                  <div
                    className="icon-box bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "48px", height: "48px" }}
                  >
                    <i className="fas fa-receipt fs-5"></i>
                  </div>
                </div>
                <div className="mt-3 text-primary small fw-bold">
                  <i className="fas fa-check-circle me-1"></i> รายการขายสำเร็จ
                </div>
                <div
                  className="position-absolute opacity-10"
                  style={{
                    right: "-10px",
                    bottom: "-15px",
                    transform: "scale(2.5)",
                  }}
                >
                  <i className="fas fa-file-invoice text-primary"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden dashboard-card">
              <div className="card-body p-4 position-relative">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <p className="text-muted fw-bold mb-1 small text-uppercase">
                      เมนู/สินค้าในระบบ
                    </p>
                    <h3 className="fw-bold text-dark mb-0 font-monospace">
                      {products.length.toLocaleString()}
                    </h3>
                  </div>
                  <div
                    className="icon-box bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "48px", height: "48px" }}
                  >
                    <i className="fas fa-utensils fs-5"></i>
                  </div>
                </div>
                <div className="mt-3 text-warning small fw-bold">
                  <i className="fas fa-box-open me-1"></i> พร้อมขายหน้าร้าน
                </div>
                <div
                  className="position-absolute opacity-10"
                  style={{
                    right: "-10px",
                    bottom: "-15px",
                    transform: "scale(2.5)",
                  }}
                >
                  <i className="fas fa-hamburger text-warning"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden dashboard-card">
              <div className="card-body p-4 position-relative">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <p className="text-muted fw-bold mb-1 small text-uppercase">
                      สต็อกคงเหลือรวม
                    </p>
                    <h3 className="fw-bold text-dark mb-0 font-monospace">
                      {calculateTotalStock().toLocaleString()}
                    </h3>
                  </div>
                  <div
                    className="icon-box bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "48px", height: "48px" }}
                  >
                    <i className="fas fa-cubes fs-5"></i>
                  </div>
                </div>
                <div className="mt-3 text-danger small fw-bold">
                  <i className="fas fa-layer-group me-1"></i> ชิ้น/หน่วยในคลัง
                </div>
                <div
                  className="position-absolute opacity-10"
                  style={{
                    right: "-10px",
                    bottom: "-15px",
                    transform: "scale(2.5)",
                  }}
                >
                  <i className="fas fa-boxes text-danger"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions Section */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white border-0 py-4 px-4 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold text-dark">
                  <i className="fas fa-history text-secondary me-2"></i>
                  รายการขายล่าสุด (5 รายการ)
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-muted small text-uppercase fw-bold">
                      <tr>
                        <th className="py-3 ps-4 border-0">เลขบิล</th>
                        <th className="py-3 border-0">วันที่ / เวลา</th>
                        <th className="py-3 border-0 text-center">
                          จำนวนรายการ
                        </th>
                        <th className="py-3 border-0 text-end">ยอดขายสุทธิ</th>
                        <th className="py-3 border-0 text-center pe-4">
                          จัดการ
                        </th>{" "}
                        {/* 🌟 เพิ่มคอลัมน์ จัดการ */}
                      </tr>
                    </thead>
                    <tbody>
                      {recentBills.length > 0 ? (
                        recentBills.map((bill, index) => {
                          const billTotal =
                            bill.billSaleDetails?.reduce(
                              (sum, item) =>
                                sum + Number(item.price) * Number(item.qty),
                              0,
                            ) || 0;

                          return (
                            <tr key={index}>
                              <td className="ps-4 py-3">
                                <span className="badge bg-light text-dark border px-2 py-1 fw-bold font-monospace">
                                  #{bill.id}
                                </span>
                              </td>
                              <td>
                                <div className="fw-bold text-dark">
                                  {dayjs(bill.createdAt).format("DD/MM/YYYY")}
                                </div>
                                <div className="small text-muted font-monospace">
                                  {dayjs(bill.createdAt).format("HH:mm:ss")} น.
                                </div>
                              </td>
                              <td className="text-center">
                                <span className="badge bg-secondary-subtle text-secondary px-2 py-1 rounded-pill">
                                  {bill.billSaleDetails?.length || 0} รายการ
                                </span>
                              </td>
                              <td className="text-end fw-bold text-success font-monospace">
                                +{" "}
                                {billTotal.toLocaleString("th-TH", {
                                  minimumFractionDigits: 2,
                                })}{" "}
                                ฿
                              </td>
                              <td className="text-center pe-4">
                                {/* 🌟 ปุ่มกดดูรายละเอียด */}
                                <button
                                  className="btn btn-sm btn-outline-primary rounded-pill px-3 shadow-none"
                                  data-toggle="modal"
                                  data-target="#modalRecentBillDetail"
                                  onClick={() => setSelectedBill(bill)}
                                >
                                  <i className="fas fa-search me-1"></i>{" "}
                                  ดูรายละเอียด
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="text-center py-5 text-muted"
                          >
                            {isLoading ? (
                              <div>
                                <i className="fas fa-spinner fa-spin fa-2x mb-2 text-primary"></i>
                                <br />
                                กำลังโหลดข้อมูล...
                              </div>
                            ) : (
                              <div>
                                <i className="fas fa-file-invoice fa-3x mb-3 opacity-25"></i>
                                <br />
                                ยังไม่มีประวัติการขาย
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .dashboard-card { transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; }
          .dashboard-card:hover { transform: translateY(-5px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; }
          .btn-hover { transition: all 0.2s ease; }
          .btn-hover:hover { background-color: #f8f9fa !important; transform: translateY(-1px); }
        `}</style>
      </div>

      {/* 🌟 Modal สำหรับแสดงรายละเอียดบิลที่เลือก 🌟 */}
      <Modal
        id="modalRecentBillDetail"
        title={`🧾 รายละเอียดบิล #${selectedBill?.id || ""}`}
        modalSize="modal-lg"
      >
        <div className="p-3">
          <div className="d-flex justify-content-between mb-3 text-muted small">
            <span>
              วันที่ทำรายการ:{" "}
              <span className="fw-bold text-dark">
                {selectedBill
                  ? dayjs(selectedBill.createdAt).format("DD/MM/YYYY HH:mm น.")
                  : "-"}
              </span>
            </span>
            <span>
              สถานะ: <span className="badge bg-success">ชำระเงินแล้ว</span>
            </span>
          </div>

          <div className="table-responsive border rounded-3 overflow-hidden shadow-sm">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted small text-uppercase fw-bold">
                <tr>
                  <th className="py-3 ps-3 border-0">รายการสินค้า</th>
                  <th className="py-3 border-0 text-end">ราคา/หน่วย</th>
                  <th className="py-3 border-0 text-center">จำนวน</th>
                  <th className="py-3 border-0 text-end pe-3">ยอดรวม</th>
                </tr>
              </thead>
              <tbody>
                {selectedBill?.billSaleDetails?.map((item, index) => (
                  <tr key={index}>
                    <td className="ps-3 py-3 fw-bold text-dark">
                      {item.product?.name || "ไม่ระบุชื่อ"}
                    </td>
                    <td className="text-end font-monospace text-muted">
                      {Number(item.price).toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-center">
                      <span className="badge bg-light text-dark border fw-normal px-3 py-2 font-monospace">
                        {item.qty}
                      </span>
                    </td>
                    <td className="text-end pe-3 fw-bold text-primary font-monospace">
                      {(Number(item.qty) * Number(item.price)).toLocaleString(
                        "th-TH",
                        { minimumFractionDigits: 2 },
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              {selectedBill?.billSaleDetails && (
                <tfoot className="table-light border-top border-2">
                  <tr className="fw-bold">
                    <td colSpan="3" className="text-end py-3">
                      รวมทั้งสิ้นสุทธิ:
                    </td>
                    <td className="text-end pe-3 py-3 h5 mb-0 text-success font-monospace fw-bold">
                      {selectedBill.billSaleDetails
                        .reduce(
                          (sum, item) =>
                            sum + Number(item.price) * Number(item.qty),
                          0,
                        )
                        .toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                        })}{" "}
                      ฿
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

export default Home;
