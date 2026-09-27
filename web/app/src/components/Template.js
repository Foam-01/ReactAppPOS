import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import config from "../config";
import { clearModalBackdrop } from "../utils/modal";

// ชื่อแท็บเบราว์เซอร์ของแต่ละหน้า
const PAGE_TITLES = {
  "/home": "หน้าหลัก",
  "/sale": "ขายสินค้า",
  "/product": "สินค้า",
  "/user": "ผู้ใช้งานระบบ",
  "/sumsaleperday": "สรุปยอดขายรายวัน",
  "/billsales": "รายงานบิลขาย",
  "/stock": "รับสินค้าเข้าสต็อก",
  "/reportstock": "รายงานสต็อก",
};

const Template = forwardRef((props, ref) => {
  const templateRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const hasToken = !!localStorage.getItem(config.token_name);

  // หน้าที่อยู่ใน Template ต้องเข้าสู่ระบบก่อน
  useEffect(() => {
    if (!hasToken) {
      navigate("/login", { replace: true });
    }
  }, [hasToken, navigate]);

  // เปลี่ยนหน้า (รวมถึงกด Back) ขณะเปิด modal: ล้าง backdrop ที่ค้าง
  useEffect(() => {
    clearModalBackdrop();
    const page = PAGE_TITLES[location.pathname.toLowerCase()];
    document.title = page ? `${page} | FoamPos` : "FoamPos";
  }, [location.pathname]);

  // Expose a method that `Sale.js` calls via `ref`
  useImperativeHandle(ref, () => ({
    refreshConuntBill() {
      // Sidebar exposes `refreshCountBill` (note spelling)
      templateRef.current?.refreshCountBill?.();
    },
  }));

  if (!hasToken) return null;

  return (
    <div className="wrapper">
      <Navbar />
      <Sidebar ref={templateRef} />

      <main className="content-wrapper">
        <section className="content pt-3">
          <div className="container-fluid">{props.children}</div>
        </section>
      </main>
    </div>
  );
});

export default Template;
