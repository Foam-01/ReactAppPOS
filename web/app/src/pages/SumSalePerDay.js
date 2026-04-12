import Template from "../components/Template";
import Swal from "sweetalert2";
import axios from "axios";
import config from "../config";
import Modal from "../components/Modal";
import { useEffect, useState } from "react";
import * as dayjs from "dayjs";

function SumSalePerDay() {
  const [currentYear, setCurrentYear] = useState(() => {
    let myDate = new Date();
    return myDate.getFullYear();
  });
  const [arrYear, setArrYear] = useState(() => {
    let arr = [];
    let myDate = new Date();
    let currentYear = myDate.getFullYear();
    let beforeYear = currentYear - 5;

    for (let i = beforeYear; i <= currentYear; i++) {
      arr.push(i);
    }

    return arr;
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    let myDate = new Date();
    return myDate.getMonth() + 1;
  });
  const [arrMonth, setArrMonth] = useState(() => {
    let arr = [
      { value: 1, label: "มกราคม" },
      { value: 2, label: "กุมภาพันธ์" },
      { value: 3, label: "มีนาคม" },
      { value: 4, label: "เมษายน" },
      { value: 5, label: "พฤษภาคม" },
      { value: 6, label: "มิถุนายน" },
      { value: 7, label: "กรกฎาคม" },
      { value: 8, label: "สิงหาคม" },
      { value: 9, label: "กันยายน" },
      { value: 10, label: "ตุลาคม" },
      { value: 11, label: "พฤศจิกายน" },
      { value: 12, label: "ธันวาคม" },
    ];
    return arr;
  });

  const [billSales, setBillSales] = useState([]);
  const [currentBillSale, setCurrentBillSale] = useState({});
  const [billSaleDetails, setBillSaleDetails] = useState([]);

  useEffect(() => {
    handleShowReport();
  }, []);

  const handleShowReport = async () => {
    try {
      const path =
        config.api_path +
        "/billSale/listByYearAndMonth/" +
        currentYear +
        "/" +
        currentMonth;
      await axios
        .get(path, config.headers())
        .then((res) => {
          if (res.data.message === "success") {
            setBillSales(res.data.results);
          }
        })
        .catch((err) => {
          throw err.response.data;
        });
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  return (
    <>
      <Template>
        {/* ปรับ Card ให้มีความมนและมีเงาจางๆ ดูทันสมัย */}
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-header bg-white py-3 border-0">
            <div className="card-title h5 mb-0 fw-bold text-primary">
              <i className="fas fa-chart-line me-2"></i>
              รายงานสรุปยอดขายรายวัน
            </div>
          </div>

          <div className="card-body">
            {/* ส่วนตัวเลือก ปี และ เดือน ปรับให้ดูเป็นระเบียบ */}
            <div className="row g-3 mb-4 align-items-end">
              <div className="col-md-3">
                <label className="form-label small fw-bold text-muted">
                  เลือกปี
                </label>
                <div className="input-group shadow-sm rounded">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="fa fa-calendar text-primary"></i>
                  </span>
                  <select
                    onChange={(e) => setCurrentYear(e.target.value)}
                    value={currentYear}
                    className="form-select border-start-0 ps-0"
                  >
                    {arrYear.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-bold text-muted">
                  เลือกเดือน
                </label>
                <div className="input-group shadow-sm rounded">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="fa fa-calendar-check text-primary"></i>
                  </span>
                  <select
                    onChange={(e) => setCurrentMonth(e.target.value)}
                    value={currentMonth}
                    className="form-select border-start-0 ps-0"
                  >
                    {arrMonth.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <button
                  onClick={handleShowReport}
                  className="btn btn-primary px-4 py-2 shadow-sm fw-bold rounded-3 w-100 w-md-auto"
                >
                  <i className="fa fa-search me-2"></i>
                  แสดงรายงานยอดขาย
                </button>
              </div>
            </div>

            {/* ตารางแสดงข้อมูล ปรับให้ดู Clean และอ่านง่ายขึ้น */}
            <div className="table-responsive rounded-3 border">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="text-muted small text-uppercase">
                    <th width="180px" className="py-3 text-center">
                      เครื่องมือ
                    </th>
                    <th width="150px" className="text-end py-3">
                      วันที่
                    </th>
                    <th className="text-end py-3 pe-4">ยอดขาย (บาท)</th>
                  </tr>
                </thead>
                <tbody>
                  {billSales.length > 0 ? (
                    billSales.map((item, index) => (
                      <tr key={index}>
                        <td className="text-center">
                          <button
                            data-toggle="modal"
                            data-target="#modalBillSale"
                            onClick={(e) => setCurrentBillSale(item.results)}
                            className="btn btn-outline-primary btn-sm rounded-pill px-3 shadow-sm"
                          >
                            <i className="fa fa-file-alt me-2"></i>
                            รายละเอียด
                          </button>
                        </td>
                        <td className="text-end fw-bold text-dark">
                          {item.day}
                        </td>
                        <td className="text-end pe-4 fw-bold text-primary h6 mb-0">
                          {item.sum.toLocaleString("th-TH", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-5 text-muted">
                        <i className="fa fa-info-circle fa-2x mb-2 d-block opacity-25"></i>
                        ไม่พบข้อมูลยอดขายในช่วงเวลาที่เลือก
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Template>

      <Modal
        id="modalBillSale"
        title="📑 ประวัติการขายรายวัน"
        modalSize="modal-lg"
      >
        <div className="table-responsive rounded-3 border shadow-sm bg-white overflow-hidden">
          <table className="table table-hover align-middle mb-0">
            {/* ปรับส่วนหัวให้ดู Clean และแบ่งคอลัมน์ให้ถูกต้อง */}
            <thead className="table-light text-muted small text-uppercase fw-bold">
              <tr>
                <th width="180px" className="text-center py-3">
                  เครื่องมือ
                </th>
                <th className="text-end py-3">เลขบิล</th>
                <th className="py-3 ps-4">วันที่ / เวลาที่ขาย</th>
              </tr>
            </thead>

            <tbody>
              {currentBillSale.length > 0 ? (
                currentBillSale.map((item, index) => (
                  <tr key={index}>
                    <td className="text-center">
                      {/* ปรับปุ่มให้มนและใช้เงาเบาๆ ดูน่ากดขึ้น */}
                      <button
                        data-toggle="modal"
                        data-target="#modalBillSaleDetail"
                        onClick={(e) =>
                          setBillSaleDetails(item.billSaleDetails)
                        }
                        className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm"
                      >
                        <i className="fa fa-file-alt me-2 small"></i>
                        รายละเอียด
                      </button>
                    </td>
                    <td className="text-end fw-bold text-dark">#{item.id}</td>
                    <td className="ps-4">
                      <div className="fw-bold text-dark">
                        {dayjs(item.createdAt).format("DD/MM/YYYY")}
                      </div>
                      <div className="small text-muted opacity-75">
                        <i className="far fa-clock me-1"></i>
                        {dayjs(item.createdAt).format("HH:mm")} น.
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-5 text-muted">
                    <i className="fa fa-receipt fa-3x mb-3 d-block opacity-25"></i>
                    ไม่พบข้อมูลบิลขาย
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>

      <Modal
        id="modalBillSaleDetail"
        title="🧾 รายละเอียดสินค้าในบิล"
        modalSize="modal-lg"
      >
        <div className="table-responsive rounded-3 border shadow-sm overflow-hidden">
          <table className="table table-hover align-middle mb-0">
            {/* ส่วนหัวตารางปรับให้ดู Clean */}
            <thead className="table-light text-muted small text-uppercase fw-bold">
              <tr>
                <th className="py-3 ps-3 border-0">รายการ</th>
                <th className="text-end py-3 border-0">ราคา</th>
                <th className="text-end py-3 border-0">จำนวน</th>
                <th className="text-end py-3 pe-3 border-0">ยอดรวม</th>
              </tr>
            </thead>
            <tbody>
              {billSaleDetails.length > 0 ? (
                billSaleDetails.map((item, index) => (
                  <tr key={index}>
                    <td className="ps-3 fw-bold text-dark">
                      {item.product.name}
                    </td>
                    <td className="text-end font-monospace text-muted">
                      {parseInt(item.price).toLocaleString("th-TH")}
                    </td>
                    <td className="text-end font-monospace">
                      <span className="badge bg-light text-dark border fw-normal px-2">
                        {item.qty}
                      </span>
                    </td>
                    <td className="text-end pe-3 fw-bold text-primary font-monospace">
                      {(item.price * item.qty).toLocaleString("th-TH")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted small">
                    ไม่พบรายการสินค้า
                  </td>
                </tr>
              )}
            </tbody>
            {/* เพิ่มส่วนสรุปยอดรวมท้ายตารางเพื่อให้ดูสมบูรณ์ขึ้น */}
            {billSaleDetails.length > 0 && (
              <tfoot className="table-light border-top border-2">
                <tr>
                  <td colSpan="3" className="text-end fw-bold py-3">
                    รวมทั้งสิ้น:
                  </td>
                  <td className="text-end pe-3 py-3 fw-bold text-primary h5 mb-0">
                    {billSaleDetails
                      .reduce((sum, item) => sum + item.price * item.qty, 0)
                      .toLocaleString("th-TH")}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Modal>

      
    </>
  );
}

export default SumSalePerDay;
