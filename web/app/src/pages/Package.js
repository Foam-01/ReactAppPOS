import { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";
import Modal from "../components/Modal";
import Swal from "../utils/swal";
import { getErrorMessage } from "../utils/error";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { closeModal } from "../utils/modal";

function Package() {
  const [packages, setPackages] = useState([]);
  const [yourPackage, setYourPackage] = useState({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = "สมัครใช้งาน | FoamPos";
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const res = await axios.get(config.api_path + "/package/list");
      setPackages(res.data);
    } catch (e) {
      setLoadError(true);
    }
    setIsLoading(false);
  };

  const choosePackage = (item) => {
    setYourPackage(item);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    try {
      const result = await Swal.fire({
        title: "ยืนยันการสมัครใช้งาน",
        text: `คุณต้องการสมัครแพ็กเกจ ${yourPackage.name} ใช่หรือไม่?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "ยืนยัน",
        cancelButtonText: "ยกเลิก",
      });

      if (result.isConfirmed) {
        setIsSubmitting(true);
        const payload = {
          packageId: yourPackage.id,
          name: name,
          phone: phone,
          pass: pass,
        };

        const res = await axios.post(
          config.api_path + "/package/memberRegister",
          payload,
        );

        if (res.data.message === "success") {
          await Swal.fire({
            title: "สมัครใช้งานสำเร็จ",
            text: "ขอบคุณที่สมัครใช้งานกับเรา",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });

          closeModal();
          navigate("/login", { state: { phone } });
        }
      }
    } catch (err) {
      // ✅ ดักจับ Error แบบละเอียด หน้าจอจะไม่แดง
      const errorMsg =
        getErrorMessage(err);
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: errorMsg,
        icon: "error",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="container mt-5">
        <div className="text-center mb-5">
          <div className="h2 fw-bold text-dark">FoamPos</div>
          <div className="h5 text-muted">Point of Sale on Cloud App</div>
          <div className="mt-3 text-muted">
            มีบัญชีแล้ว? <Link to="/login" className="fw-bold">เข้าสู่ระบบ</Link>
          </div>
        </div>

        {isLoading && <Loading text="กำลังโหลดแพ็กเกจ..." />}
        {!isLoading && loadError && (
          <div className="text-center py-5">
            <i className="fa-solid fa-triangle-exclamation fa-2x text-warning d-block mb-3"></i>
            <div className="fw-bold text-dark">โหลดแพ็กเกจไม่สำเร็จ</div>
            <div className="small text-muted mb-3">เซิร์ฟเวอร์อาจกำลังเริ่มทำงาน รอสักครู่แล้วลองใหม่</div>
            <button className="btn btn-primary rounded-pill px-4" onClick={fetchData}>
              <i className="fa-solid fa-rotate-right me-2"></i>ลองใหม่
            </button>
          </div>
        )}

        <div className="row g-4">
          {packages.map((item) => (
            <div className="col-lg-4 col-md-6" key={item.id}>
              <div className="card h-100 p-4 shadow-sm border-0 rounded-3">
                <div className="card-body d-flex flex-column">
                  <div className="h4 fw-bold text-primary mb-3">
                    {item.name}
                  </div>
                  <div className="display-6 fw-bold mb-3">
                    {Number(item.price).toLocaleString()}
                    <small className="fs-6 text-muted"> THB</small>
                  </div>
                  <div className="text-secondary mb-4 flex-grow-1">
                    <i className="fa-solid fa-check text-success me-2"></i>
                    สูงสุด {Number(item.bill_amount).toLocaleString()} บิล /
                    เดือน
                  </div>
                  <div className="mt-auto">
                    <button
                      onClick={() => choosePackage(item)}
                      data-toggle="modal"
                      data-target="#modalRegister"
                      className="btn btn-primary w-100 rounded-pill py-2 shadow-sm fw-bold"
                    >
                      สมัครแพ็กเกจนี้
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal id="modalRegister" title="สมัครใช้งาน FoamPos">
        <form onSubmit={handleRegister} className="p-2">
          <div className="mb-4 text-center">
            <div
              className="p-4 rounded-4 shadow-sm border border-primary border-opacity-25"
              style={{
                background: "linear-gradient(135deg, var(--color-primary) 0%, #0043a8 100%)",
                color: "#ffffff",
              }}
            >
              <div
                className="text-uppercase small fw-bold opacity-75 mb-1"
                style={{ letterSpacing: "1px" }}
              >
                Selected Plan
              </div>
              <h2 className="fw-black mb-2 text-white">{yourPackage.name}</h2>
              <div className="d-flex justify-content-center align-items-baseline">
                <span className="display-5 fw-bold">
                  {Number(yourPackage.price || 0).toLocaleString()}
                </span>
                <span className="ms-2 opacity-75 fw-bold">THB / MONTH</span>
              </div>
            </div>
          </div>

          <div className="px-1">
            <div className="mb-3">
              <label htmlFor="package-field-1" className="form-label fw-bold text-dark small text-uppercase">
                ชื่อร้านค้าของคุณ
              </label>
              <div className="input-group shadow-sm rounded-3 overflow-hidden">
                <span className="input-group-text bg-white border-end-0 text-primary">
                  <i className="fa-solid fa-shop"></i>
                </span>
                <input id="package-field-1"
                  className="form-control border-start-0 ps-1 py-2 shadow-none"
                  placeholder="เช่น สมชาย คาเฟ่"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="package-field-2" className="form-label fw-bold text-dark small text-uppercase">
                เบอร์โทรศัพท์
              </label>
              <div className="input-group shadow-sm rounded-3 overflow-hidden">
                <span className="input-group-text bg-white border-end-0 text-primary">
                  <i className="fa-solid fa-phone"></i>
                </span>
                <input id="package-field-2"
                  className="form-control border-start-0 ps-1 py-2 shadow-none"
                  type="tel"
                  inputMode="tel"
                  placeholder="08x-xxx-xxxx"
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="package-field-3" className="form-label fw-bold text-dark small text-uppercase">
                ตั้งรหัสผ่านเข้าใช้งาน
              </label>
              <div className="input-group shadow-sm rounded-3 overflow-hidden">
                <span className="input-group-text bg-white border-end-0 text-primary">
                  <i className="fa-solid fa-key"></i>
                </span>
                <input id="package-field-3"
                  type="password"
                  className="form-control border-start-0 ps-1 py-2 shadow-none"
                  placeholder="กำหนดรหัสผ่าน"
                  onChange={(e) => setPass(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-lg d-flex align-items-center justify-content-center border-0 mb-3"
            >
              {isSubmitting ? (
                <><i className="fa-solid fa-spinner fa-spin me-2"></i><span>กำลังสมัคร...</span></>
              ) : (
                <><span>ยืนยันการสมัครสมาชิก</span><i className="fa-solid fa-circle-arrow-right ms-2 fs-5"></i></>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default Package;
