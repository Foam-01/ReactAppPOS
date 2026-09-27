import { useEffect, useMemo, useState } from "react";

// ค้นหาและแบ่งหน้ารายการฝั่งหน้าเว็บ (ไม่เรียก API เพิ่ม)
// getText(item) คืนข้อความที่ใช้ค้นหาของแต่ละแถว
export default function usePagedList(items, getText, pageSize = 20) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((item) =>
      String(getText(item) || "").toLowerCase().includes(keyword),
    );
    // getText เป็นฟังก์ชันคงที่ของแต่ละหน้า
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  // ค้นหาใหม่หรือข้อมูลเปลี่ยน: กลับไปหน้าแรกถ้าหน้าปัจจุบันเกิน
  useEffect(() => {
    setPage(1);
  }, [search]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  return { search, setSearch, page, setPage, totalPages, filtered, pageItems };
}
