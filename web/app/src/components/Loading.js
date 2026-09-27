// สถานะกำลังโหลด ใช้แบบเดียวกันทุกหน้า
function Loading({ text = "กำลังโหลดข้อมูล..." }) {
  return (
    <div className="text-center py-5 text-muted">
      <div className="mb-3">
        <i className="fa-solid fa-spinner fa-spin fa-2x text-primary"></i>
      </div>
      <div className="small">{text}</div>
    </div>
  );
}

export default Loading;
