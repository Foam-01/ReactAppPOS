import axios from "axios";
import { useState } from "react";
import Swal from "sweetalert2";
import config from "../config";
import { useNavigate } from "react-router-dom";

function Login() {
    const [phone, setPhone] = useState();
    const [pass, setPass] = useState();

    const navigate = useNavigate();

    const handleSignIn = async () => {
        try {
            const payload = {
                phone: phone,
                pass: pass
            }
            await axios.post(config.api_path + '/member/signin', payload).then(res => {
                if (res.data.message === 'success') {
                    Swal.fire({
                        title: "เข้าสู่ระบบสำเร็จ",
                        text: "ยินดีต้อนรับเข้าสู่ระบบ",
                        icon: "success",
                        timer: 2000,
                    })
                    localStorage.setItem(config.token_name, res.data.token);
                      navigate('/home');
                } else {
                    Swal.fire({
                        title: "เข้าสู่ระบบไม่สำเร็จ",
                        text: "กรุณาตรวจสอบเบอร์โทรและรหัสผ่านอีกครั้ง",
                        icon: "error",
                        timer: 2000,
                    })
                }
            }).catch(err => {
                throw err.response.data;
            })
        } catch (e) {
            Swal.fire({
                title: "เกิดข้อผิดพลาด",
                text: e.message,
                icon: "error",
                timer: 2000,
            })
        }
    } 

  return (
    <>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-5">
            {/* ปรับ Card ให้มีเงาฟุ้งและขอบมนสวยงาม */}
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="card-header bg-primary text-white py-4 text-center">
                <div className="h3 fw-bold mb-0">Login to POS</div>
                <small className="opacity-75">FoamPos Cloud Service</small>
              </div>
              
              <div className="card-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary">เบอร์โทร</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="fa fa-phone text-muted"></i>
                    </span>
                    <input 
                      onChange={e => setPhone(e.target.value)} 
                      className="form-control bg-light border-start-0 ps-0 shadow-none py-2" 
                      placeholder="ระบุเบอร์โทรศัพท์"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold text-secondary">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="fa fa-lock text-muted"></i>
                    </span>
                    <input 
                      onChange={e => setPass(e.target.value)} 
                      type="password" 
                      className="form-control bg-light border-start-0 ps-0 shadow-none py-2" 
                      placeholder="ระบุรหัสผ่าน"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSignIn} 
                  className="btn btn-primary btn-lg w-100 rounded-pill shadow-sm fw-bold mt-2"
                >
                  <i className="fa fa-check me-2"></i>
                  Sign In
                </button>
              </div>

              
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;