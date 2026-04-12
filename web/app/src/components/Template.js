import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { forwardRef, useImperativeHandle, useRef } from "react";

const Template = forwardRef((props, ref) => {
  const templateRef = useRef(null);

  // Expose a method that `Sale.js` calls via `ref`
  useImperativeHandle(ref, () => ({
    refreshConuntBill() {
      // Sidebar exposes `refreshCountBill` (note spelling)
      templateRef.current?.refreshCountBill?.();
    },
  }));

  return (
    <div className="wrapper">
      <Navbar />
      <Sidebar ref={templateRef} />

      <div className="content-wrapper">
        <section className="content pt-3">
          <div className="container-fluid">{props.children}</div>
        </section>
      </div>
    </div>
  );
});

export default Template;
