import Template from "./Template";
import { SearchBox } from "../components/ListToolbar";
import { PageHeader, FilterBar, FilterBarClear } from "../components/PageHeader";
import axios from "axios";
import config from "../config";
import Swal from "../utils/swal";
import { getErrorMessage } from "../utils/error";
import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import * as dayjs from "dayjs";

function ReportSumSalePerYear() {
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");
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
          // เรียงปีล่าสุดไว้บนสุด
          setResults(
            [...res.data.results].sort((a, b) => Number(b.year) - Number(a.year)),
          );
        }
      })
      .catch((err) => {
        // 🌟 ใส่ ?. ดักไว้กันจอขาวกรณีเชื่อม API ไม่ได้
        throw err.response?.data || err;
      });
  } catch (e) {
    Swal.fire({
      title: "เกิดข้อผิดพลาด",
      text: getErrorMessage(e),
      icon: "error",
    });
  }
}; 

  // ค้นหาฝั่งหน้าเว็บจากรายการที่โหลดแล้ว
  const keyword = search.trim().toLowerCase();
  const filtered = keyword
    ? results.filter((item) => `${item.year}`.toLowerCase().includes(keyword))
    : results;

  return (
    <>
      <Template>
        <div className="p-4 bg-light min-vh-100">
          <PageHeader
            eyebrow="รายงาน / รายได้รายปี"
            title="รายได้รายปี"
            description="สรุปรายได้ค่าบริการรวมของแต่ละปีพร้อมรายการชำระ"
            count={`${filtered.length.toLocaleString("th-TH")} ปี`}
          />
          <FilterBar>
            <SearchBox className="fb-search" value={search} onChange={setSearch} placeholder="ค้นหาปี" />
            {search && <FilterBarClear onClick={() => setSearch("")} />}
          </FilterBar>
          <div className="card border-0 rounded-4 shadow-custom overflow-hidden">
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
                        ปี
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
                    {filtered.length > 0 ? (
                      filtered.map((item, index) => (
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
                              className="btn btn-outline-primary btn-sm px-3 rounded-pill fw-bold btn-detail"
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
                  // เรียงรายการล่าสุดไว้บนสุด
                  [...selectedResult.results]
                    .sort((a, b) => {
                      // เรียงตามวันที่ชำระ + เวลาชำระ (ไม่มี payDate ไว้ล่างสุด)
                      const payTime = (x) =>
                        x.payDate
                          ? dayjs(x.payDate)
                              .hour(Number(x.payHour) || 0)
                              .minute(Number(x.payMinute) || 0)
                              .valueOf()
                          : -Infinity;
                      return payTime(b) - payTime(a);
                    })
                    .map((item, index) => (
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
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill">
                            {item.package.name}
                          </span>
                        ) : (
                          <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill fw-normal">
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


