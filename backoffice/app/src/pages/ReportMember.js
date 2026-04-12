import { useState, useEffect } from "react";
import Template from "./Template";
import Swal from "sweetalert2";
import axios from "axios";
import config from "../config";

function ReportMember() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        config.api_path + "/member/list",
        config.headers(),
      );

      if (res.data.message === "success") {
        // ดึงข้อมูลจาก results ตามโครงสร้าง JSON จริง
        setMembers(res.data.results || []);
      }
    } catch (e) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: e.message,
        icon: "error",
        timer: 3000,
      });
    }
  };

  return (
    <Template>
      <div className="card border-0 rounded-4 shadow-custom overflow-hidden">
        {/* Card Header แบบมีรายละเอียดและมีมิติ */}
        <div className="card-header bg-white py-4 border-0 d-flex align-items-center">
          <div
            className="bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center rounded-circle me-3"
            style={{ width: "50px", height: "50px" }}
          >
            <i className="fa-solid fa-users fs-5"></i>
          </div>
          <div>
            <h5
              className="mb-1 fw-bold text-dark"
              style={{ letterSpacing: "0.5px" }}
            >
              รายงานคนที่สมัครใช้บริการ
            </h5>
            <small className="text-muted fw-medium">
              รายชื่อสมาชิกและข้อมูลแพ็กเกจล่าสุดในระบบ
            </small>
          </div>
        </div>

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
                    ชื่อ - นามสกุล
                  </th>
                  <th
                    className="py-3 text-secondary fw-bold text-uppercase"
                    style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                  >
                    เบอร์โทร
                  </th>
                  <th
                    className="py-3 text-secondary fw-bold text-uppercase"
                    style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                  >
                    วันที่สมัคร
                  </th>
                  <th
                    className="pe-4 py-3 text-secondary fw-bold text-uppercase text-end"
                    style={{ fontSize: "0.85rem", letterSpacing: "1px" }}
                  >
                    แพ็กเกจ
                  </th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {members?.length > 0 ? (
                  members.map((item, index) => (
                    <tr key={index}>
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center">
                          {/* เพิ่มไอคอนประจำตัวสมาชิก */}
                          <div
                            className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm border"
                            style={{ width: "40px", height: "40px" }}
                          >
                            <i className="fa-regular fa-user text-secondary"></i>
                          </div>
                          <div className="fw-bold text-dark">{item.name}</div>
                        </div>
                      </td>
                      <td className="py-3 fw-medium text-secondary">
                        <i className="fa-solid fa-phone-alt me-2 small opacity-50"></i>
                        {item.phone}
                      </td>
                      <td className="py-3 text-secondary">
                        <i className="fa-regular fa-calendar-alt me-2 small opacity-50"></i>
                        {/* ปรับฟอร์แมตวันที่ให้สวยขึ้น เช่น 6 เม.ย. 2569 */}
                        {new Date(item.createdAt).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="pe-4 py-3 text-end">
                        {item.package?.name ? (
                          <span className="badge bg-gradient-primary px-3 py-2 rounded-pill shadow-sm">
                            <i className="fa-solid fa-crown me-1 text-warning"></i>{" "}
                            {item.package.name}
                          </span>
                        ) : (
                          <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill">
                            ไม่มีแพ็กเกจ
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <div className="py-4">
                        <div
                          className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm"
                          style={{ width: "80px", height: "80px" }}
                        >
                          <i className="fa-solid fa-inbox fs-1 text-muted opacity-50"></i>
                        </div>
                        <h6 className="text-dark fw-bold mb-1">
                          ยังไม่มีข้อมูลสมาชิก
                        </h6>
                        <p className="text-muted small mb-0">
                          ผู้ที่สมัครใช้บริการจะแสดงอยู่ในตารางนี้
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

      <style>{`
        /* เงาของการ์ดให้ดูมีมิติ ฟุ้งๆ สไตล์แอปยุคใหม่ */
        .shadow-custom {
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08) !important;
        }

        /* ตกแต่งแถวตารางให้ดูสะอาดตา */
        .custom-table td {
          border-bottom: 1px solid #f1f5f9;
        }

        /* เอฟเฟกต์ตอนเอาเมาส์ชี้ แถวจะลอยขึ้นมานิดนึงและเปลี่ยนสีพื้นหลัง */
        .custom-table tbody tr {
          transition: all 0.3s ease;
        }
        .custom-table tbody tr:hover {
          background-color: #f8faff;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          position: relative;
          z-index: 1;
        }

        /* ป้ายแพ็กเกจแบบไล่สี (Gradient) ให้ดูพรีเมียม */
        .bg-gradient-primary {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          color: white;
          font-weight: 600;
          letter-spacing: 0.5px;
          border: none;
        }
      `}</style>
    </Template>
  );
}

export default ReportMember;
