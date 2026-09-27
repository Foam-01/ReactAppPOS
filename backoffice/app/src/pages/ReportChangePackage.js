import Swal from "../utils/swal";
import { getErrorMessage } from "../utils/error";
import Template from "./Template";
import { SearchBox } from "../components/ListToolbar";
import { PageHeader, PageHeaderPill, FilterBar, FilterBarClear } from "../components/PageHeader";
import { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";
import * as dayjs from "dayjs";
import Modal from "../components/Modal";

function ReportChangePackage() {
  
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [hours] = useState(() => {
    let arr = [];

    for (let i = 0; i <= 23; i++) {
      arr.push(i);
    }

    return arr;
  });

  const [minutes] = useState(() => {
    let arr = [];

    for (let i = 0; i < 59; i++) {
      arr.push(i);
    }

    return arr;
  });

  const [remark, setRemark] = useState("");
  const [payDate, setPayDate] = useState(() => {
    const myDate = new Date();
    return myDate.toISOString().split("T")[0];
  });

  const [payHour, setPayHour] = useState(() => {
    const d = new Date();
    return d.getHours();
  });
  const [payMinute, setPayMinute] = useState(() => {
    const d = new Date();
    return d.getMinutes();
  });

  const [changePackage, setChangePackage] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await axios
        .get(config.api_path + "/changePackage/list", config.headers())
        .then((res) => {
          if (res.data.message === "success") {
            setMembers(res.data.results);
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
    }
  };

  const handleSave = async () => {
    let payload = {
      payDate: payDate,
      payHour: payHour,
      payMinute: payMinute,
      remark: remark,
      id: changePackage.id,
    };

    try {
      await axios
        .post(
          config.api_path + "/changePackage/saveChange",
          payload,
          config.headers(),
        )
        .then((res) => {
          if (res.data.message === "success") {
            Swal.fire({
              icon: "success",
              title: "อนุมัติคำขอสำเร็จ",
              text: "คำขอเปลี่ยนแพ็กเกจได้รับการอนุมัติเรียบร้อยแล้ว",
              timer: 2000,
              showConfirmButton: false, // เอาปุ่ม OK ออกเพื่อให้ปิดเองเนียนๆ
            });

            fetchData(); // โหลดข้อมูลตารางใหม่

            // 🌟 1. สั่งปิด Modal อัตโนมัติ 🌟
            let btns = document.getElementsByClassName("btnClose");
            for (let i = 0; i < btns.length; i++) btns[i].click();

            // 🌟 2. เคลียร์ค่าหมายเหตุทิ้ง ป้องกันข้อมูลค้างไปบิลต่อไป 🌟
            setRemark("");
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
    }
  };

  // ค้นหาฝั่งหน้าเว็บจากรายการที่โหลดแล้ว
  const keyword = search.trim().toLowerCase();
  const filtered = keyword
    ? members.filter((item) => `${item.member?.name} ${item.member?.phone} ${item.package?.name}`.toLowerCase().includes(keyword))
    : members;

  return (
    <>
      <Template>
        <div className="p-4 bg-light min-vh-100">
          <PageHeader
            eyebrow="รายงาน / เปลี่ยนแพ็กเกจ"
            title="คำขอเปลี่ยนแพ็กเกจ"
            description="ตรวจสอบและยืนยันการชำระเงินของคำขอเปลี่ยนแพ็กเกจ"
            summary={<PageHeaderPill tone="amber">รออนุมัติ {filtered.length.toLocaleString("th-TH")}</PageHeaderPill>}
          />
          <FilterBar>
            <SearchBox className="fb-search" value={search} onChange={setSearch} placeholder="ค้นหาชื่อ เบอร์โทร หรือแพ็กเกจ" />
            {search && <FilterBarClear onClick={() => setSearch("")} />}
          </FilterBar>
          <div className="card border-0 rounded-4 shadow-custom overflow-hidden">
            {/* Card Body */}
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table align-middle mb-0 custom-table">
                  <thead className="bg-light">
                    <tr>
                      <th
                        className="ps-4 py-3 text-secondary fw-bold text-uppercase"
                        style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                      >
                        สมาชิก
                      </th>
                      <th
                        className="py-3 text-center text-secondary fw-bold text-uppercase"
                        style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                      >
                        วันที่ขอเปลี่ยน
                      </th>
                      <th
                        className="py-3 text-center text-secondary fw-bold text-uppercase"
                        style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                      >
                        แพ็กเกจใหม่
                      </th>
                      <th
                        className="pe-4 py-3 text-end text-secondary fw-bold text-uppercase"
                        style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                      >
                        ค่าบริการ/เดือน
                      </th>
                      <th
                        className="py-3 text-center text-secondary fw-bold text-uppercase"
                        style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                      >
                        การจัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0 bg-white">
                    {filtered.length > 0 ? (
                      filtered.map((item, index) => (
                        <tr key={index}>
                          {/* ข้อมูลสมาชิก */}
                          <td className="ps-4 py-3">
                            <div className="d-flex align-items-center">
                              <div
                                className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm border"
                                style={{ width: "45px", height: "45px" }}
                              >
                                <i className="fa-regular fa-user text-secondary fs-5"></i>
                              </div>
                              <div>
                                <div className="fw-bold text-dark fs-6">
                                  {item.member?.name ||
                                    "ไม่พบข้อมูลสมาชิก (ถูกลบ)"}
                                </div>
                                <div className="text-muted small fw-medium mt-1">
                                  <i className="fa-solid fa-phone-alt me-1 opacity-50"></i>
                                  {item.member?.phone || "ไม่พบข้อมูลโทรศัพท์"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* วันที่ทำรายการ */}
                          <td className="text-center py-3">
                            <div className="fw-bold text-dark">
                              {dayjs(item.createdAt).format("DD MMM YYYY")}
                            </div>
                            <div className="text-muted small font-monospace mt-1 bg-light d-inline-block px-2 rounded">
                              <i className="fa-regular fa-clock me-1"></i>
                              {dayjs(item.createdAt).format("HH:mm")} น.
                            </div>
                          </td>

                          {/* แพ็กเกจที่ต้องการ */}
                          <td className="text-center py-3">
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill">
                              <i className="fa-solid fa-box-open me-2 text-white opacity-75"></i>
                              {item.package?.name || "ไม่พบข้อมูลแพ็กเกจ"}
                            </span>
                          </td>

                          {/* ราคา */}
                          <td className="text-end pe-4 py-3">
                            <span className="h5 fw-bold text-success font-monospace mb-0">
                              {Number(
                                item.package?.price || 0,
                              ).toLocaleString()}
                            </span>
                            <span className="text-muted fw-bold ms-1">฿</span>
                          </td>

                          {/* ปุ่มกดอนุมัติ */}
                          <td className="text-center py-3">
                            <button
                              onClick={(e) => setChangePackage(item)}
                              data-bs-toggle="modal"
                              data-bs-target="#modalPay"
                              className="btn btn-success rounded-pill px-4 py-2 shadow-sm btn-approve fw-bold"
                            >
                              <i className="fa-solid fa-check-circle me-2"></i>
                              อนุมัติ
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-5">
                          <div className="py-4">
                            <div
                              className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm"
                              style={{ width: "80px", height: "80px" }}
                            >
                              <i className="fa-solid fa-clipboard-check fs-1 text-success opacity-50"></i>
                            </div>
                            <h5 className="text-dark fw-bold mb-1">
                              ไม่มีคำขอเปลี่ยนแพ็กเกจใหม่
                            </h5>
                            <p className="text-muted small mb-0">
                              รายการอัปเดตล่าสุดจะแสดงที่นี่
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ส่วนท้ายตาราง */}
            <div className="card-footer bg-light border-0 py-3 text-center">
              <small className="text-muted fw-medium">
                <i className="fa-solid fa-rotate me-1"></i> ข้อมูลอัปเดตล่าสุด{" "}
                {dayjs().format("HH:mm:ss")} น.
              </small>
            </div>
          </div>
        </div>

      </Template>

      <Modal id="modalPay" title="อนุมัติการชำระเงิน" modalSize="modal-md">
        <div className="p-4 bg-white">
          {/* ข้อความแจ้งเตือนแบบเรียบง่าย */}
          <p
            className="text-muted small mb-4 pb-3 border-bottom"
            style={{ lineHeight: "1.6" }}
          >
            <i className="fa-solid fa-circle-info me-2 opacity-50"></i>
            กรุณาตรวจสอบสลิปการโอนเงิน และระบุวันเวลาให้ตรงกันก่อนทำการอนุมัติ
          </p>

          {/* 1. วันที่ชำระเงิน */}
          <div className="mb-4">
            <label htmlFor="reportchangepackage-field-1" className="form-label small fw-bold text-dark">
              วันที่ชำระเงิน
            </label>

            <input id="reportchangepackage-field-1"
              onChange={(e) => setPayDate(e.target.value)}
              value={payDate}
              className="form-control minimal-input"
              type="date"
            />
          </div>

          {/* 2. เวลาที่โอน */}
          <div className="mb-4">
            <label htmlFor="reportchangepackage-field-2" className="form-label small fw-bold text-dark">
              เวลาที่โอน
            </label>
            <div className="d-flex align-items-center gap-3">
              <select id="reportchangepackage-field-2"
                value={payHour}
                onChange={(e) => setPayHour(e.target.value)}
                className="form-select minimal-input text-center cursor-pointer"
                style={{ width: "90px" }}
              >
                {hours.length > 0
                  ? hours.map((item) => (
                      <option key={item} value={item}>
                        {item.toString().padStart(2, "0")}
                      </option>
                    ))
                  : null}
              </select>

              <span className="fw-bold text-muted fs-5">:</span>

              <select
                value={payMinute}
                onChange={(e) => setPayMinute(e.target.value)}
                className="form-select minimal-input text-center cursor-pointer"
                style={{ width: "90px" }}
              >
                {minutes.length > 0
                  ? minutes.map((item) => (
                      <option key={item} value={item}>
                        {item.toString().padStart(2, "0")}
                      </option>
                    ))
                  : null}
              </select>
            </div>
          </div>

          {/* 3. หมายเหตุ */}
          <div className="mb-5">
            <label htmlFor="reportchangepackage-field-3" className="form-label small fw-bold text-dark">
              หมายเหตุ <span className="fw-normal text-muted">(ถ้ามี)</span>
            </label>
            <input id="reportchangepackage-field-3"
              onChange={(e) => setRemark(e.target.value)}
              className="form-control minimal-input"
              placeholder="เพิ่มหมายเหตุ..."
            />
          </div>

          {/* 4. ปุ่มกดยืนยันและยกเลิก (เพิ่มปุ่มยกเลิกสำหรับปิด Modal) */}
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn w-50 py-2 fw-bold minimal-cancel-btn btnClose"
              data-dismiss="modal" /* สำหรับ Bootstrap 4 */
              data-bs-dismiss="modal" /* สำหรับ Bootstrap 5 */
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              type="button"
              className="btn btn-dark w-50 py-2 fw-bold minimal-btn"
            >
              ยืนยันการอนุมัติ
            </button>
          </div>
        </div>

        <style>{`
          /* สไตล์ช่องกรอกข้อมูลแบบมินิมอล */
          .minimal-input {
            border: 1px solid var(--color-border);
            border-radius: 8px;
            padding: 0.6rem 1rem;
            font-size: 0.95rem;
            background-color: #ffffff;
            box-shadow: none !important;
            transition: border-color 0.2s ease;
          }
          
          .minimal-input:focus, .minimal-input:active {
            border-color: #94a3b8;
          }

          /* สไตล์ปุ่มยืนยัน (สีดำด้าน) */
          .minimal-btn {
            border-radius: 8px;
            background-color: var(--color-text);
            border: none;
            letter-spacing: 0.5px;
            transition: background-color 0.2s ease, transform 0.1s ease;
          }
          
          .minimal-btn:hover { background-color: #0f172a; }
          .minimal-btn:active { transform: scale(0.98); }

          /* สไตล์ปุ่มยกเลิก (สีเทาอ่อน) */
          .minimal-cancel-btn {
            border-radius: 8px;
            background-color: var(--color-row-hover);
            color: var(--color-text-muted);
            border: 1px solid var(--color-border);
            letter-spacing: 0.5px;
            transition: all 0.2s ease;
          }

          .minimal-cancel-btn:hover { background-color: var(--color-border); color: #475569; }
          .minimal-cancel-btn:active { transform: scale(0.98); }

          /* แต่งปฏิทิน */
          input[type="date"]::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.4; }
          input[type="date"]::-webkit-calendar-picker-indicator:hover { opacity: 0.8; }
          
          .cursor-pointer { cursor: pointer; }
        `}</style>
      </Modal>
    </>
  );
}

export default ReportChangePackage;
