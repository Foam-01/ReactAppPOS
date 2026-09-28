import axios from "axios";
import config from "../config";

// เก็บผล API ที่ Sidebar เรียกทุกครั้งที่เปลี่ยนหน้า ไว้ในหน่วยความจำของแท็บนี้
// (ไม่ใช้ localStorage) · ผูกกับ token: ออกจากระบบ/เปลี่ยนบัญชีแล้วไม่ได้ค่าของคนเดิม
// force = true เมื่อรู้ว่าข้อมูลเปลี่ยน (แก้โปรไฟล์ / ปิดการขาย)
const cache = new Map();

const currentToken = () => localStorage.getItem(config.token_name) || "";

const cached = (path) => (force = false) => {
  const key = currentToken() + " " + path;
  if (force || !cache.has(key)) {
    const request = axios.get(config.api_path + path, config.headers()).then((res) => res.data);
    // error ไม่เก็บไว้ เรียกครั้งถัดไปจะลองใหม่
    request.catch(() => cache.delete(key));
    cache.set(key, request);
  }
  return cache.get(key);
};

export const getMemberInfo = cached("/member/info");
export const getCountBill = cached("/package/countBill");
