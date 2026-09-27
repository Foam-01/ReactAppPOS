// ข้อความเมื่อไม่มีข้อมูล ใช้แบบเดียวกันทุกตาราง
function EmptyState({ icon = "fa-inbox", text, hint }) {
  return (
    <div className="text-center py-5 text-muted">
      <div className="mb-3">
        <i className={`fa-solid ${icon} fa-2x opacity-25`}></i>
      </div>
      <div className="fw-bold text-dark">{text}</div>
      {hint && <div className="small mt-1">{hint}</div>}
    </div>
  );
}

export default EmptyState;
