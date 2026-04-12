import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import config from "../config";
import { Link } from "react-router-dom";
import Modal from "./Modal";

const Sidebar = forwardRef((props, ref) => {
  const [memberName, setMemberName] = useState();
  const [packageName, setPackageName] = useState();
  const [packages, setPackages] = useState([]);
  const [totalBill, setTotalBill] = useState(0);
  const [billAmount, setBillAmount] = useState(0);
  const [banks, setBanks] = useState([]);
  const [choosePackage, setChoosePackage] = useState({});

  useEffect(() => {
    fetchData();
    fetchDetaTotalBill();
  }, []);

  useEffect(() => {
    const syncMember = () => {
      fetchData();
    };
    window.addEventListener("pos-member-updated", syncMember);
    return () => window.removeEventListener("pos-member-updated", syncMember);
  }, []);

  const fetchDetaTotalBill = async () => {
    try {
      const res = await axios.get(
        config.api_path + "/package/countBill",
        config.headers(),
      );
      if (res.data.totalBill !== undefined) {
        setTotalBill(res.data.totalBill);
      }
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(
        config.api_path + "/member/info",
        config.headers(),
      );
      if (res.data.message === "success") {
        setMemberName(res.data.result.name);
        setPackageName(res.data.result.package.name);
        setBillAmount(res.data.result.package.bill_amount);
      }
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await axios.get(
        config.api_path + "/package/list",
        config.headers(),
      );
      if (res.data && res.data.length > 0) {
        setPackages(res.data);
      }
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const renderButton = (item, index) => {
    const isCurrentPackage = packageName === item.name;
    return (
      <button
        type="button"
        data-toggle="modal"
        data-target="#modalBank"
        onClick={() => handleChoosePackage(item)}
        className={`btn w-100 rounded-pill py-2 fw-bold text-nowrap px-1 
          ${index === 1 ? "btn-primary shadow-sm" : "btn-outline-primary"} 
          ${isCurrentPackage ? "disabled opacity-50" : ""}`}
        style={{ fontSize: "0.85rem" }}
        disabled={isCurrentPackage}
      >
        {isCurrentPackage ? (
          <span>
            <i className="fa fa-check me-1"></i> แพ็กเกจปัจจุบัน
          </span>
        ) : (
          `เลือกใช้งาน ${item.name}`
        )}
      </button>
    );
  };

  const handleChoosePackage = (item) => {
    setChoosePackage(item);
    fetchDataBank();
  };

  const fetchDataBank = async () => {
    if (banks.length !== 0) return;
    try {
      const res = await axios.get(
        config.api_path + "/bank/list",
        config.headers(),
      );
      if (res.data.message === "success") {
        setBanks(res.data.results);
      }
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const handleChangePackage = () => {
    axios
      .get(
        config.api_path + "/package/changePackage/" + choosePackage.id,
        config.headers(),
      )
      .then((res) => {
        if (res.data.message === "success") {
          const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener("mouseenter", Swal.stopTimer);
              toast.addEventListener("mouseleave", Swal.resumeTimer);
            },
          });
          Toast.fire({
            icon: "success",
            title: "ส่งข้อมูลการขอเปลี่ยนแพ็กเกจแล้ว",
          });
          const btns = document.getElementsByClassName("btnClose");
          for (let i = 0; i < btns.length; i++) btns[i].click();
        }
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          "คำขอล้มเหลว";
        Swal.fire({ title: "error", text: String(msg), icon: "error" });
      });
  };

  useImperativeHandle(ref, () => ({
    refreshCountBill() {
      fetchDetaTotalBill();
    },
  }));

  const percent =
    billAmount > 0 ? Math.min((totalBill / billAmount) * 100, 100) : 0;

  return (
    <>
      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        <a href="#top" className="brand-link text-decoration-none">
          <img
            src="dist/img/AdminLTELogo.png"
            alt="AdminLTE Logo"
            className="brand-image img-circle elevation-3"
            style={{ opacity: 0.8 }}
          />
          <span className="brand-text font-weight-light">POS ON Cloud</span>
        </a>

        <div className="sidebar px-2">
          <div
            className="user-panel mt-3 pb-3 mb-4 d-flex align-items-center rounded-4 shadow-sm"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "12px",
            }}
          >
            <div className="image position-relative">
              <img
                src="dist/img/user2-160x160.jpg"
                className="img-circle border border-2 border-warning shadow-sm"
                alt="User"
                style={{ width: "45px", height: "45px", objectFit: "cover" }}
              />
              <span
                className="position-absolute border border-white rounded-circle bg-success"
                style={{
                  width: "10px",
                  height: "10px",
                  bottom: "2px",
                  right: "2px",
                }}
              />
            </div>
            <div className="info ms-3 overflow-hidden">
              <div
                className="fw-bold text-white text-truncate"
                style={{ fontSize: "0.95rem", letterSpacing: "0.3px" }}
              >
                {memberName || "User Name"}
              </div>
              <div className="d-flex align-items-center mt-1">
                <span
                  className="badge bg-warning text-dark fw-bold rounded-pill shadow-sm"
                  style={{ fontSize: "0.65rem", padding: "3px 8px" }}
                >
                  <i className="fa fa-crown me-1" /> {packageName}
                </span>
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={fetchPackages}
                  data-toggle="modal"
                  data-target="#modalPackage"
                  className="btn btn-warning btn-xs w-100 fw-bold rounded-pill shadow-sm"
                  style={{
                    fontSize: "0.7rem",
                    padding: "4px 10px",
                    background:
                      "linear-gradient(90deg, #ffc107 0%, #ffdb6e 100%)",
                    border: "none",
                  }}
                >
                  <i className="fa fa-arrow-up me-1" /> UPGRADE
                </button>
              </div>
            </div>
          </div>

          <div className="px-3 mb-4">
            <div
              className="p-3 rounded-4 shadow-sm"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(5px)",
              }}
            >
              <div className="d-flex justify-content-between align-items-end mb-2">
                <div
                  className="text-white-50 small fw-bold text-uppercase"
                  style={{ letterSpacing: "0.5px", fontSize: "0.7rem" }}
                >
                  <i className="fas fa-chart-pie me-1 text-warning" /> Bill
                  Limit
                </div>
                <div
                  className="text-white fw-bold"
                  style={{ fontSize: "0.9rem" }}
                >
                  {totalBill || 0}{" "}
                  <span
                    className="text-white-50"
                    style={{ fontSize: "0.75rem" }}
                  >
                    / {(billAmount || 0).toLocaleString("th-TH")}
                  </span>
                </div>
              </div>
              <div
                className="progress rounded-pill bg-dark shadow-inset"
                style={{ height: "10px", background: "rgba(0,0,0,0.3)" }}
              >
                <div
                  className={`progress-bar progress-bar-striped progress-bar-animated rounded-pill shadow-sm ${
                    percent >= 80 ? "bg-danger" : ""
                  }`}
                  role="progressbar"
                  style={{
                    width: `${percent}%`,
                    background:
                      percent < 80
                        ? "linear-gradient(90deg, #ffc107 0%, #ff8c00 100%)"
                        : "",
                    transition: "width 1s ease-in-out",
                  }}
                />
              </div>
              {percent >= 80 && (
                <div
                  className="mt-2 text-center text-danger fw-bold"
                  style={{ fontSize: "0.65rem" }}
                >
                  <i className="fas fa-exclamation-triangle me-1" />
                  ใกล้ครบกำหนด {(billAmount || 0).toLocaleString("th-TH")}{" "}
                  บิลแล้ว
                </div>
              )}
            </div>
          </div>

          <nav className="mt-2">
            <ul
              className="nav nav-pills nav-sidebar flex-column"
              data-widget="treeview"
              role="menu"
            >
              <li className="nav-item mb-1">
                <Link
                  to="/home"
                  className="nav-link rounded-3 px-3 py-2 transition-all"
                >
                  <i className="nav-icon fas fa-th-large me-2" />
                  <p className="d-inline-block m-0 fw-medium">หน้าหลัก</p>
                </Link>
              </li>
              <li className="nav-item mb-1">
                <Link
                  to="/sale"
                  className="nav-link rounded-3 px-3 py-2 transition-all"
                >
                  <i className="nav-icon fas fa-cash-register me-2" />
                  <p className="d-inline-block m-0 fw-medium">ขายสินค้า</p>
                </Link>
              </li>
              <li className="nav-item mb-1">
                <Link
                  to="/product"
                  className="nav-link rounded-3 px-3 py-2 transition-all"
                >
                  <i className="nav-icon fas fa-box-open me-2" />
                  <p className="d-inline-block m-0 fw-medium">สินค้า</p>
                </Link>
              </li>
              <li className="nav-item mb-1">
                <Link
                  to="/user"
                  className="nav-link rounded-3 px-3 py-2 transition-all"
                >
                  <i className="nav-icon fas fa-user-shield me-2" />
                  <p className="d-inline-block m-0 fw-medium">ผู้ใช้งานระบบ</p>
                </Link>
              </li>
              <li className="nav-item mb-1">
                <Link
                  to="/sumSalePerDay"
                  className="nav-link rounded-3 px-3 py-2 transition-all"
                >
                  <i className="nav-icon fas fa-chart-line me-2" />
                  <p className="d-inline-block m-0 fw-medium">
                    สรุปยอดขายรายวัน
                  </p>
                </Link>
              </li>
              <li className="nav-item mb-1">
                <Link
                  to="/billSales"
                  className="nav-link rounded-3 px-3 py-2 transition-all"
                >
                  <i className="nav-icon fas fa-file-invoice-dollar me-2" />
                  <p className="d-inline-block m-0 fw-medium">รายงานบิลขาย</p>
                </Link>
              </li>
              <li className="nav-item mb-1">
                <Link
                  to="/stock"
                  className="nav-link rounded-3 px-3 py-2 transition-all"
                >
                  <i className="nav-icon fas fa-truck-loading me-2" />
                  <p className="d-inline-block m-0 fw-medium">
                    รับสินค้าเข้า Stock
                  </p>
                </Link>
              </li>
              <li className="nav-item mb-1">
                <Link
                  to="/ReportStock"
                  className="nav-link rounded-3 px-3 py-2 transition-all"
                >
                  <i className="nav-icon fas fa-clipboard-list me-2" />
                  <p className="d-inline-block m-0 fw-medium">รายงาน Stock</p>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      <Modal
        id="modalPackage"
        title="✨ อัปเกรดแพ็กเกจของคุณ"
        modalSize="modal-lg"
      >
        {/* ล็อกความสูงไว้ที่ 80vh และเปิดให้ Scroll ได้ (overflow-auto) แก้ปัญหาล้นจอ */}
        <div
          className="bg-light p-3 p-md-4 rounded-bottom-4 overflow-auto custom-scrollbar"
          style={{ maxHeight: "80vh", overflowX: "hidden" }}
        >
          <div className="text-center mb-4 mt-1">
            <h4 className="fw-bolder text-dark mb-1">
              เลือกแพ็กเกจที่เหมาะกับธุรกิจคุณ
            </h4>
            <p className="text-muted small">
              ปลดล็อกฟีเจอร์ทั้งหมด เพื่อเพิ่มยอดขายและลดเวลาการทำงาน
            </p>
          </div>

          <div className="row g-3 justify-content-center align-items-stretch pb-2">
            {packages.length > 0 ? (
              packages.map((item, index) => {
                const isPopular = index === 1; // ตัวกลาง (Pro)
                const isPremium = index === 2; // ตัวท็อป (Enterprise/VIP)

                // กำหนดสีของการ์ด
                let cardClass = "bg-white border-0 shadow-sm";
                let headerColor = "text-primary";
                if (isPopular) {
                  cardClass =
                    "bg-white border-primary shadow-lg package-popular";
                } else if (isPremium) {
                  cardClass = "bg-dark text-white border-0 shadow-lg";
                  headerColor = "text-warning";
                }

                // ฟีเจอร์ (จัดจำนวนให้พอดี ไม่ยาวเกินไป)
                const features = [
                  {
                    text: `สร้างบิลสูงสุด ${Number(item.bill_amount).toLocaleString()} บิล/เดือน`,
                    included: true,
                  },
                  { text: "ระบบจัดการสต็อกสินค้าพื้นฐาน", included: true },
                  { text: "รายงานสรุปยอดขายรายวัน", included: true },
                  { text: "รองรับการใช้งานหลายสาขา", included: index >= 1 },
                  { text: "เพิ่มพนักงานได้ไม่จำกัด", included: index >= 1 },
                  { text: "รายงานสถิติขั้นสูงเชิงลึก", included: index >= 2 },
                  {
                    text: "ผู้ช่วยส่วนตัว (VIP Support)",
                    included: index >= 2,
                  },
                ];

                return (
                  <div
                    className={`col-lg-4 col-md-6 ${isPopular ? "z-3" : "z-1"}`}
                    key={item.id || index}
                  >
                    <div
                      className={`card h-100 rounded-4 overflow-hidden transition-all package-card ${cardClass}`}
                      style={{ borderWidth: isPopular ? "2px" : "0" }}
                    >
                      {/* ป้าย Recommended สำหรับตัวกลาง */}
                      {isPopular && (
                        <div
                          className="bg-primary text-white text-center py-1 fw-bold text-uppercase tracking-widest"
                          style={{ fontSize: "0.7rem" }}
                        >
                          ★ Most Popular
                        </div>
                      )}

                      <div className="card-body p-3 p-xl-4 d-flex flex-column">
                        <div className="text-center mb-3 border-bottom pb-3 border-opacity-25">
                          <h6
                            className={`fw-bold text-uppercase mb-2 ${headerColor}`}
                            style={{ letterSpacing: "1px" }}
                          >
                            {item.name}
                          </h6>
                          {/* จัดระเบียบตัวเลขและสัญลักษณ์ ฿ ให้อยู่ในระนาบเดียวกัน */}
                          <div className="d-flex justify-content-center align-items-baseline">
                            <span className="fs-6 me-1 text-muted fw-bold">
                              ฿
                            </span>
                            <span
                              className={`display-6 fw-bolder ${isPremium ? "text-white" : "text-dark"}`}
                              style={{ letterSpacing: "-1px" }}
                            >
                              {Number(item.price).toLocaleString()}
                            </span>
                            <span className="text-muted ms-1 small">
                              /เดือน
                            </span>
                          </div>
                        </div>

                        {/* รายการสิทธิประโยชน์ (ลด Margin เพื่อให้กระชับขึ้น ไม่ล้นจอ) */}
                        <ul className="list-unstyled flex-grow-1 mb-4">
                          {features.map((feature, fIndex) => (
                            <li
                              className="mb-2 d-flex align-items-start"
                              key={fIndex}
                            >
                              {feature.included ? (
                                <div
                                  className={`rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0 ${isPremium ? "bg-warning text-dark" : "bg-success bg-opacity-10 text-success"}`}
                                  style={{
                                    width: "18px",
                                    height: "18px",
                                    marginTop: "3px",
                                  }}
                                >
                                  <i
                                    className="fa-solid fa-check"
                                    style={{ fontSize: "9px" }}
                                  ></i>
                                </div>
                              ) : (
                                <div
                                  className="rounded-circle bg-secondary bg-opacity-10 text-secondary d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                                  style={{
                                    width: "18px",
                                    height: "18px",
                                    marginTop: "3px",
                                  }}
                                >
                                  <i
                                    
                                    className="fa-solid fa-times"
                                    style={{ fontSize: "9px" }}
                                  ></i>
                                </div>
                              )}
                              <span
                                className={`small ${feature.included ? (isPremium ? "text-white opacity-100" : "text-dark fw-medium") : "text-muted text-decoration-line-through opacity-50"}`}
                                style={{
                                  fontSize: "0.85rem",
                                  lineHeight: "1.4",
                                }}
                              >
                                {feature.text}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {/* ปุ่มเลือกแพ็กเกจ ดันไว้ล่างสุดเสมอ */}
                        <div className="mt-auto">
                          {renderButton(item, index)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-5 w-100">
                <div
                  className="spinner-border text-primary mb-3"
                  role="status"
                />
                <div className="text-muted">
                  กำลังดึงข้อมูลแพ็กเกจที่ดีที่สุดสำหรับคุณ...
                </div>
              </div>
            )}
          </div>
        </div>

        <style>{`
          .tracking-widest { letter-spacing: 2px; }
          .transition-all { transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
          
          /* ขยายการ์ดตัวยอดนิยมให้ใหญ่ขึ้นนิดนึงในจอคอม */
          @media (min-width: 992px) {
            .package-popular { transform: scale(1.03); }
            .package-popular:hover { transform: scale(1.05) translateY(-5px) !important; }
          }
          
          /* เอฟเฟกต์ตอนเอาเมาส์ชี้ */
          .package-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }
          
          /* ตกแต่ง Scrollbar ให้ดูคลีน */
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        `}</style>
      </Modal>

      <Modal id="modalBank" title="💳 ชำระค่าบริการ" modalSize="modal-md">
        <div className="d-flex flex-column" style={{ maxHeight: "85vh" }}>
          {/* 1. ส่วนหัว: สรุปยอดชำระ (ติดหนึบด้านบน) */}
          <div
            className="p-4 border-bottom text-center"
            style={{ backgroundColor: "#f8f9fc" }}
          >
            <span
              className="badge bg-dark px-3 py-1 mb-3 rounded-pill fw-normal"
              style={{ letterSpacing: "1px" }}
            >
              แพ็กเกจ {choosePackage?.name}
            </span>
            <div className="text-muted small fw-bold mb-1">
              ยอดที่ต้องชำระทั้งสิ้น
            </div>
            <h1
              className="display-4 fw-bolder mb-0 text-primary"
              style={{ letterSpacing: "-1px" }}
            >
              {Number(choosePackage?.price || 0).toLocaleString("th-TH", {
                minimumFractionDigits: 2,
              })}
              <span className="fs-5 text-muted fw-normal ms-2">THB</span>
            </h1>
          </div>

          {/* 2. ส่วนเนื้อหา: เลื่อนได้ (Scrollable) แก้ปัญหาล้นจอ */}
          <div
            className="p-4 overflow-auto custom-scrollbar flex-grow-1"
            style={{ backgroundColor: "#ffffff" }}
          >
            <h6 className="fw-bold mb-3 text-dark d-flex align-items-center">
              <i className="fa-solid fa-building-columns text-muted me-2"></i>{" "}
              เลือกโอนเงินผ่านบัญชี
            </h6>

            {banks.length > 0 ? (
              banks.map((item, index) => {
                // ดึงสีแบรนด์ธนาคารของจริง
                const type = (
                  item.bankType ||
                  item.bankName ||
                  ""
                ).toLowerCase();
                let bankBg = "#64748b";
                let bankText = "BANK";
                let textColor = "#fff";

                if (type.includes("กสิกร") || type.includes("kbank")) {
                  bankBg = "#00A950";
                  bankText = "KBANK";
                } else if (type.includes("กรุงไทย") || type.includes("ktb")) {
                  bankBg = "#00AEEF";
                  bankText = "KTB";
                } else if (type.includes("พาณิชย์") || type.includes("scb")) {
                  bankBg = "#4E2A84";
                  bankText = "SCB";
                } else if (type.includes("กรุงเทพ") || type.includes("bbl")) {
                  bankBg = "#1E4598";
                  bankText = "BBL";
                } else if (type.includes("ออมสิน") || type.includes("gsb")) {
                  bankBg = "#EB198D";
                  bankText = "GSB";
                } else if (type.includes("กรุงศรี") || type.includes("bay")) {
                  bankBg = "#FEC43B";
                  bankText = "BAY";
                  textColor = "#333";
                }

                return (
                  <div
                    className="mb-3 rounded-4 border bank-card position-relative overflow-hidden"
                    key={index}
                    style={{ borderColor: "#e2e8f0" }}
                  >
                    {/* แถบสีธนาคารด้านซ้าย */}
                    <div
                      className="position-absolute top-0 start-0 h-100"
                      style={{ width: "4px", backgroundColor: bankBg }}
                    ></div>

                    <div className="p-3 ms-2">
                      <div className="d-flex align-items-center mb-3">
                        {/* โลโก้ธนาคารแบบ Professional */}
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center shadow-sm border border-light"
                          style={{
                            width: "45px",
                            height: "45px",
                            minWidth: "45px",
                            backgroundColor: bankBg,
                            color: textColor,
                          }}
                        >
                          <span
                            className="fw-bold"
                            style={{
                              fontSize: "0.75rem",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {bankText}
                          </span>
                        </div>

                        <div className="ms-3 flex-grow-1">
                          <div
                            className="fw-bold text-dark"
                            style={{ fontSize: "1rem" }}
                          >
                            {item.bankType || item.bankName}
                          </div>
                          <div
                            className="text-muted"
                            style={{ fontSize: "0.85rem" }}
                          >
                            {item.accountName || "สิทธิเดช ทองสว่าง"}
                          </div>
                        </div>
                      </div>

                      {/* เลขบัญชี & ปุ่มคัดลอก (ดีไซน์สมจริง) */}
                      <div className="d-flex justify-content-between align-items-center bg-light rounded-3 p-2 border border-white">
                        <div
                          className="fs-5 fw-bold text-dark font-monospace ps-2"
                          style={{ letterSpacing: "1.5px" }}
                        >
                          {item.bankCode}
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-bold bg-white"
                          onClick={() => {
                            navigator.clipboard.writeText(item.bankCode);
                            Swal.fire({
                              title: "คัดลอกสำเร็จ",
                              text: `คัดลอกเลขบัญชี ${bankText} แล้ว`,
                              icon: "success",
                              timer: 1500,
                              showConfirmButton: false,
                              toast: true,
                              position: "top",
                            });
                          }}
                        >
                          <i className="fa-regular fa-copy me-1" /> คัดลอก
                        </button>
                      </div>
                      {item.bankBranch && (
                        <div
                          className="text-end text-muted mt-1 pe-1"
                          style={{ fontSize: "0.75rem" }}
                        >
                          สาขา {item.bankBranch}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-5 text-muted">
                <div className="spinner-border spinner-border-sm text-primary mb-2"></div>
                <div>กำลังโหลดข้อมูลธนาคาร...</div>
              </div>
            )}

            {/* 3. กล่องแจ้งโอนเงิน LINE (รวมอยู่ในส่วนที่ Scroll ได้) */}
            <a
              href="https://line.me/ti/p/~F_Yui.01"
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none d-block mt-4 mb-2"
            >
              <div
                className="rounded-4 p-3 d-flex align-items-center line-action-box"
                style={{
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center bg-white shadow-sm"
                  style={{ width: "46px", height: "46px", minWidth: "46px" }}
                >
                  <i
                    className="fa-brands fa-line fs-2"
                    style={{ color: "#00C300" }}
                  ></i>
                </div>
                <div className="ms-3 flex-grow-1">
                  <div
                    className="fw-bold"
                    style={{ color: "#166534", fontSize: "1rem" }}
                  >
                    แจ้งโอนเงิน / ส่งสลิป
                  </div>
                  <div
                    className="small"
                    style={{ color: "#15803d", opacity: 0.85 }}
                  >
                    ส่งสลิปยืนยันการโอนเงินที่นี่
                  </div>
                </div>
                <div
                  className="text-white bg-success rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: "28px", height: "28px" }}
                >
                  <i
                    className="fa-solid fa-chevron-right"
                    style={{ fontSize: "0.8rem" }}
                  ></i>
                </div>
              </div>
            </a>
          </div>

          {/* 4. ส่วนท้าย: ปุ่มยืนยัน (ติดหนึบด้านล่างเสมอ) */}
          <div
            className="p-3 border-top"
            style={{ backgroundColor: "#f8f9fc" }}
          >
            <button
              type="button"
              onClick={handleChangePackage}
              className="btn btn-dark btn-lg w-100 rounded-pill py-3 fw-bold shadow-sm submit-btn"
              disabled={!choosePackage || banks.length === 0}
              style={{
                backgroundColor: "#1e293b",
                border: "none",
                fontSize: "1.1rem",
              }}
            >
              ยืนยันการสมัครสมาชิก
            </button>
          </div>
        </div>

        <style>{`
          /* ซ่อน Scrollbar เริ่มต้นของ Modal ตัวนอกเพื่อไม่ให้ซ้อนกัน */
          #modalBank .modal-body { padding: 0 !important; }
          
          /* ตกแต่ง Scrollbar ด้านในให้ดูคลีน (Mac/iOS style) */
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
          
          /* เอฟเฟกต์ต่างๆ */
          .bank-card { transition: all 0.2s ease; background-color: #fff; }
          .bank-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-color: #cbd5e1 !important; }
          .line-action-box { transition: all 0.2s ease; }
          .line-action-box:hover { background-color: #dcfce7 !important; border-color: #86efac !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(22, 101, 52, 0.08); }
          .submit-btn { transition: all 0.2s ease; }
          .submit-btn:hover { background-color: #0f172a !important; transform: translateY(-2px); box-shadow: 0 8px 15px rgba(0,0,0,0.1) !important; }
          .submit-btn:active { transform: scale(0.98); }
        `}</style>
      </Modal>
    </>
  );
});

export default Sidebar;
