import Swal, { DANGER_COLOR } from "../utils/swal";
import { getErrorMessage } from "../utils/error";
import Template from "./Template";
import { SearchBox } from "../components/ListToolbar";
import { PageHeader, FilterBar, FilterBarButton, FilterBarClear } from "../components/PageHeader";
import { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";
import Modal from "../components/Modal";

function Admin() {
  const [level] = useState(() => {
    return ["admin", "sub admin"];
  });
  const [selectedLevel, setSelectedLevel] = useState("admin");
  const [name, setName] = useState("");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [admin, setAdmin] = useState([]);
  const [search, setSearch] = useState("");
  const [id, setId] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await axios
        .get(config.api_path + "/admin/list", config.headers())
        .then((res) => {
          if (res.data.message === "success") {
            setAdmin(res.data.results);
          }
        })
        .catch((err) => {
          throw err;
        });
    } catch (e) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: getErrorMessage(e),
        icon: "error",
      });
    }
  };

  const handleSave = async () => {
    if (password !== confirmPassword) {
      Swal.fire({
        title: "รหัสผ่านไม่ตรงกัน",
        text: "กรอกรหัสผ่านทั้งสองช่องให้เหมือนกัน",
        icon: "error",
      });
      return;
    }
    try {
      const payload = {
        name: name,
        usr: user,
        level: selectedLevel,
        email: email,
      };

      if (password != "") {
        payload.pwd = password;
      }

      let url = "/admin/create";

      if (id > 0) {
        url = "/admin/edit/" + id;
      }

      await axios
        .post(config.api_path + url, payload, config.headers())
        .then((res) => {
          if (res.data.message === "success") {
            Swal.fire({
              title: "บันทึกแล้ว",
              icon: "success",
              showConfirmButton: false,
              timer: 2000,
            });

            // ปิด Modal
            const modalElement = document.getElementById("modalForm");
            if (modalElement) {
              const myModal =
                window.bootstrap.Modal.getInstance(modalElement) ||
                new window.bootstrap.Modal(modalElement);
              myModal.hide();
            }

            fetchData();

            // เคลียร์ฟอร์ม
            setName("");
            setUser("");
            setPassword("");
            setConfirmPassword("");
            setEmail("");

            setId(0);
          }
        })
        .catch((err) => {
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

  const handleDelete = (item) => {
    Swal.fire({
      title: "ยืนยันการลบข้อมูล",
      text: `คุณต้องการลบข้อมูลผู้ใช้งาน ${item.name} ใช่หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      confirmButtonColor: DANGER_COLOR,
      cancelButtonText: "ยกเลิก",
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await axios
            .delete(
              config.api_path + "/admin/delete/" + item.id,
              config.headers(),
            )
            .then((res) => {
              if (res.data.message === "success") {
                // 🌟 สร้างการแจ้งเตือนแบบ Toast 🌟
                const Toast = Swal.mixin({
                  toast: true,
                  position: "top-end", // ให้เด้งที่มุมขวาบน
                  showConfirmButton: false, // ไม่ต้องมีปุ่ม OK
                  timer: 2000, // เวลาแสดงผล (2 วินาที)
                  timerProgressBar: true, // มีหลอดโหลดเวลาด้านล่าง
                  didOpen: (toast) => {
                    toast.addEventListener("mouseenter", Swal.stopTimer);
                    toast.addEventListener("mouseleave", Swal.resumeTimer);
                  },
                });

                // สั่งให้ Toast แสดงผล
                Toast.fire({
                  icon: "success",
                  title: "ลบข้อมูลเรียบร้อยแล้ว",
                });

                fetchData(); // อัปเดตตาราง
              }
            })
            .catch((err) => {
              // 🌟 แอบใส่ ?. ดักให้เหมือนหน้าอื่น กันจอขาวครับ
              throw err.response?.data || err;
            });
        } catch (e) {
          Swal.fire({
            title: "เกิดข้อผิดพลาด",
            text: getErrorMessage(e),
            icon: "error",
          });
        }
      }
    });
  };

  const handleSelectedAdmin = (item) => {
    setSelectedLevel(item.level);
    setName(item.name);
    setUser(item.usr);
    setEmail(item.email);
    setId(item.id);
  };

  // ค้นหาฝั่งหน้าเว็บจากรายการที่โหลดแล้ว
  const keyword = search.trim().toLowerCase();
  const filtered = keyword
    ? admin.filter((item) => `${item.name} ${item.usr} ${item.email}`.toLowerCase().includes(keyword))
    : admin;

  return (
    <>
      <Template>
        <div className="p-4 bg-light min-vh-100">
          <PageHeader
            eyebrow="ตั้งค่า / ผู้ใช้ระบบ"
            title="ผู้ใช้ระบบ (Admin)"
            description="จัดการบัญชีผู้ดูแลระบบและกำหนดระดับสิทธิ์การใช้งาน"
            count={`${filtered.length.toLocaleString("th-TH")} คน`}
          />
          <FilterBar
            actions={
              <FilterBarButton
                variant="primary"
                icon="fa-solid fa-plus"
                data-bs-toggle="modal"
                data-bs-target="#modalForm"
              >
                เพิ่มผู้ใช้ใหม่
              </FilterBarButton>
            }
          >
            <SearchBox className="fb-search" value={search} onChange={setSearch} placeholder="ค้นหาชื่อ Username หรืออีเมล" />
            {search && <FilterBarClear onClick={() => setSearch("")} />}
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
                        ชื่อ - นามสกุล
                      </th>
                      <th
                        className="py-3 text-secondary fw-bold text-uppercase"
                        style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                      >
                        Username
                      </th>
                      <th
                        className="py-3 text-secondary fw-bold text-uppercase"
                        style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                      >
                        ระดับสิทธิ์
                      </th>
                      <th
                        className="py-3 text-secondary fw-bold text-uppercase"
                        style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                      >
                        อีเมล
                      </th>
                      <th
                        className="pe-4 py-3 text-center text-secondary fw-bold text-uppercase"
                        style={{
                          fontSize: "0.85rem",
                          letterSpacing: "1px",
                          width: "150px",
                        }}
                      >
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0 bg-white">
                    {filtered.length > 0 ? (
                      filtered.map((item, index) => (
                        <tr key={index}>
                          <td className="ps-4 py-3">
                            <div className="d-flex align-items-center">
                              <div
                                className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3 border shadow-sm"
                                style={{ width: "40px", height: "40px" }}
                              >
                                <i className="fa-solid fa-user-shield text-secondary"></i>
                              </div>
                              <span className="fw-bold text-dark fs-6">
                                {item.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-muted fw-medium font-monospace">
                            @{item.usr}
                          </td>
                          <td className="py-3">
                            {/* ทำป้ายสีให้ต่างกันตาม Level */}
                            {item.level === "admin" ? (
                              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill">
                                <i className="fa-solid fa-crown me-1 text-warning"></i>{" "}
                                Admin
                              </span>
                            ) : (
                              <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill fw-normal">
                                <i className="fa-solid fa-user-gear me-1"></i>{" "}
                                Sub Admin
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-muted">
                            <i className="fa-regular fa-envelope me-2 opacity-50"></i>
                            {item.email || "-"}
                          </td>
                          <td className="pe-4 py-3 text-center">
                            <div className="table-actions">
                            <button
                              onClick={(e) => handleSelectedAdmin(item)}
                              data-bs-toggle="modal"
                              data-bs-target="#modalForm"
                              className="btn btn-outline-primary btn-icon"
                              title="แก้ไข"
                              aria-label="แก้ไข"
                            >
                              <i className="fa-solid fa-pencil"></i>
                            </button>
                            <button
                              onClick={(e) => handleDelete(item)}
                              className="btn btn-outline-danger btn-icon"
                              title="ลบ"
                              aria-label="ลบ"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                            </div>
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
                              <i className="fa-solid fa-user-xmark fs-1 text-muted opacity-50"></i>
                            </div>
                            <h5 className="text-dark fw-bold mb-1">
                              ยังไม่มีข้อมูลผู้ใช้ระบบ
                            </h5>
                            <p className="text-muted small mb-0">
                              กดปุ่ม "เพิ่มผู้ใช้ใหม่" เพื่อเริ่มต้น
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

        <style>{`
          /* ตกแต่ง Input Form ให้ดูนุ่มขึ้น */
          .form-label-custom { font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem; }
          .form-control-custom { border: 1px solid var(--color-border); padding: 0.6rem 1rem; border-radius: 0.5rem; transition: all 0.2s; }
          .form-control-custom:focus { border-color: #3b82f6; box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.15); }
        `}</style>
      </Template>

      {/* Modal เพิ่มข้อมูล */}
      <Modal
        id="modalForm"
        title={
          <>
            <i className="fa-solid fa-user-plus text-primary me-2"></i>{" "}
            ข้อมูลผู้ดูแลระบบ
          </>
        }
        modalSize="modal-lg"
      >
        <div className="p-3">
          <div className="row g-4">
            {/* ฝั่งซ้าย: ข้อมูลส่วนตัว */}
            <div className="col-md-6">
              <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                <i className="fa-regular fa-id-card me-2 text-muted"></i>{" "}
                ข้อมูลทั่วไป
              </h6>

              <div className="mb-3">
                <label htmlFor="admin-field-1" className="form-label-custom">ชื่อ - นามสกุล</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="fa-regular fa-user text-muted"></i>
                  </span>
                  <input id="admin-field-1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    className="form-control form-control-custom border-start-0 ps-0"
                    placeholder="ระบุชื่อผู้ใช้งาน"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="admin-field-2" className="form-label-custom">อีเมล</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="fa-regular fa-envelope text-muted"></i>
                  </span>
                  <input id="admin-field-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="form-control form-control-custom border-start-0 ps-0"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-field-3" className="form-label-custom">ระดับสิทธิ์</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="fa-solid fa-sitemap text-muted"></i>
                  </span>
                  <select id="admin-field-3"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="form-select form-control-custom border-start-0 ps-0"
                  >
                    {level.map((item, index) => (
                      <option key={index} value={item}>
                        {item.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ฝั่งขวา: ข้อมูลการเข้าสู่ระบบ */}
            <div className="col-md-6">
              <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                <i className="fa-solid fa-lock me-2 text-muted"></i>{" "}
                ข้อมูลเข้าสู่ระบบ
              </h6>

              <div className="mb-3">
                <label htmlFor="admin-field-4" className="form-label-custom">Username</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="fa-solid fa-at text-muted"></i>
                  </span>
                  <input id="admin-field-4"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    type="text"
                    className="form-control form-control-custom border-start-0 ps-0"
                    placeholder="ชื่อผู้ใช้สำหรับ Login"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="admin-field-5" className="form-label-custom">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="fa-solid fa-key text-muted"></i>
                  </span>
                  <input id="admin-field-5"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    className="form-control form-control-custom border-start-0 ps-0"
                    placeholder="รหัสผ่าน"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-field-6" className="form-label-custom">Confirm Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="fa-solid fa-shield-check text-muted"></i>
                  </span>
                  <input id="admin-field-6"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    className="form-control form-control-custom border-start-0 ps-0"
                    placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-top text-end">
            <button
              type="button"
              className="btn btn-light rounded-pill px-4 me-2 fw-bold text-muted border shadow-sm"
              data-bs-dismiss="modal"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm btn-hover-scale"
              style={{
                background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)",
                border: "none",
              }}
            >
              <i className="fa-solid fa-floppy-disk me-2"></i>
              บันทึกข้อมูล
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Admin;
