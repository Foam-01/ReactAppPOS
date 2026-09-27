import Modal from "../../components/Modal";

// แก้จำนวนสินค้าในบิล
function QtyModal({ item, setItem, onSave }) {
  return (
    <Modal id="modalQty" title="แก้ไขจำนวน" modalSize="modal-sm">
      <div className="p-3 p-md-4">
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-3"
            style={{ width: "60px", height: "60px" }}
          >
            <i className="fa-solid fa-calculator fa-2x"></i>
          </div>
          <h6 className="fw-bold mb-1">ระบุจำนวนสินค้า</h6>
          <p className="text-muted small">ระบุจำนวนที่ต้องการบันทึกลงในบิล</p>
        </div>

        {/* กล่อง Input: สร้างใหม่ด้วย Flexbox ให้อยู่กึ่งกลาง 100% */}
        <div className="d-flex justify-content-center mb-4 pb-2">
          <div
            className="d-flex align-items-center bg-light rounded-pill border shadow-sm overflow-hidden"
            style={{ width: "180px", height: "55px" }} // ล็อคความกว้าง-สูง ให้สมมาตร
          >
            {/* ปุ่มลบ (กว้าง 25%) */}
            <button
              type="button"
              className="btn btn-light border-0 d-flex align-items-center justify-content-center h-100"
              style={{ width: "25%", backgroundColor: "transparent" }}
              onClick={() =>
                setItem({
                  ...item,
                  qty: Math.max(1, parseInt(item.qty || 0) - 1),
                })
              }
            >
              <i className="fa-solid fa-minus text-danger fs-5"></i>
            </button>

            {/* ช่องตัวเลข (กว้าง 50%) */}
            <input
              type="number"
              className="form-control border-0 text-center fw-bolder h-100 px-0 hide-arrows"
              style={{
                width: "50%",
                backgroundColor: "transparent",
                fontSize: "1.8rem",
                boxShadow: "none",
              }}
              value={item.qty || ""}
              onChange={(e) => setItem({ ...item, qty: e.target.value })}
            />

            {/* ปุ่มบวก (กว้าง 25%) */}
            <button
              type="button"
              className="btn btn-light border-0 d-flex align-items-center justify-content-center h-100"
              style={{ width: "25%", backgroundColor: "transparent" }}
              onClick={() =>
                setItem({ ...item, qty: parseInt(item.qty || 0) + 1 })
              }
            >
              <i className="fa-solid fa-plus text-success fs-5"></i>
            </button>
          </div>
        </div>

        {/* ปุ่มบันทึก */}
        <div className="d-grid mt-2">
          <button
            onClick={onSave}
            className="btn btn-primary btn-lg fw-bold border-0 shadow-sm py-3 rounded-pill d-flex align-items-center justify-content-center hover-up"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
            }}
          >
            <i className="fa-solid fa-check-circle me-2 fs-5"></i>
            บันทึกรายการ
          </button>
        </div>
      </div>

      <style>{`
        /* ซ่อนลูกศรขึ้น/ลง ในช่องกรอกตัวเลข */
        .hide-arrows::-webkit-outer-spin-button,
        .hide-arrows::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .hide-arrows {
          -moz-appearance: textfield;
        }

        /* เอฟเฟกต์ปุ่มตอนกด */
        .hover-up { transition: all 0.2s ease; }
        .hover-up:hover { transform: translateY(-2px); box-shadow: 0 8px 15px rgba(79, 70, 229, 0.3) !important; }
        .hover-up:active { transform: scale(0.98); }
      `}</style>
    </Modal>
  );
}

export default QtyModal;
