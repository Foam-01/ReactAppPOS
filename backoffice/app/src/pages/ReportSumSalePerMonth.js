import Swal from "../utils/swal";
import Template from "./Template";
import { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";
import Modal from "../components/Modal";
import * as dayjs from "dayjs";


function ReportSumsalePerMonth() {
  const [years, setYears] = useState(() => {
    let arr = [];
    let d = new Date();
    let currentYear = d.getFullYear();
    let lastYear = currentYear - 5;

    for (let i = lastYear; i <= currentYear; i++) {
      arr.push(i);
    }

    return arr;
  });

  const [selecteYear, setSelecteYear] = useState(() => {
    return new Date().getFullYear();
  });

  const [results, setResults] = useState([]);
  const [arrMonth, setArrMonth] = useState(() => {
    return [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const payload = {
        year: selecteYear,
      };

      await axios
        .post(
          config.api_path + "/changePackage/reportSumSalePerMonth",
          payload,
          config.headers(),
        )
        .then((res) => {
          if (res.data.message === "success") {
            setResults(res.data.results);
          }
        })
        .catch((err) => {
          throw err.response.data;
        });
    } catch (e) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: e.message,
        icon: "error",
      });
    }
  };

  const [selectedMonth, setSelectedMonth] = useState({});

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
                <i className="fa-solid fa-calendar-days fs-5"></i>
              </div>
              <div>
                <h5
                  className="mb-1 fw-bold text-dark"
                  style={{ letterSpacing: "0.5px" }}
                >
                  รายได้รายเดือน
                </h5>
                <small className="text-muted fw-medium">
                  ตรวจสอบและเปรียบเทียบยอดขายรวมในแต่ละเดือนของปี
                </small>
              </div>
            </div>

            {/* โซนค้นหา (Filter) */}
            <div
              className="card-body bg-white border-top border-bottom py-3"
              style={{ borderColor: "var(--color-row-hover)" }}
            >
              <div className="row g-3 align-items-center">
                <div className="col-auto">
                  <div className="input-group shadow-sm rounded">
                    <span className="input-group-text bg-light border-end-0 text-muted fw-bold">
                      ปี
                    </span>
                    <select
                      value={selecteYear}
                      onChange={(e) =>
                        setSelecteYear(e.target.value)
                      } /* 🌟 เพิ่ม onChange ตรงนี้ให้แล้วครับ */
                      className="form-select border-start-0 cursor-pointer fw-medium text-dark"
                    >
                      {years.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-auto">
                  <button
                    onClick={fetchData}
                    className="btn btn-primary px-4 fw-bold shadow-sm btn-search rounded-pill"
                  >
                    <i className="fa-solid fa-magnifying-glass me-2"></i>
                    แสดงรายการ
                  </button>
                </div>
              </div>
            </div>

            {/* Card Body: ตาราง */}
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table align-middle mb-0 custom-table">
                  <thead className="bg-light">
                    <tr>
                      <th
                        className="ps-4 py-3 text-secondary fw-bold text-uppercase"
                        style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                      >
                        เดือน
                      </th>
                      <th
                        className="pe-4 py-3 text-end text-secondary fw-bold text-uppercase"
                        style={{
                          fontSize: "0.85rem",
                          letterSpacing: "1px",
                          width: "250px",
                        }}
                      >
                        ยอดขาย (บาท)
                      </th>
                      <th width="180px"></th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0 bg-white">
                    {results.length > 0 ? (
                      results.map((item, index) => (
                        <tr key={index}>
                          <td className="ps-4 py-3">
                            <div className="d-flex align-items-center">
                              <div
                                className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm border"
                                style={{ width: "40px", height: "40px" }}
                              >
                                <i className="fa-regular fa-calendar text-secondary"></i>
                              </div>
                              <span className="fw-bold text-dark fs-6">
                                 {arrMonth[parseInt(item.month) - 1]}
                              </span>
                            </div>
                          </td>
                          <td className="pe-4 py-3 text-end">
                            <span className="h5 fw-bold text-success font-monospace mb-0">
                              {Number(item.sum).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                            <span className="text-muted fw-bold ms-1">฿</span>
                          </td>
                          <td className="text-end pe-4 py-3">
                            <button
                              onClick={(e) => setSelectedMonth(item)}
                              data-bs-toggle="modal"
                              data-bs-target="#modalInfo"
                              className="btn btn-outline-primary btn-sm px-3 rounded-pill fw-bold btn-detail"
                            >
                              <i className="fa-solid fa-list-ul me-2"></i>
                              ดูรายละเอียด
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
                              <i className="fa-solid fa-chart-pie fs-1 text-primary opacity-50"></i>
                            </div>
                            <h5 className="text-dark fw-bold mb-1">
                              ยังไม่มีข้อมูลแสดงผล
                            </h5>
                            <p className="text-muted small mb-0">
                              กรุณาเลือกปี แล้วกดปุ่ม "แสดงรายการ"
                            </p>
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

      </Template>

      <Modal
        id="modalInfo"
        title={
          <span>
            <i className="fa-solid fa-receipt text-primary me-2"></i>
            รายละเอียดการขาย{" "}
            {selectedMonth?.day ? `วันที่ ${selectedMonth.day}` : ""}
          </span>
        }
        modalSize="modal-xl" /* ขยายขนาดเป็น xl เพราะคอลัมน์ค่อนข้างเยอะ จะได้ไม่อึดอัด */
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
                {selectedMonth?.results?.length > 0 ? (
                  selectedMonth.results.map((item, index) => (
                    <tr key={index}>
                      {" "}
                      {/* 🌟 ใส่ key กัน React บ่น */}
                      {/* วันที่สมัคร */}
                      <td className="ps-4 py-3">
                        <div className="text-dark fw-medium">
                          <i className="fa-regular fa-calendar-plus text-muted me-2"></i>
                          {/* สมมติว่าใช้ dayjs หรือถ้าไม่มีใช้ toLocaleDateString() แทนได้ครับ */}
                          {new Date(item.createdAt).toLocaleDateString("th-TH")}
                        </div>
                      </td>
                      {/* วันที่และเวลาชำระเงิน */}
                      <td className="py-3">
                        <div className="text-dark fw-medium">
                          {item.payDate
                            ? new Date(item.payDate).toLocaleDateString("th-TH")
                            : "-"}
                        </div>
                        <div className="text-muted small font-monospace mt-1">
                          <i className="fa-regular fa-clock me-1"></i>
                          {/* 🌟 ดักการแสดงผลเวลา และแก้คำผิดจาก paypayHour เป็น payHour */}
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
                      {/* ชื่อผู้สมัคร */}
                      <td className="py-3">
                        <div className="d-flex align-items-center">
                          <div
                            className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2 border"
                            style={{ width: "32px", height: "32px" }}
                          >
                            <i className="fa-solid fa-user text-secondary small"></i>
                          </div>
                          <span className="fw-bold text-dark">
                            {item.member?.name || "ไม่พบชื่อ"}
                          </span>
                        </div>
                      </td>
                      {/* ชื่อแพ็กเกจ */}
                      <td className="py-3">
                        {item.package?.name ? (
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill">
                            {item.package.name}
                          </span>
                        ) : (
                          <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill fw-normal">
                            ไม่ระบุ
                          </span>
                        )}
                      </td>
                      {/* ราคา */}
                      <td className="pe-4 py-3 text-end">
                        <span className="fw-bold text-success font-monospace fs-6">
                          {Number(item.package?.price || 0).toLocaleString()}
                        </span>
                        <span className="text-muted ms-1">฿</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* หน้าจอตอนไม่มีข้อมูลในวันนั้น */
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="text-muted opacity-50">
                        <i className="fa-solid fa-folder-open fa-2x mb-2 d-block"></i>
                        ไม่มีรายการสมัครในเดือนนี้
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

export default ReportSumsalePerMonth;
