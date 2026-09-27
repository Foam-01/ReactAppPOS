// ข้อความเมื่อไม่มีข้อมูล ใช้แบบเดียวกันทุกตาราง
function EmptyState({ icon = "fa-inbox", text, hint }) {
  return (
    <div className="text-center py-5 text-muted">
      <i className={`fa-solid ${icon} fa-2x d-block mb-3 opacity-25`}></i>
      <div className="fw-bold text-dark">{text}</div>
      {hint && <div className="small mt-1">{hint}</div>}
    </div>
  );
}

export default EmptyState;
