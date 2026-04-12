import { useState, useEffect } from "react";
import axios from "axios";
import config from "../config";
import Modal from "../components/Modal";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function Package() {
  const [packages, setPackages] = useState([]);
  const [yourPackage, setYourPackage] = useState({});
  const [name, setName] = useState();
  const [phone, setPhone] = useState();
  const [pass, setPass] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await axios
        .get(config.api_path + "/package/list")
        .then((res) => {
          setPackages(res.data);
        })
        .catch((err) => {
          console.log(err.message);
        });
    } catch (e) {
      console.log(e.message);
    }
  };

  const choosePackage = (item) => {
    setYourPackage(item);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      Swal.fire({
        title: "ยืนยันการสมัครใช้งาน",
        text: `คุณต้องการสมัครแพ็กเกจ ${yourPackage.name} ใช่หรือไม่?`,
        icon: "question",
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: "ยืนยัน",
        cancelButtonText: "ยกเลิก",
      }).then((res) => {
        if (res.isConfirmed) {
          const payload = {
            packageId: yourPackage.id,
            name: name,
            phone: phone,
            pass: pass,
          };
          axios
            .post(config.api_path + "/package/memberRegister", payload)
            .then((res) => {
              if (res.data.message === "success") {
                Swal.fire({
                  title: "สมัครใช้งานสำเร็จ",
                  text: "ขอบคุณที่สมัครใช้งานกับเรา",
                  icon: "success",
                  timer: 2000,
                });
                document.getElementById("btnModalclose").click();
                navigate("/login");
              }
            })
            .catch((err) => {
              throw err.response.data;
            });
        }
      });
    } catch (e) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: e.message,
        icon: "error",
      });
    }
  };

  return (
    <>
      <div className="container mt-5">
        <div className="text-center mb-5">
          <div className="h2 fw-bold text-dark">FoamPos</div>
          <div className="h5 text-muted">Point of Sale on Cloud App</div>
        </div>

        <div className="row g-4">
          {" "}
          {/* g-4 ช่วยเว้นระยะห่างระหว่างคอลัมน์ให้เท่ากัน */}
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
                      onClick={(e) => choosePackage(item)}
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

      <Modal id="modalRegister" title="ลงทะเบียนใช้งาน">
        <form onSubmit={handleRegister} className="p-2">
          {/* Header Card: สรุปแพ็กเกจที่เลือก */}
          <div className="mb-4">
            <div className="card border-0 bg-primary bg-opacity-10 rounded-3 shadow-sm">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-primary fw-bold mb-0">
                    แพ็กเกจที่คุณเลือก
                  </div>
                  <div className="h4 mb-0 fw-bold text-dark">
                    {yourPackage.name}
                  </div>
                </div>
                <div className="text-end">
                  <div className="display-6 fw-bold text-primary">
                    {Number(yourPackage.price).toLocaleString()}
                    <small className="fs-6 text-muted ms-1">THB</small>
                  </div>
                  <div className="text-muted small">ต่อเดือน</div>
                </div>
              </div>
            </div>
          </div>

          {/* Input: ชื่อร้าน */}
          <div className="mb-3">
            <label className="form-label fw-bold text-dark">ชื่อร้าน</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="fa fa-store"></i>
              </span>
              <input
                className="form-control border-start-0 ps-0 shadow-none py-2"
                placeholder="ระบุชื่อร้านค้าของคุณ"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Input: เบอร์ติดต่อ */}
          <div className="mb-3">
            <label className="form-label fw-bold text-dark">เบอร์ติดต่อ</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="fa fa-phone"></i>
              </span>
              <input
                className="form-control border-start-0 ps-0 shadow-none py-2"
                placeholder="08x-xxx-xxxx"
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Input: รหัสผ่าน (ปรับให้สวยสู้เพื่อน) */}
          <div className="mb-4">
            <label className="form-label fw-bold text-dark">
              รหัสผ่านสำหรับเข้าสู่ระบบ
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="fa fa-lock"></i>
              </span>
              <input
                type="password"
                className="form-control border-start-0 ps-0 shadow-none py-2"
                placeholder="กำหนดรหัสผ่านของคุณ"
                onChange={(e) => setPass(e.target.value)}
              />
            </div>
          </div>

          {/* Button: ยืนยันการสมัคร */}
          <div className="mt-4">
            <button
              type="submit"
              className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center"
            >
              <span>ยืนยันการสมัครใช้งาน</span>
              <i className="fa fa-arrow-right ms-2"></i>
            </button>
            <p className="text-center text-muted small mt-3">
              โดยการสมัครใช้งาน คุณยอมรับเงื่อนไขการให้บริการของ{" "}
              <span className="text-primary fw-bold">FoamPos</span>
            </p>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default Package;
