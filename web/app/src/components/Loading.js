// สถานะกำลังโหลด ใช้แบบเดียวกันทุกหน้า
function Loading({ text = "กำลังโหลดข้อมูล..." }) {
  return (
    <div className="text-center py-5 text-muted">
      <i className="fa-solid fa-spinner fa-spin fa-2x d-block mb-3 text-primary"></i>
      <div className="small">{text}</div>
    </div>
  );
}

export default Loading;
