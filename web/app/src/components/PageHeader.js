// ไฟล์นี้มีสำเนาเหมือนกันทั้ง web/app และ backoffice/app — แก้ที่หนึ่งต้องแก้ให้เหมือนกันอีกที่
/*
 * หัวหน้า + แถบตัวกรองมาตรฐาน (ใช้ไฟล์เดียวกันทั้ง web และ backoffice)
 *
 * <PageHeader eyebrow title description count|summary back? actions? actionsNote? />
 *   - eyebrow      "กลุ่ม / หน้า" เช่น "รายงาน / ยอดขายรายวัน"
 *   - description  1 ประโยคบอกว่าหน้านี้ใช้ทำอะไร (ต้องจบใน 1 บรรทัดที่ 1280px)
 *   - count        ป้ายจำนวนอันเดียว เช่น "12 รายการ" (ระหว่างโหลดส่ง "…")
 *   - summary      ป้ายหลายอัน <PageHeaderPill tone=…> ใช้แทน count (≤ 4 ป้าย)
 *   - back         { to, label? } เฉพาะหน้าย่อย ห้ามใส่หน้าแรกของเมนู
 *   - actions      ปุ่มระดับหน้า (รีเฟรช/พิมพ์) ใช้ <FilterBarButton>
 *   - actionsNote  ข้อความเล็กใต้ปุ่ม เช่น "ข้อมูลล่าสุด 11:47"
 *
 * <FilterBar actions={…}>ช่องค้นหา + ตัวกรอง</FilterBar>
 *   - ปุ่มเกี่ยวกับรายการ (เพิ่ม/Export/Import) อยู่ใน actions เท่านั้น
 *   - ปุ่มหลัก 1 ปุ่ม variant="primary" วางขวาสุด
 *   - <FilterBarClear> แสดงเฉพาะเมื่อมีการกรอง
 *
 * tone ของ PageHeaderPill: amber=รอ · blue=กำลังทำ · emerald=เสร็จ · rose=ปัญหา · accent=รวม · muted=อื่น ๆ
 */
import { Link } from "react-router-dom";

export function PageHeader({
  eyebrow,
  title,
  description,
  count,
  summary,
  back,
  actions,
  actionsNote,
}) {
  return (
    <header className="ph">
      <div className="ph-main">
        {back && (
          <Link to={back.to} className="ph-back">
            <i className="fa-solid fa-arrow-left me-1"></i>
            {back.label || "ย้อนกลับ"}
          </Link>
        )}
        {eyebrow && <div className="ph-eyebrow">{eyebrow}</div>}
        <div className="ph-title-row">
          <h1 className="ph-title">{title}</h1>
          {summary
            ? <div className="ph-pills">{summary}</div>
            : count != null && <PageHeaderPill tone="accent">{count}</PageHeaderPill>}
        </div>
        {description && <p className="ph-desc">{description}</p>}
      </div>
      {actions && (
        <div className="ph-actions">
          <div className="ph-actions-row">{actions}</div>
          {actionsNote && <div className="ph-actions-note">{actionsNote}</div>}
        </div>
      )}
    </header>
  );
}

export function PageHeaderPill({ tone = "muted", children }) {
  return <span className={`ph-pill ph-pill-${tone}`}>{children}</span>;
}

export function FilterBar({ actions, children }) {
  return (
    <div className="fb">
      <div className="fb-filters">{children}</div>
      {actions && <div className="fb-actions">{actions}</div>}
    </div>
  );
}

export function FilterBarButton({ variant = "default", icon, className = "", children, ...rest }) {
  return (
    <button
      type="button"
      className={`fb-btn ${variant === "primary" ? "fb-btn-primary" : ""} ${className}`}
      {...rest}
    >
      {icon && <i className={`${icon} ${children ? "me-1" : ""}`}></i>}
      {children}
    </button>
  );
}

export function FilterBarClear({ onClick }) {
  return (
    <button type="button" className="fb-clear" onClick={onClick}>
      <i className="fa-solid fa-xmark me-1"></i>ล้างตัวกรอง
    </button>
  );
}
