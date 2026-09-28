import { act, renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import useServerPagedList from "./useServerPagedList";

// mock เฉพาะชั้น HTTP · ตัว hook (debounce, หน้า, ทิ้งผลเก่า) ทำงานจริง
jest.mock("axios", () => ({ get: jest.fn() }));

const reply = (results, total) => Promise.resolve({ data: { message: "success", results, total } });
const lastParams = () => axios.get.mock.calls[axios.get.mock.calls.length - 1][1].params;

beforeEach(() => {
  axios.get.mockReset();
});

test("โหลดหน้าแรก ส่ง page/limit และคำนวณจำนวนหน้าจาก total", async () => {
  axios.get.mockReturnValue(reply([{ id: 1 }], 45));
  const { result } = renderHook(() => useServerPagedList("/billSale/list"));
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(lastParams()).toEqual({ page: 1, limit: 20, q: undefined });
  expect(result.current.total).toBe(45);
  expect(result.current.totalPages).toBe(3);
});

test("พิมพ์ค้นหา: ไม่ยิงระหว่างพิมพ์ รอหยุด 300ms แล้วยิงครั้งเดียวที่หน้าแรก", async () => {
  jest.useFakeTimers();
  try {
    axios.get.mockReturnValue(reply([], 0));
    const { result } = renderHook(() => useServerPagedList("/billSale/list"));
    await act(async () => { jest.advanceTimersByTime(300); });
    act(() => result.current.setPage(2));
    await act(async () => {});
    expect(lastParams().page).toBe(2);
    const calls = axios.get.mock.calls.length;

    act(() => result.current.setSearch("1"));
    await act(async () => { jest.advanceTimersByTime(100); });
    act(() => result.current.setSearch("12"));
    await act(async () => { jest.advanceTimersByTime(299); });
    expect(axios.get.mock.calls.length).toBe(calls);

    await act(async () => { jest.advanceTimersByTime(1); });
    expect(lastParams()).toEqual({ page: 1, limit: 20, q: "12" });
    expect(axios.get.mock.calls.length).toBe(calls + 1);
  } finally {
    jest.useRealTimers();
  }
});

test("ผลของคำขอเก่าที่ตอบช้ากว่า ไม่ทับผลของคำขอใหม่", async () => {
  let resolveOld;
  axios.get
    .mockReturnValueOnce(new Promise((r) => { resolveOld = r; }))
    .mockReturnValue(reply([{ id: "new" }], 1));
  const { result } = renderHook(() => useServerPagedList("/billSale/list"));
  act(() => result.current.setPage(2));
  await waitFor(() => expect(result.current.pageItems).toEqual([{ id: "new" }]));
  await act(async () => resolveOld({ data: { message: "success", results: [{ id: "old" }], total: 9 } }));
  expect(result.current.pageItems).toEqual([{ id: "new" }]);
  expect(result.current.total).toBe(1);
});

test("ล้างค้นหา: ยิงใหม่ทันทีโดยไม่มี q", async () => {
  axios.get.mockReturnValue(reply([], 0));
  const { result } = renderHook(() => useServerPagedList("/billSale/list"));
  act(() => result.current.setSearch("5"));
  await waitFor(() => expect(lastParams().q).toBe("5"));
  act(() => result.current.setSearch(""));
  await waitFor(() => expect(lastParams().q).toBeUndefined());
});

test("error เรียก onError และหยุดสถานะโหลด", async () => {
  const onError = jest.fn();
  axios.get.mockRejectedValue(new Error("down"));
  const { result } = renderHook(() => useServerPagedList("/billSale/list", { onError }));
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(onError).toHaveBeenCalled();
});
