import { act, renderHook } from "@testing-library/react";
import usePagedList from "./usePagedList";

const items = Array.from({ length: 45 }, (_, i) => ({ id: i + 1, name: `สินค้า ${i + 1}` }));
const getText = (x) => x.name;

test("แบ่งหน้าละ 20 และคำนวณจำนวนหน้า", () => {
  const { result } = renderHook(() => usePagedList(items, getText));
  expect(result.current.totalPages).toBe(3);
  expect(result.current.pageItems).toHaveLength(20);
  act(() => result.current.setPage(3));
  expect(result.current.pageItems.map((x) => x.id)).toEqual([41, 42, 43, 44, 45]);
});

test("ค้นหาไม่สนช่องว่างหัวท้าย และกลับไปหน้าแรก", () => {
  const { result } = renderHook(() => usePagedList(items, getText));
  act(() => result.current.setPage(2));
  act(() => result.current.setSearch("  สินค้า 4 "));
  expect(result.current.page).toBe(1);
  expect(result.current.filtered.map((x) => x.id)).toEqual([4, 40, 41, 42, 43, 44, 45]);
});

test("ข้อมูลลดลงจนหน้าปัจจุบันเกิน → ถอยมาหน้าสุดท้าย", () => {
  const { result, rerender } = renderHook(({ list }) => usePagedList(list, getText), {
    initialProps: { list: items },
  });
  act(() => result.current.setPage(3));
  rerender({ list: items.slice(0, 25) });
  expect(result.current.page).toBe(2);
});

test("รายการว่าง: มีอย่างน้อย 1 หน้า", () => {
  const { result } = renderHook(() => usePagedList([], getText));
  expect(result.current.totalPages).toBe(1);
  expect(result.current.pageItems).toEqual([]);
});
