import { useState, useEffect } from "react";
import Template from "./Template";
import { SearchBox } from "../components/ListToolbar";
import { PageHeader, FilterBar, FilterBarClear } from "../components/PageHeader";
import Swal from "../utils/swal";
import { getErrorMessage } from "../utils/error";
import axios from "axios";
import config from "../config";

function ReportMember() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");

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
        text: getErrorMessage(e),
        icon: "error",
        timer: 2000,
      });
    }
  };

  // ค้นหาฝั่งหน้าเว็บจากรายการที่โหลดแล้ว
  const keyword = search.trim().toLowerCase();
  const filtered = keyword
    ? members.filter((item) => `${item.name} ${item.phone} ${item.package?.name}`.toLowerCase().includes(keyword))
    : members;

  return (
    <Template>
      <PageHeader
        eyebrow="รายงาน / สมัครใช้บริการ"
        title="รายชื่อสมาชิก"
        description="รายชื่อร้านค้าที่สมัครใช้บริการพร้อมแพ็กเกจล่าสุด"
        count={`${filtered.length.toLocaleString("th-TH")} ราย`}
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
                {filtered.length > 0 ? (
                  filtered.map((item, index) => (
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
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill">
                            <i className="fa-solid fa-crown me-1 text-warning"></i>{" "}
                            {item.package.name}
                          </span>
                        ) : (
                          <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill fw-normal">
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

    </Template>
  );
}

export default ReportMember;
