import Swal from "sweetalert2";

// ค่าตั้งต้นของ SweetAlert ที่ใช้ทั้งแอป ให้ปุ่มทุก dialog มีสีเดียวกัน
const AppSwal = Swal.mixin({
  confirmButtonColor: "#0d6efd",
  cancelButtonColor: "#64748b",
});

// ใช้กับปุ่มยืนยันของการกระทำที่ย้อนกลับไม่ได้ เช่น ลบ หรือออกจากระบบ
export const DANGER_COLOR = "#dc3545";

export default AppSwal;
