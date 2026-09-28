import { fireEvent, render, screen } from "@testing-library/react";
import EndSaleModal from "./EndSaleModal";

// modal ของ Bootstrap เป็น aria-hidden จนกว่าจะเปิด จึงค้นแบบ hidden: true

const setup = (props) => {
  const handlers = { setInputMoney: jest.fn(), onEndSale: jest.fn() };
  render(<EndSaleModal totalPrice={150} inputMoney={0} isEndingSale={false} {...handlers} {...props} />);
  return handlers;
};

test("เงินไม่พอ: แสดงยอดค้างชำระ และกดจบการขายไม่ได้", () => {
  setup({ inputMoney: 100 });
  expect(screen.getByText("ยอดค้างชำระ")).toBeInTheDocument();
  expect(screen.getByText("-50.00")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /จบการขาย/, hidden: true })).toBeDisabled();
});

test("จ่ายเกิน: แสดงเงินทอน และกดจบการขายได้", () => {
  const { onEndSale } = setup({ inputMoney: 1000 });
  expect(screen.getByText("เงินทอน")).toBeInTheDocument();
  expect(screen.getByText("850.00")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /จบการขาย/, hidden: true }));
  expect(onEndSale).toHaveBeenCalledTimes(1);
});

test("จ่ายพอดี (boundary): เงินทอน 0 และกดได้", () => {
  setup({ inputMoney: 150 });
  expect(screen.getByText("เงินทอน")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /จบการขาย/, hidden: true })).toBeEnabled();
});

test("ปุ่มจ่ายพอดีใส่ยอดรวมให้", () => {
  const { setInputMoney } = setup();
  fireEvent.click(screen.getByRole("button", { name: /จ่ายพอดี/, hidden: true }));
  expect(setInputMoney).toHaveBeenCalledWith(150);
});

test("ระหว่างบันทึก: ปุ่มถูกปิด กันกดซ้ำ", () => {
  setup({ inputMoney: 1000, isEndingSale: true });
  expect(screen.getByRole("button", { name: /กำลังบันทึก/, hidden: true })).toBeDisabled();
});
