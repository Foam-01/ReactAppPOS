// ปิด modal ของ Bootstrap ที่เปิดอยู่ทั้งหมด แล้วล้าง backdrop ที่อาจค้าง
export function closeModal() {
  const btns = document.getElementsByClassName("btnClose");
  for (let i = 0; i < btns.length; i++) btns[i].click();
  clearModalBackdrop();
}

// ล้าง backdrop และ class ที่ Bootstrap ใส่ไว้ตอนเปิด modal (เช่น ตอนเปลี่ยนหน้า)
export function clearModalBackdrop() {
  document.body.classList.remove("modal-open");
  document.body.style.removeProperty("padding-right");
  document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
}
