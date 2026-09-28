import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import config from "../config";

// ค้นหาและแบ่งหน้าที่ API (?page=&limit=&q=) · หน้าตาเหมือน usePagedList
// ใช้กับรายการที่โตตามเวลา (เช่นบิลขายหลายปี) ไม่ต้องโหลดทั้งหมดมาไว้ที่หน้าเว็บ
export default function useServerPagedList(path, { pageSize = 20, onError } = {}) {
  const [search, setSearchState] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [pageItems, setPageItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const requestId = useRef(0);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // พิมพ์ค้นหา: รอหยุดพิมพ์ 300ms ค่อยยิง API และกลับไปหน้าแรก
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setIsLoading(true);
    try {
      const res = await axios.get(config.api_path + path, {
        ...config.headers(),
        params: { page, limit: pageSize, q: debounced || undefined },
      });
      if (id !== requestId.current) return; // มีคำขอใหม่กว่าแล้ว ทิ้งผลเก่า
      if (res.data.message === "success") {
        setPageItems(res.data.results || []);
        setTotal(res.data.total || 0);
      }
    } catch (e) {
      if (id === requestId.current && onErrorRef.current) onErrorRef.current(e);
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
  }, [path, page, pageSize, debounced]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // ล้างค่าค้นหาทันที (ทั้งที่พิมพ์และที่ debounce แล้ว)
  const setSearch = (value) => {
    setSearchState(value);
    if (value === "") {
      setDebounced("");
      setPage(1);
    }
  };

  return { search, setSearch, page, setPage, totalPages, total, pageItems, isLoading, reload: load };
}
