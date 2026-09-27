import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import Swal from "../utils/swal";
import { closeModal } from "../utils/modal";
import { getErrorMessage } from "../utils/error";
import axios from "axios";
import config from "../config";
import { NavLink } from "react-router-dom";
import PackageModal from "./sidebar/PackageModal";
import BankModal from "./sidebar/BankModal";

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
        title: "เกิดข้อผิดพลาด",
        text: getErrorMessage(e),
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
        title: "เกิดข้อผิดพลาด",
        text: getErrorMessage(e),
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
        title: "เกิดข้อผิดพลาด",
        text: getErrorMessage(e),
        icon: "error",
      });
    }
  };

  const renderButton = (item, index) => {
    const isCurrentPackage = packageName === item.name;
    const variant =
      index === 1 ? "pkg-btn-primary" : index === 2 ? "pkg-btn-gold" : "pkg-btn-outline";
    return (
      <button
        type="button"
        data-toggle="modal"
        data-target="#modalBank"
        onClick={() => handleChoosePackage(item)}
        className={`pkg-btn ${isCurrentPackage ? "pkg-btn-current" : variant}`}
        disabled={isCurrentPackage}
      >
        {isCurrentPackage ? (
          <>
            <i className="fa-solid fa-circle-check me-2" aria-hidden="true"></i>
            แพ็กเกจปัจจุบัน
          </>
        ) : (
          <>
            เลือกใช้งาน {item.name}
            <i className="fa-solid fa-arrow-right ms-2" aria-hidden="true"></i>
          </>
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
        title: "เกิดข้อผิดพลาด",
        text: getErrorMessage(e),
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
            timer: 2000,
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
          closeModal();
        }
      })
      .catch((err) => {
        Swal.fire({ title: "เกิดข้อผิดพลาด", text: getErrorMessage(err), icon: "error" });
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
                  style={{ fontSize: "0.75rem", padding: "3px 8px" }}
                >
                  <i className="fa-solid fa-crown me-1" /> {packageName}
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
                    fontSize: "0.75rem",
                    padding: "4px 10px",
                    background:
                      "linear-gradient(90deg, #ffc107 0%, #ffdb6e 100%)",
                    border: "none",
                  }}
                >
                  <i className="fa-solid fa-arrow-up me-1" /> UPGRADE
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
                  style={{ letterSpacing: "0.5px", fontSize: "0.75rem" }}
                >
                  <i className="fa-solid fa-chart-pie me-1 text-warning" /> Bill
                  Limit
                </div>
                <div
                  className="text-white fw-bold"
                  style={{ fontSize: "0.85rem" }}
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
                  style={{ fontSize: "0.75rem" }}
                >
                  <i className="fa-solid fa-exclamation-triangle me-1" />
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
                <NavLink
                  to="/home"
                  className="nav-link rounded-3 px-3 py-2 transition-all"
                >
                  <i className="nav-icon fa-solid fa-th-large me-2" />
                  <p className="d-inline-block m-0 fw-medium">หน้าหลัก</p>
                </NavLink>
              </li>
              <li className="nav-item mb-1">
                <NavLink
                  to="/sale"
                  className="nav-link rounded-3 px-3 py-2 transition-all"
                >
                  <i className="nav-icon fa-solid fa-cash-register me-2" />
                  <p className="d-inline-block m-0 fw-medium">ขายสินค้า</p>
                </NavLink>
              </li>
              <li className="nav-item mb-1">
                <NavLink
                  to="/product"
                  className="nav-link rounded-3 px-3 py-2 transition-all"
                >
                  <i className="nav-icon fa-solid fa-box-open me-2" />
                  <p className="d-inline-block m-0 fw-medium">สินค้า</p>
                </NavLink>
              </li>
              <li className="nav-item mb-1">
                <NavLink
                  to="/user"
                  className="nav-link rounded-3 px-3 py-2 transition-all"
                >
                  <i className="nav-icon fa-solid fa-user-shield me-2" />
                  <p className="d-inline-block m-0 fw-medium">ผู้ใช้งานระบบ</p>
                </NavLink>
              </li>
              <li className="nav-item mb-1">
                <NavLink
                  to="/sumSalePerDay"
                  className="nav-link rounded-3 px-3 py-2 transition-all"
                >
                  <i className="nav-icon fa-solid fa-chart-line me-2" />
                  <p className="d-inline-block m-0 fw-medium">
                    สรุปยอดขายรายวัน
                  </p>
                </NavLink>
              </li>
              <li className="nav-item mb-1">
                <NavLink
                  to="/billSales"
                  className="nav-link rounded-3 px-3 py-2 transition-all"
                >
                  <i className="nav-icon fa-solid fa-file-invoice-dollar me-2" />
                  <p className="d-inline-block m-0 fw-medium">รายงานบิลขาย</p>
                </NavLink>
              </li>
              <li className="nav-item mb-1">
                <NavLink
                  to="/stock"
                  className="nav-link rounded-3 px-3 py-2 transition-all"
                >
                  <i className="nav-icon fa-solid fa-truck-loading me-2" />
                  <p className="d-inline-block m-0 fw-medium">
                    รับสินค้าเข้าสต็อก
                  </p>
                </NavLink>
              </li>
              <li className="nav-item mb-1">
                <NavLink
                  to="/ReportStock"
                  className="nav-link rounded-3 px-3 py-2 transition-all"
                >
                  <i className="nav-icon fa-solid fa-clipboard-list me-2" />
                  <p className="d-inline-block m-0 fw-medium">รายงานสต็อก</p>
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      <PackageModal packages={packages} renderButton={renderButton} packageName={packageName} />

      <BankModal
        banks={banks}
        choosePackage={choosePackage}
        onConfirm={handleChangePackage}
      />
    </>
  );
});

export default Sidebar;
