// ไฟล์นี้มีสำเนาเหมือนกันทั้ง web/app และ backoffice/app — แก้ที่หนึ่งต้องแก้ให้เหมือนกันอีกที่
const NETWORK_ERROR = "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่";
const UNKNOWN_ERROR = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";

// แปลง error จาก axios หรือจาก server ให้เป็นข้อความที่ผู้ใช้อ่านเข้าใจ
export function getErrorMessage(e) {
  if (!e) return UNKNOWN_ERROR;

  if (e.response) {
    const data = e.response.data;
    const message = typeof data === "string" ? data : data?.message;
    return message || UNKNOWN_ERROR;
  }

  // ส่ง request ออกไปแล้วแต่ไม่มีคำตอบ (เน็ตหลุด / server ปิด)
  if (e.request || e.code === "ERR_NETWORK") return NETWORK_ERROR;

  return e.message || UNKNOWN_ERROR;
}
