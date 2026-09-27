import Template from "./Template";
import { PageHeader, FilterBar, FilterBarButton } from "../components/PageHeader";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import config from "../config";
import Swal from "../utils/swal";
import { getErrorMessage } from "../utils/error";
import Modal from "../components/Modal";

function ReportSumSalePerDay() {
  const [years] = useState(() => {
    let arr = [];
    let d = new Date();
    let currentYear = d.getFullYear();
    let lastYear = currentYear - 5;

    for (let i = lastYear; i <= currentYear; i++) {
      arr.push(i);
    }

    return arr;
  });

  const [selectedYear, setSelectedYear] = useState(() => {
    return new Date().getFullYear();
  });
  const [months] = useState(() => {
    return [
      { number: 1, value: "มกราคม" },
      { number: 2, value: "กุมภาพันธ์" },
      { number: 3, value: "มีนาคม" },
      { number: 4, value: "เมษายน" },
      { number: 5, value: "พฤษภาคม" },
      { number: 6, value: "มิถุนายน" },
      { number: 7, value: "กรกฎาคม" },
      { number: 8, value: "สิงหาคม" },
      { number: 9, value: "กันยายน" },
      { number: 10, value: "ตุลาคม" },
      { number: 11, value: "พฤศจิกายน" },
      { number: 12, value: "ธันวาคม" },
    ];
  });

  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().getMonth() + 1;
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  // เลขรอบการโหลด: ถ้าเปลี่ยนปี/เดือนเร็ว ๆ ให้ใช้ผลของคำขอล่าสุดเท่านั้น
  const requestId = useRef(0);

  const handleShopReport = async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const payload = {
        month: selectedMonth,
        year: selectedYear,
      };

      await axios
        .post(
          config.api_path + "/changePackage/reportSumSalePerDay",
          payload,
          config.headers(),
        )
        .then((res) => {
          if (id === requestId.current && res.data.message === "success") {
            setResults(res.data.results);
          }
        })
        .catch((err) => {
          throw err;
        });
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: getErrorMessage(e),
      });
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  };

  // แสดงรายงานอัตโนมัติเมื่อเปิดหน้า และทุกครั้งที่เปลี่ยนปีหรือเดือน
  useEffect(() => {
    handleShopReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth]);

  const [selectedDay, setSelectedDay] = useState({});

  return (
    <>
      <Template>
        <div className="p-4 bg-light min-vh-100">
          <PageHeader
            eyebrow="รายงาน / ยอดขายรายวัน"
            title="ยอดขายรายวัน"
            description="เลือกปีและเดือน แล้วดูยอดรายได้ค่าบริการของแต่ละวัน"
            count={loading ? "…" : `${results.length.toLocaleString("th-TH")} วัน`}
            actions={
              <FilterBarButton icon={loading ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-rotate-right"} onClick={handleShopReport} disabled={loading}>
                รีเฟรช
              </FilterBarButton>
            }
          />
          <FilterBar>
            <select aria-label="ปี" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="form-select w-auto">
              {years.map((item) => (
                <option key={item} value={item}>
                  ปี {item}
                </option>
              ))}
            </select>
            <select aria-label="เดือน" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="form-select w-auto">
              {months.map((item) => (
                <option key={item.number} value={item.number}>
                  {item.value}
                </option>
              ))}
            </select>
          </FilterBar>
          <div className="card border-0 rounded-4 shadow-custom overflow-hidden">
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
                        วันที่
                      </th>
                      <th
                        className="pe-4 py-3 text-end text-secondary fw-bold text-uppercase"
                        style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                      >
                        ยอดรวม (บาท)
                      </th>
                      <th width="200px"></th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0 bg-white">
                    {results.length > 0 ? (
                      results.map((item, index) => (
                        <tr key={index}>
                          {/* วันที่ */}
                          <td className="ps-4 py-3">
                            <div className="d-flex align-items-center">
                              <div
                                className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm border"
                                style={{ width: "40px", height: "40px" }}
                              >
                                <i className="fa-regular fa-calendar-check text-secondary"></i>
                              </div>
                              <span className="fw-bold text-dark fs-6">
                                วันที่ {item.day}
                              </span>
                            </div>
                          </td>

                          {/* ยอดเงิน */}
                          <td className="text-end pe-4 py-3">
                            <span className="h5 fw-bold text-success font-monospace mb-0">
                              {Number(item.sum).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                            <span className="text-muted fw-bold ms-1">฿</span>
                          </td>
                          <td className="text-end pe-4 py-3">
                            <button
                              onClick={(e) => setSelectedDay(item)}
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
                      /* หน้าจอตอนยังไม่มีข้อมูล */
                      <tr>
                        <td colSpan="2" className="text-center py-5">
                          <div className="py-4">
                            <div
                              className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm"
                              style={{ width: "80px", height: "80px" }}
                            >
                              <i className="fa-solid fa-file-invoice-dollar fs-1 text-primary opacity-50"></i>
                            </div>
                            <h5 className="text-dark fw-bold mb-1">
                              ยังไม่มีข้อมูลแสดงผล
                            </h5>
                            <p className="text-muted small mb-0">
                              กรุณาเลือกปีและเดือน แล้วกดปุ่ม "แสดงรายการ"
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
            {selectedDay?.day ? `วันที่ ${selectedDay.day}` : ""}
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
                {selectedDay?.results?.length > 0 ? (
                  selectedDay.results.map((item, index) => (
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
                        ไม่มีรายการสมัครในวันนี้
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

export default ReportSumSalePerDay;
