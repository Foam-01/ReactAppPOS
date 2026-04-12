import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import config from "./config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function App() {
  const [usr, setUsr] = useState("");
  const [pwd, setPwd] = useState("");
  const navigate = useNavigate();

  // 1. เพิ่ม parameter 'e' เข้ามา
  const handleSignIn = async (e) => {
    // 2. 🚩 หยุดการ Refresh หน้าจอจากฟอร์ม
    if (e) e.preventDefault();
    try {
      const payload = {
        usr: usr,
        pwd: pwd,
      };

      // 🚩 ใช้ await รับ res มาตรงๆ
      const res = await axios.post(config.api_path + "/admin/signin", payload);

      // 🚩 เช็ค message จาก server ให้ชัดเจน
      if (res.data.message === "success") {
        localStorage.setItem(config.token_name, res.data.token); // เก็บ token ด้วย
        navigate("/home");
      } else {
        // กรณี server ตอบ 200 แต่ message ไม่ใช่ success (กันเหนียว)
        Swal.fire({
          title: "ผิดพลาด",
          text: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
          icon: "error",
          timer: 3000,
        });
      }
    } catch (e) {
      // 🚩 ถ้าใส่รหัสผิด Backend ส่ง 401 จะตกลงมาที่ catch ทันที
      let errorMessage = "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง";

      if (e.response && e.response.status !== 401) {
        errorMessage = e.response.data.message || e.message;
      }

      Swal.fire({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: errorMessage,
        icon: "error",
        timer: 3000,
      });
    }
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center bg-light">
      <div
        className="card shadow-lg border-0 rounded-4"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <div className="card-body p-5">
          {/* ส่วนหัว - เน้นตัวหนังสือล้วนแต่จัดวางให้หรู */}
          <div className="text-center mb-5">
            <h3
              className="fw-bold text-primary mb-1"
              style={{ letterSpacing: "1px" }}
            >
              BACKOFFICE
            </h3>
            <div
              className="text-muted small fw-bold text-uppercase"
              style={{ letterSpacing: "2px", fontSize: "0.7rem" }}
            >
              Management System
            </div>
          </div>

          <form>
            {/* Username - กลับมาใช้ Input Group พร้อม Icon */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">
                USERNAME
              </label>
              <div className="input-group shadow-sm">
                <span className="input-group-text bg-white border-end-0 text-muted px-3">
                  <i className="fa fa-user"></i>
                </span>
                <input
                  onChange={(e) => setUsr(e.target.value)}
                  className="form-control border-start-0 ps-0 py-2"
                  placeholder="ระบุชื่อผู้ใช้งาน"
                  style={{ fontSize: "0.9rem" }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">
                PASSWORD
              </label>
              <div className="input-group shadow-sm">
                <span className="input-group-text bg-white border-end-0 text-muted px-3">
                  <i className="fa fa-key"></i>
                </span>
                <input
                  onChange={(e) => setPwd(e.target.value)}
                  className="form-control border-start-0 ps-0 py-2"
                  type="password"
                  placeholder="ระบุรหัสผ่าน"
                  style={{ fontSize: "0.9rem" }}
                />
              </div>
            </div>

            {/* Submit Button - กลับมาใช้ทรง Pill (โค้งมน) ที่ดู Modern */}
            <div className="d-grid mt-2">
              <button
                onClick={handleSignIn}
                className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm py-3 mt-3"
                style={{ fontSize: "1rem" }}
              >
                เข้าสู่ระบบ <i className="fa-solid fa-arrow-right ms-2"></i>
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center mt-5">
            <small
              className="text-muted opacity-75"
              style={{ fontSize: "0.7rem" }}
            >
              © 2026 POS SYSTEM • ALL RIGHTS RESERVED
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
