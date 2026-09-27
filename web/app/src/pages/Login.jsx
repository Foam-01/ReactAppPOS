import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "../utils/swal";
import { getErrorMessage } from "../utils/error";
import config from "../config";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Login() {
    const location = useLocation();
    // เบอร์โทรที่ส่งมาจากหน้าสมัครใช้งาน
    const [phone, setPhone] = useState(location.state?.phone || "");
    const [pass, setPass] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sessionExpired, setSessionExpired] = useState(false);
    // ข้อความผิดพลาดใต้ช่องกรอก (ให้ screen reader อ่านได้ด้วย)
    const [fieldErrors, setFieldErrors] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        document.title = "เข้าสู่ระบบ | FoamPos";
        if (sessionStorage.getItem("pos_session_expired")) {
            sessionStorage.removeItem("pos_session_expired");
            setSessionExpired(true);
        }
    }, []);

    const handleSignIn = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!phone || !pass) {
            setFieldErrors({
                phone: phone ? "" : "กรุณากรอกเบอร์โทร",
                pass: pass ? "" : "กรุณากรอกรหัสผ่าน",
            });
            Swal.fire({
                title: "กรอกข้อมูลไม่ครบ",
                text: "กรุณากรอกเบอร์โทรและรหัสผ่าน",
                icon: "warning",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                phone: phone,
                pass: pass
            }
            const res = await axios.post(config.api_path + '/member/signin', payload);
            if (res.data.message === 'success') {
                localStorage.setItem(config.token_name, res.data.token);
                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: "เข้าสู่ระบบสำเร็จ",
                    showConfirmButton: false,
                    timer: 2000,
                });
                navigate('/home');
                return;
            }
            Swal.fire({
                title: "เข้าสู่ระบบไม่สำเร็จ",
                text: "เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง",
                icon: "error",
            });
        } catch (e) {
            const wrongCredential = e.response?.status === 401;
            Swal.fire({
                title: wrongCredential ? "เข้าสู่ระบบไม่สำเร็จ" : "เกิดข้อผิดพลาด",
                text: wrongCredential ? "เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง" : getErrorMessage(e),
                icon: "error",
            });
        }
        setIsSubmitting(false);
    }

  return (
    <>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-5">
            {sessionExpired && (
              <div className="alert alert-warning rounded-3 small">
                <i className="fa-solid fa-clock me-2"></i>
                เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่
              </div>
            )}
            <form onSubmit={handleSignIn} className="card shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="card-header bg-primary text-white py-4 text-center">
                <div className="h3 fw-bold mb-0">เข้าสู่ระบบ</div>
                <small className="opacity-75">FoamPos Cloud Service</small>
              </div>
              <div className="card-body p-4">
                <div className="mb-3">
                  <label htmlFor="login-phone" className="form-label fw-semibold text-secondary">เบอร์โทร</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="fa-solid fa-phone text-muted" aria-hidden="true"></i>
                    </span>
                    <input
                      id="login-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="username"
                      autoFocus={!phone}
                      value={phone}
                      onChange={e => { setPhone(e.target.value); setFieldErrors(fe => ({ ...fe, phone: "" })); }}
                      aria-invalid={!!fieldErrors.phone}
                      aria-describedby={fieldErrors.phone ? "login-phone-error" : undefined}
                      className="form-control bg-light border-start-0 ps-0 shadow-none py-2"
                      placeholder="ระบุเบอร์โทรศัพท์"
                    />
                  </div>
                  {fieldErrors.phone && (
                    <div id="login-phone-error" className="text-danger small mt-1" role="alert">
                      {fieldErrors.phone}
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <label htmlFor="login-pass" className="form-label fw-semibold text-secondary">รหัสผ่าน</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="fa-solid fa-lock text-muted" aria-hidden="true"></i>
                    </span>
                    <input
                      id="login-pass"
                      type="password"
                      autoComplete="current-password"
                      autoFocus={!!phone}
                      value={pass}
                      onChange={e => { setPass(e.target.value); setFieldErrors(fe => ({ ...fe, pass: "" })); }}
                      aria-invalid={!!fieldErrors.pass}
                      aria-describedby={fieldErrors.pass ? "login-pass-error" : undefined}
                      className="form-control bg-light border-start-0 ps-0 shadow-none py-2"
                      placeholder="ระบุรหัสผ่าน"
                    />
                  </div>
                  {fieldErrors.pass && (
                    <div id="login-pass-error" className="text-danger small mt-1" role="alert">
                      {fieldErrors.pass}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-lg w-100 rounded-pill shadow-sm fw-bold mt-2"
                >
                  {isSubmitting ? (
                    <><i className="fa-solid fa-spinner fa-spin me-2"></i>กำลังเข้าสู่ระบบ...</>
                  ) : (
                    <><i className="fa-solid fa-check me-2"></i>เข้าสู่ระบบ</>
                  )}
                </button>
                <div className="text-center mt-3 small text-muted">
                  ยังไม่มีบัญชี? <Link to="/">สมัครใช้งาน</Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
