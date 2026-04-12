import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import config from "../config";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Modal from "../components/Modal";

function Template(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = (path) => (location.pathname === path ? "active" : "");
  const [usr, setUsr] = useState("");
  const [pwd, setPwd] = useState("");

  useEffect(() => {
    fetchData();
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        config.api_path + "/admin/info",
        config.headers(),
      );
      if (res.data.message === "success") {
        setAdmin(res.data.result);
      }
    } catch (e) {
      if (e.response && e.response.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    }
  };

  const handleSignOut = () => {
    Swal.fire({
      title: "Sign Out",
      text: "คุณต้องการออกจากระบบจัดการใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
      customClass: {
        confirmButton:
          "btn btn-danger rounded-pill px-4 py-2 fw-bold shadow-sm",
        cancelButton: "btn btn-light rounded-pill px-4 py-2 fw-bold me-2",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        navigate("/");
      }
    });
  };

  const handleChangeProfile = () => {
    Swal.fire({
      title: "เปลี่ยนข้อมูล",
      text: "คุณต้องการเปลี่ยนข้อมูลใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, เปลี่ยนข้อมูล",
      cancelButtonText: "ยกเลิก",
      customClass: {
        // ใช้ปุ่มสีฟ้า/น้ำเงิน (primary) สำหรับการยืนยันแก้ไขข้อมูลดูจะเข้ากว่าสีแดง (danger) ครับ
        confirmButton:
          "btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm",
        cancelButton: "btn btn-light rounded-pill px-4 py-2 fw-bold me-2",
      },
      buttonsStyling: false,
    }).then(async (res) => {
      if (res.isConfirmed) {
        // 1. เตรียม Payload
        const payload = {
          usr: usr,
          id: admin.id,
        };

        if (pwd !== "") {
          payload.pwd = pwd;
        }

        // 2. ยิง API
        try {
          await axios
            .post(
              config.api_path + "/admin/ChangeProfile",
              payload,
              config.headers(),
            )
            .then((res) => {
              if (res.data.message === "success") {
                // 🌟 1. สั่งปิด Modal ด้วยคำสั่งของ Bootstrap (ลบโค้ด btnClose อันเก่าทิ้งไปเลยครับ) 🌟
                const modalElement = document.getElementById("modalMyInfoo");
                if (modalElement) {
                  const myModal =
                    window.bootstrap.Modal.getInstance(modalElement) ||
                    new window.bootstrap.Modal(modalElement);
                  myModal.hide();
                }

                // 🌟 สร้างการแจ้งเตือนแบบ Toast 🌟
                const Toast = Swal.mixin({
                  toast: true,
                  position: "top-end", // ให้เด้งที่มุมขวาบน
                  showConfirmButton: false, // ซ่อนปุ่ม OK
                  timer: 2000, // แสดงผล 2 วินาที
                  timerProgressBar: true, // มีหลอดโหลดเวลา
                  didOpen: (toast) => {
                    toast.addEventListener("mouseenter", Swal.stopTimer);
                    toast.addEventListener("mouseleave", Swal.resumeTimer);
                  },
                });

                // สั่งให้ Toast แสดงผล
                Toast.fire({
                  icon: "success",
                  title: "เปลี่ยนข้อมูลเรียบร้อยแล้ว",
                }).then((res) => {
                  localStorage.removeItem(config.token_name);
                  navigate("/");
                });

                // ถ้ามีฟังก์ชันโหลดข้อมูลใหม่ หรือปิด Modal ให้เรียกใช้ตรงนี้ได้เลยครับ
                // fetchData();
              }
            })
            .catch((err) => {
              // ดัก error จาก axios
              throw err.response?.data || err;
            });
        } catch (e) {
          // ดัก error รวม
          Swal.fire({
            title: "เกิดข้อผิดพลาด",
            text: e.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
            icon: "error",
          });
        }
      }
    });
  };

  return (
    <div className="container-fluid p-0 vh-100 overflow-hidden d-flex flex-column flex-lg-row">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
      />

      {/* --- Mobile Top Bar --- */}
      <div className="d-lg-none bg-sidebar p-3 d-flex justify-content-between align-items-center shadow-sm text-white sticky-top">
        <span className="fw-bold text-info">POS BACKOFFICE</span>
        <button
          className="btn text-white border-0"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <i
            className={`fa-solid ${isSidebarOpen ? "fa-xmark" : "fa-bars"} fs-4`}
          ></i>
        </button>
      </div>

      {/* --- Sidebar --- */}
      <div
        className={`col-sidebar bg-sidebar text-white h-100 shadow-sm d-flex flex-column pt-3 ${isSidebarOpen ? "open" : ""}`}
      >
        {/* Admin Profile Section (ลด margin bottom จาก mb-4 เป็น mb-3) */}
        <div className="mx-3 mb-3 p-3 rounded-4 bg-profile-box">
          <div className="d-flex align-items-center">
            <div
              className="bg-gradient-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm flex-shrink-0"
              style={{ width: "35px", height: "35px" }}
            >
              <i
                className="fa-solid fa-user text-white"
                style={{ fontSize: "0.8rem" }}
              ></i>
            </div>
            <div className="ms-3 overflow-hidden text-nowrap">
              <div
                className="fw-bold text-white text-truncate"
                style={{ fontSize: "0.85rem" }}
              >
                {admin ? admin.name : "Loading..."}
              </div>
              <div className="text-secondary-light small">
                <i className="fa-solid fa-shield-halved me-1 text-info"></i>
                {admin ? admin.level : "..."}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu (🌟 เอา overflow-auto ออก เพื่อไม่ให้เลื่อนได้ 🌟) */}
        <div className="nav-container px-3 flex-grow-1">
          {/* เอา pb-5 ออก */}
          <ul className="nav flex-column gap-1 mt-1">
            <li className="nav-label ps-3 text-uppercase opacity-50 small fw-bold mb-1">
              Overview
            </li>
            <li className="nav-item">
              <Link
                to="/home"
                className={`nav-link-minimal ${isActive("/home")}`}
              >
                <i className="fa-solid fa-chart-pie"></i>
                <span>Dashboard</span>
              </Link>
            </li>

            {/* ลด Margin Top จาก mt-4 เป็น mt-3 */}
            <li className="nav-label ps-3 text-uppercase opacity-50 small fw-bold mt-3 mb-1">
              Reports
            </li>
            <li className="nav-item">
              <Link
                to="/reportMember"
                className={`nav-link-minimal ${isActive("/reportMember")}`}
              >
                <i className="fa-solid fa-user-check"></i>
                <span>สมัครใช้บริการ</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/reportChangePackage"
                className={`nav-link-minimal ${isActive("/reportChangePackage")}`}
              >
                <i className="fa-solid fa-rotate"></i>
                <span>เปลี่ยนแพ็กเกจ</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/reportSumSalePerDay"
                className={`nav-link-minimal ${isActive("/reportSumSalePerDay")}`}
              >
                <i className="fa-solid fa-calendar-day"></i>
                <span>ยอดขายรายวัน</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/reportSumSalePerMonth"
                className={`nav-link-minimal ${isActive("/reportSumSalePerMonth")}`}
              >
                <i className="fa-solid fa-calendar-days"></i>
                <span>รายได้รายเดือน</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/reportSumSalePerYear"
                className={`nav-link-minimal ${isActive("/reportSumSalePerYear")}`}
              >
                <i className="fa-solid fa-chart-column"></i>
                <span>รายได้รายปี</span>
              </Link>
            </li>

            {/* ลด Margin Top จาก mt-4 เป็น mt-3 */}
            <li className="nav-label ps-3 text-uppercase opacity-50 small fw-bold mt-3 mb-1">
              Settings
            </li>
            <li className="nav-item">
              <Link
                to="/admin"
                className={`nav-link-minimal ${isActive("/admin")}`}
              >
                <i className="fa-solid fa-gears"></i>
                <span>ผู้ใช้ระบบ</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Footer Buttons (แก้ไข/ออกจากระบบ) */}
        <div className="p-3 mt-auto border-top border-secondary d-flex flex-column gap-2">
          <button
            data-bs-toggle="modal"
            data-bs-target="#modalMyInfoo"
            className="btn btn-edit-profile w-100 d-flex align-items-center justify-content-center gap-2 py-2"
          >
            <i className="fa-solid fa-user-pen"></i>
            <span>Edit Info</span>
          </button>

          <button
            className="btn btn-logout w-100 d-flex align-items-center justify-content-center gap-2 py-2"
            onClick={handleSignOut}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* --- Mobile Overlay --- */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay d-lg-none"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* --- Main Content Area --- */}
      <div className="flex-grow-1 bg-light-gray h-100 overflow-auto p-3 p-md-4">
        <div className="content-inner shadow-sm rounded-4 bg-white p-3 p-md-4 min-vh-100 border animate__animated animate__fadeIn">
          {props.children}
        </div>
      </div>

      <style>{`
        .bg-sidebar { background-color: #1e1e2d; }
        .bg-light-gray { background-color: #f5f7f9; }
        .text-secondary-light { color: #6c7293; }
        .bg-gradient-primary { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); }
        .bg-profile-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); }

        .nav-label { font-size: 0.65rem; color: #4a4a65; letter-spacing: 1px; }

        /* 🔥 Sidebar Responsive Logic */
        .col-sidebar {
            width: 280px;
            transition: all 0.3s ease;
            z-index: 1040;
        }

        @media (max-width: 991.98px) {
            .col-sidebar {
                position: fixed;
                left: -280px;
                top: 0;
                width: 280px;
            }
            .col-sidebar.open {
                left: 0;
            }
            .sidebar-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0,0,0,0.5);
                z-index: 1030;
            }
        }

        /* 🌟 บีบ Padding ของปุ่มเมนูให้เล็กลงนิดหน่อย (จาก 12px เหลือ 9px) 🌟 */
        .nav-link-minimal {
            display: flex; align-items: center; padding: 9px 16px; color: #a2a3b7;
            text-decoration: none; font-weight: 500; border-radius: 10px; transition: all 0.2s ease;
            font-size: 0.95rem;
        }

        .nav-link-minimal i { width: 32px; font-size: 1.1rem; opacity: 0.6; display: inline-block; }
        .nav-link-minimal.active { background-color: rgba(99, 102, 241, 0.12); color: #8385ff !important; font-weight: 600; }
        .nav-link-minimal.active i { opacity: 1; color: #8385ff; }
        .nav-link-minimal:hover:not(.active) { color: #ffffff; background-color: rgba(255, 255, 255, 0.03); transform: translateX(5px); }

        /* สไตล์ปุ่มแก้ไขโปรไฟล์ (สีฟ้า) */
        .btn-edit-profile { background: transparent; border: 1px solid rgba(255, 255, 255, 0.1); color: #0dcaf0; border-radius: 10px; font-size: 0.85rem; font-weight: 600; transition: 0.3s; }
        .btn-edit-profile:hover { background: rgba(13, 202, 240, 0.1); color: #0dcaf0; }

        /* สไตล์ปุ่มออกจากระบบ (สีแดง) */
        .btn-logout { background: transparent; border: 1px solid rgba(255, 255, 255, 0.1); color: #f64e60; border-radius: 10px; font-size: 0.85rem; font-weight: 600; transition: 0.3s; }
        .btn-logout:hover { background: rgba(246, 78, 96, 0.1); color: #f64e60; }
        
      `}</style>

      {/* 🌟 Modal เปลี่ยนข้อมูลส่วนตัว 🌟 */}
      <Modal
        id="modalMyInfoo"
        title={
          <>
            <i className="fa-solid fa-user-pen text-primary me-2"></i>{" "}
            เปลี่ยนข้อมูลส่วนตัว
          </>
        }
      >
        <div>
          <label className="fw-bold text-secondary small mb-1">Username</label>
          <input
            onChange={(e) => setUsr(e.target.value)}
            // 🌟 1. ใช้ admin?.usr || "" เพื่อดักบั๊ก null
            // 🌟 2. ใช้ defaultValue เพื่อให้พิมพ์แก้ไขได้
            defaultValue={admin?.usr || ""}
            type="text"
            className="form-control"
          />
        </div>

        <div className="mt-3">
          <label className="fw-bold text-secondary small mb-1">
            New Password
          </label>
          <input
            onChange={(e) => setPwd(e.target.value)}
            value={pwd} // รหัสผ่านใช้ state pwd ปกติได้เลย
            type="password" // 🌟 เปลี่ยนเป็น type="password" ให้กรอกแล้วเป็นจุดดำๆ
            className="form-control"
            placeholder="เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยนรหัสผ่าน" // ใส่ placeholder แจ้งเตือนผู้ใช้
          />
        </div>

        <div className="mt-4 text-end">
          <button
            onClick={handleChangeProfile}
            className="btn btn-primary rounded-pill px-4 shadow-sm"
          >
            <i className="fa-solid fa-floppy-disk me-2"></i>
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Template;
