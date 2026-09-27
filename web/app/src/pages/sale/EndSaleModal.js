import Modal from "../../components/Modal";

// รับเงินและจบการขาย
function EndSaleModal({ totalPrice, inputMoney, setInputMoney, onEndSale, isEndingSale }) {
  return (
    <Modal
      id="modalEndSale"
      title="💰 สรุปยอดเงินและชำระเงิน"
      modalSize="modal-md"
    >
      <div className="p-3">
        {/* ส่วนแสดงยอดรวม - สไตล์ Digital Dashboard */}
        <div
          className="text-center p-4 rounded-4 mb-4 shadow-sm border border-dark"
          style={{
            backgroundColor: "#1a1d20",
            boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="text-secondary small fw-bold text-uppercase mb-2 d-block"
            style={{ letterSpacing: "1px" }}
          >
            ยอดที่ต้องชำระ
          </div>
          <div
            className="display-5 mb-0 fw-bold"
            style={{
              color: "#70FE3F",
              fontFamily: "'Courier New', Courier, monospace",
            }}
          >
            {totalPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="row g-4">
          {/* ส่วนกรอกเงินที่รับมา */}
          <div className="col-12">
            <label htmlFor="sale-field-1" className="form-label fw-bold text-dark small text-uppercase">
              รับเงินสด
            </label>
            <div className="input-group input-group-lg shadow-sm">
              <span className="input-group-text bg-white border-end-0">
                <i className="fa-solid fa-money-bill-wave text-muted"></i>
              </span>
              <input id="sale-field-1"
                type="number"
                value={inputMoney}
                onChange={(e) => setInputMoney(e.target.value)}
                className="form-control border-start-0 ps-1 fw-bold text-end"
                placeholder="0.00"
                autoFocus
                style={{ fontSize: "1.5rem" }}
              />
            </div>
          </div>

          {/* ส่วนแสดงผลเงินทอน/ค้างชำระ - เน้นความคลีน */}
          <div className="col-12 mt-4">
            <div className="p-3 rounded-4 bg-light border border-2 border-dashed">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold text-muted text-uppercase small">
                  {inputMoney - totalPrice >= 0
                    ? "เงินทอน"
                    : "ยอดค้างชำระ"}
                </span>
                <span
                  className="h1 mb-0 fw-bold text-dark"
                  style={{ fontFamily: "monospace" }}
                >
                  {(inputMoney - totalPrice).toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ปุ่มควบคุม Action Buttons */}
        <div className="row g-3 mt-4">
          <div className="col-6">
            <button
              onClick={() => setInputMoney(totalPrice)}
              className="btn btn-outline-secondary btn-lg w-100 py-3 fw-bold rounded-3 border-2 hover-shadow"
            >
              <i className="fa-solid fa-mouse-pointer me-2 small"></i>
              จ่ายพอดี
            </button>
          </div>
          <div className="col-6">
            <button
              onClick={onEndSale}
              className="btn btn-primary btn-lg w-100 py-3 fw-bold rounded-3 shadow border-0"
              disabled={inputMoney - totalPrice < 0 || isEndingSale}
              style={{ transition: "all 0.2s" }}
            >
              {isEndingSale ? (
                <><i className="fa-solid fa-spinner fa-spin me-2"></i>กำลังบันทึก...</>
              ) : (
                <><i className="fa-solid fa-check-circle me-2"></i>จบการขาย</>
              )}
            </button>
          </div>
        </div>

        <div className="text-center mt-3">
          <small className="text-muted">
            ตรวจสอบยอดเงินทอนให้ถูกต้องก่อนกดยืนยัน
          </small>
        </div>
      </div>
    </Modal>
  );
}

export default EndSaleModal;
