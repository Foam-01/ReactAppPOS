import Template from "./Template";
import axios from "axios";
import config from "../config";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import * as dayjs from "dayjs";

function ReportSumSalePerYear() {
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  
const fetchData = async () => {
  try {
    await axios
      .get(
        config.api_path + "/changePackage/reportSumsalePreYear",
        config.headers(),
      )
      .then((res) => {
        if (res.data.message === "success") {
          setResults(res.data.results);
        }
      })
      .catch((err) => {
        // 🌟 ใส่ ?. ดักไว้กันจอขาวกรณีเชื่อม API ไม่ได้
        throw err.response?.data || err;
      });
  } catch (e) {
    Swal.fire({
      title: "เกิดข้อผิดพลาด",
      text: e.message || "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
      icon: "error",
    });
  }
}; 

  return (
    <>
      <Template>
        <div className="p-4 bg-light min-vh-100">
          <div className="card border-0 rounded-4 shadow-custom overflow-hidden">
            {/* Card Header แบบพรีเมียม */}
            <div className="card-header bg-white py-4 border-0 d-flex align-items-center">
              <div
                className="bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center rounded-circle me-3"
                style={{ width: "50px", height: "50px" }}
              >
                <i className="fa-solid fa-calendar-check fs-5"></i>
              </div>
              <div>
                <h5
                  className="mb-1 fw-bold text-dark"
                  style={{ letterSpacing: "0.5px" }}
                >
                  รายงานรายได้รายปี
                </h5>
                <small className="text-muted fw-medium">
                  สรุปภาพรวมรายได้ทั้งหมดที่เกิดขึ้นในแต่ละปี
                </small>
              </div>
            </div>

            {/* Card Body: ตารางหลัก */}
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table align-middle mb-0 custom-table">
                  <thead className="bg-light">
                    <tr>
                      <th
                        className="ps-4 py-3 text-secondary fw-bold text-uppercase"
                        style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                      >
                        ปีปฏิทิน
                      </th>
                      <th
                        className="pe-4 py-3 text-end text-secondary fw-bold text-uppercase"
                        style={{
                          fontSize: "0.85rem",
                          letterSpacing: "1px",
                          width: "250px",
                        }}
                      >
                        รายได้รวม (บาท)
                      </th>
                      <th width="180px"></th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0 bg-white">
                    {results.length > 0 ? (
                      results.map((item, index) => (
                        <tr key={index}>
                          {" "}
                          {/* 🌟 เพิ่ม key กันบั๊ก */}
                          <td className="ps-4 py-3">
                            <div className="d-flex align-items-center">
                              <div
                                className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm border"
                                style={{ width: "40px", height: "40px" }}
                              >
                                <i className="fa-regular fa-calendar text-secondary"></i>
                              </div>
                              <span className="fw-bold text-dark fs-5 font-monospace">
                                {item.year}
                              </span>
                            </div>
                          </td>
                          <td className="pe-4 py-3 text-end">
                            <span className="h5 fw-bold text-success font-monospace mb-0">
                              {parseInt(item.sum).toLocaleString("th-TH")}
                            </span>
                            <span className="text-muted fw-bold ms-1">฿</span>
                          </td>
                          <td className="text-end pe-4 py-3">
                            <button
                              data-bs-toggle="modal"
                              data-bs-target="#modalInfo"
                              onClick={(e) => setSelectedResult(item)}
                              className="btn btn-info btn-sm px-3 rounded-pill text-white fw-bold shadow-sm btn-detail"
                            >
                              <i className="fa-solid fa-list-ul me-2"></i>
                              ดูรายการ
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-5">
                          <div className="py-4">
                            <div
                              className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm"
                              style={{ width: "80px", height: "80px" }}
                            >
                              <i className="fa-solid fa-folder-open fs-1 text-primary opacity-50"></i>
                            </div>
                            <h5 className="text-dark fw-bold mb-1">
                              ไม่มีข้อมูลรายได้
                            </h5>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          /* เงาของการ์ด */
          .shadow-custom {
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04) !important;
          }

          /* ตกแต่งตาราง */
          .custom-table td {
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
          }

          /* Hover Effect ของแถวตาราง */
          .custom-table tbody tr {
            transition: all 0.25s ease;
          }
          .custom-table tbody tr:hover {
            background-color: #fcfdfe;
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.02);
            position: relative;
            z-index: 1;
          }

          /* ปุ่มดูรายละเอียด */
          .btn-detail {
            transition: all 0.2s ease;
          }
          .btn-detail:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(13, 202, 240, 0.4) !important;
          }
        `}</style>
      </Template>

      {/* 🌟 Modal แสดงรายละเอียด */}
      <Modal
        id="modalInfo"
        title={
          <span>
            <i className="fa-solid fa-receipt text-primary me-2"></i>
            รายละเอียดรายได้ประจำปี {selectedResult?.year || ""}
          </span>
        }
        modalSize="modal-xl"
      >
        <div className="p-2">
          <div className="table-responsive">
            <table className="table align-middle mb-0 custom-table">
              <thead className="bg-light">
                <tr>
                  <th
                    className="ps-4 py-3 text-secondary text-uppercase"
                    style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                  >
                    วันที่สมัคร
                  </th>
                  <th
                    className="py-3 text-secondary text-uppercase"
                    style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                  >
                    วันที่ชำระเงิน
                  </th>
                  <th
                    className="py-3 text-secondary text-uppercase"
                    style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                  >
                    ผู้สมัคร
                  </th>
                  <th
                    className="py-3 text-secondary text-uppercase"
                    style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                  >
                    แพ็กเกจ
                  </th>
                  <th
                    className="pe-4 py-3 text-end text-secondary text-uppercase"
                    style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                  >
                    ค่าบริการ
                  </th>
                </tr>
              </thead>
              <tbody className="border-top-0 bg-white">
                {/* 🌟 ปรับเงื่อนไขเช็ค array ให้คลีนขึ้น */}
                {selectedResult?.results?.length > 0 ? (
                  selectedResult.results.map((item, index) => (
                    <tr key={index}>
                      <td className="ps-4 py-3 text-dark fw-medium">
                        <i className="fa-regular fa-calendar-plus text-muted me-2"></i>
                        {dayjs(item.createdAt).format("DD/MM/YYYY")}
                        <span className="text-muted small ms-1">
                          {dayjs(item.createdAt).format("HH:mm")} น.
                        </span>
                      </td>
                      <td className="py-3 text-dark fw-medium">
                        {item.payDate
                          ? dayjs(item.payDate).format("DD/MM/YYYY")
                          : "-"}
                        <div className="text-muted small font-monospace mt-1">
                          <i className="fa-regular fa-clock me-1"></i>
                          {/* 🌟 เติม 0 ให้เวลา และต่อด้วย น. */}
                          {item.payHour
                            ? String(item.payHour).padStart(2, "0")
                            : "00"}
                          :
                          {item.payMinute
                            ? String(item.payMinute).padStart(2, "0")
                            : "00"}{" "}
                          น.
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="d-flex align-items-center">
                          <div
                            className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2 border"
                            style={{ width: "32px", height: "32px" }}
                          >
                            <i className="fa-solid fa-user text-secondary small"></i>
                          </div>
                          <span className="fw-bold text-dark">
                            {item.member?.name || "ไม่ระบุ"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        {item.package?.name ? (
                          <span className="badge bg-info-subtle text-info px-3 py-2 rounded-pill shadow-sm border border-info-subtle">
                            {item.package.name}
                          </span>
                        ) : (
                          <span className="badge bg-light text-secondary px-3 py-2 rounded-pill border">
                            ไม่ระบุ
                          </span>
                        )}
                      </td>
                      <td className="pe-4 py-3 text-end">
                        <span className="fw-bold text-success font-monospace fs-6">
                          {parseInt(item.package?.price || 0).toLocaleString(
                            "th-TH",
                          )}
                        </span>
                        <span className="text-muted ms-1">฿</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="text-muted opacity-50">
                        <i className="fa-solid fa-folder-open fa-2x mb-2 d-block"></i>
                        ไม่มีรายการชำระเงิน
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ReportSumSalePerYear;


