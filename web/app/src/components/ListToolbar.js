// ไฟล์นี้มีสำเนาเหมือนกันทั้ง web/app และ backoffice/app — แก้ที่หนึ่งต้องแก้ให้เหมือนกันอีกที่
// ช่องค้นหาเหนือตาราง
// props อื่น (เช่น onKeyDown, autoFocus) ส่งต่อให้ input
export function SearchBox({ value, onChange, placeholder = "ค้นหา...", className = "", ...rest }) {
  return (
    <div className={`input-group ${className}`} style={{ maxWidth: "320px" }}>
      <span className="input-group-text bg-white">
        <i className="fa-solid fa-magnifying-glass text-muted"></i>
      </span>
      <input
        type="search"
        className="form-control"
        placeholder={placeholder}
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </div>
  );
}

// ปุ่มเปลี่ยนหน้าใต้ตาราง (ซ่อนเมื่อมีหน้าเดียว)
export function Pagination({ page, totalPages, total, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top small">
      <span className="text-muted">
        หน้า {page} จาก {totalPages} ({total.toLocaleString()} รายการ)
      </span>
      <div className="btn-group">
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <i className="fa-solid fa-chevron-left me-1"></i>ก่อนหน้า
        </button>
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          ถัดไป<i className="fa-solid fa-chevron-right ms-1"></i>
        </button>
      </div>
    </div>
  );
}
