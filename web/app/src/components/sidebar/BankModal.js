import Modal from "../Modal";
import Loading from "../Loading";
import Swal from "../../utils/swal";

// สีแบรนด์ธนาคาร (จับจากชื่อธนาคาร)
function getBankBrand(item) {
  const type = (item.bankType || item.bankName || "").toLowerCase();
  if (type.includes("กสิกร") || type.includes("kbank"))
    return { bg: "#00A950", fg: "#fff", code: "KBANK" };
  if (type.includes("กรุงไทย") || type.includes("ktb"))
    return { bg: "#00AEEF", fg: "#fff", code: "KTB" };
  if (type.includes("พาณิชย์") || type.includes("scb"))
    return { bg: "#4E2A84", fg: "#fff", code: "SCB" };
  if (type.includes("กรุงเทพ") || type.includes("bbl"))
    return { bg: "#1E4598", fg: "#fff", code: "BBL" };
  if (type.includes("ออมสิน") || type.includes("gsb"))
    return { bg: "#EB198D", fg: "#fff", code: "GSB" };
  if (type.includes("กรุงศรี") || type.includes("bay"))
    return { bg: "#FEC43B", fg: "#333", code: "BAY" };
  return { bg: "var(--color-text-muted)", fg: "#fff", code: "BANK" };
}

// เลือกบัญชีธนาคารและยืนยันการชำระค่าแพ็กเกจ
function BankModal({ banks, choosePackage, onConfirm }) {
  const handleCopy = (item, code) => {
    navigator.clipboard.writeText(item.bankCode);
    Swal.fire({
      title: "คัดลอกสำเร็จ",
      text: `คัดลอกเลขบัญชี ${code} แล้ว`,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: "top",
    });
  };

  return (
    <Modal
      id="modalBank"
      title="ชำระค่าบริการ"
      modalSize="modal-dialog-scrollable pay-dialog"
    >
      <div className="pay-wrap">
        {/* สรุปยอดชำระ */}
        <div className="pay-summary">
          <span className="pay-plan">
            <i className="fa-solid fa-crown me-1" aria-hidden="true"></i>
            แพ็กเกจ {choosePackage?.name}
          </span>
          <div className="pay-label">ยอดที่ต้องชำระ</div>
          <div className="pay-price">
            <span className="pay-cur">฿</span>
            <span className="pay-amount">
              {Number(choosePackage?.price || 0).toLocaleString("th-TH", {
                minimumFractionDigits: 2,
              })}
            </span>
            <span className="pay-per">/เดือน</span>
          </div>
          {choosePackage?.bill_amount !== undefined && (
            <div className="pay-limit">
              <i className="fa-solid fa-receipt me-2" aria-hidden="true"></i>
              สร้างบิลสูงสุด{" "}
              <strong>{Number(choosePackage.bill_amount).toLocaleString()}</strong>{" "}
              บิล/เดือน
            </div>
          )}
        </div>

        {/* ขั้นตอน */}
        <ol className="pay-steps" aria-label="ขั้นตอนการชำระเงิน">
          <li><span>1</span>โอนเงิน</li>
          <li><span>2</span>ส่งสลิปทาง LINE</li>
          <li><span>3</span>กดยืนยัน</li>
        </ol>

        {/* บัญชีธนาคาร */}
        <div className="pay-section">
          <h6 className="pay-heading">
            <span className="pay-step-no" aria-hidden="true">1</span>
            โอนเงินเข้าบัญชี
          </h6>

          {banks.length > 0 ? (
            banks.map((item, index) => {
              const brand = getBankBrand(item);
              return (
                <div className="pay-bank" key={index}>
                  <div className="pay-bank-top">
                    <div
                      className="pay-bank-logo"
                      style={{ backgroundColor: brand.bg, color: brand.fg }}
                      aria-hidden="true"
                    >
                      {brand.code}
                    </div>
                    <div className="pay-bank-info">
                      <div className="pay-bank-name">
                        {item.bankType || item.bankName}
                      </div>
                      <div className="pay-bank-owner">
                        {item.accountName || "สิทธิเดช ทองสว่าง"}
                        {item.bankBranch && <> · สาขา {item.bankBranch}</>}
                      </div>
                    </div>
                  </div>

                  <div className="pay-acc">
                    <span className="pay-acc-no">{item.bankCode}</span>
                    <button
                      type="button"
                      className="pay-copy"
                      onClick={() => handleCopy(item, brand.code)}
                      aria-label={`คัดลอกเลขบัญชี ${item.bankCode}`}
                    >
                      <i className="fa-regular fa-copy me-1" aria-hidden="true" />
                      คัดลอก
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <Loading text="กำลังโหลดข้อมูลธนาคาร..." />
          )}
        </div>

        {/* แจ้งโอน LINE */}
        <div className="pay-section">
          <h6 className="pay-heading">
            <span className="pay-step-no" aria-hidden="true">2</span>
            ส่งสลิปยืนยันการโอน
          </h6>
          <a
            href="https://line.me/ti/p/~F_Yui.01"
            target="_blank"
            rel="noopener noreferrer"
            className="pay-line"
          >
            <span className="pay-line-ico" aria-hidden="true">
              <i className="fa-brands fa-line"></i>
            </span>
            <span className="pay-line-text">
              <strong>แจ้งโอนเงิน / ส่งสลิป</strong>
              <small>เปิด LINE เพื่อส่งสลิปให้ทีมงาน</small>
            </span>
            <i className="fa-solid fa-arrow-up-right-from-square pay-line-go" aria-hidden="true"></i>
            <span className="sr-only">(เปิดในแท็บใหม่)</span>
          </a>
        </div>
      </div>

      {/* ปุ่มยืนยัน ติดด้านล่าง */}
      <div className="pay-foot">
        <button
          type="button"
          onClick={onConfirm}
          className="pay-submit"
          disabled={!choosePackage || banks.length === 0}
        >
          <span className="pay-step-no light" aria-hidden="true">3</span>
          ยืนยันการสมัครสมาชิก
        </button>
        <p className="pay-note">
          ทีมงานจะเปลี่ยนแพ็กเกจให้หลังตรวจสอบการชำระเงิน
        </p>
      </div>

      <style>{`
        #modalBank .modal-body { padding: 0; }
        @media (min-width: 576px) { .pay-dialog { max-width: 480px; } }

        .pay-wrap { background: #f8fafc; }
        .pay-summary {
          text-align: center; padding: 1.75rem 1.5rem 1.5rem;
          background: radial-gradient(600px 200px at 50% -80px, #dbeafe 0%, transparent 70%), #f8fafc;
        }
        .pay-plan {
          display: inline-flex; align-items: center; padding: .3rem .9rem; border-radius: 999px;
          background: #fff7e0; color: #8a5a00; border: 1px solid #ffe3a1;
          font-size: .8rem; font-weight: 700; margin-bottom: .9rem;
        }
        .pay-label { color: #64748b; font-size: .85rem; margin-bottom: .25rem; }
        .pay-price { display: flex; justify-content: center; align-items: baseline; gap: .3rem; }
        .pay-cur { font-size: 1.3rem; font-weight: 700; color: #64748b; }
        .pay-amount { font-size: 2.75rem; font-weight: 800; line-height: 1.1; color: #0f172a; letter-spacing: -.02em; }
        .pay-per { color: #64748b; font-size: .9rem; }
        .pay-limit {
          display: inline-flex; align-items: center; gap: .25rem; margin-top: .9rem;
          padding: .45rem .9rem; border-radius: 12px; background: #eff6ff; color: #1e40af; font-size: .85rem;
        }
        .pay-limit strong { color: #1d4ed8; }

        .pay-steps {
          list-style: none; margin: 0; padding: .75rem 1.5rem;
          display: flex; justify-content: space-between; gap: .5rem;
          background: #fff; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;
          font-size: .8rem; color: #475569;
        }
        .pay-steps li { display: flex; align-items: center; gap: .4rem; }
        .pay-steps span {
          width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;
          background: #dbeafe; color: #1d4ed8; font-weight: 700; font-size: .7rem; flex-shrink: 0;
        }

        .pay-section { padding: 1.25rem 1.5rem 0; }
        .pay-section:last-child { padding-bottom: 1.5rem; }
        .pay-heading {
          display: flex; align-items: center; gap: .5rem;
          font-weight: 700; color: #0f172a; font-size: .95rem; margin-bottom: .85rem;
        }
        .pay-step-no {
          width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;
          background: #2563eb; color: #fff; font-size: .72rem; font-weight: 700; flex-shrink: 0;
        }
        .pay-step-no.light { background: rgba(255,255,255,.22); margin-right: .55rem; }

        .pay-bank {
          background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1rem;
          box-shadow: 0 1px 2px rgba(15,23,42,.04), 0 6px 18px rgba(15,23,42,.04);
          transition: box-shadow .2s ease, border-color .2s ease;
        }
        .pay-bank + .pay-bank { margin-top: .75rem; }
        .pay-bank:hover { border-color: #cbd5e1; box-shadow: 0 10px 26px rgba(15,23,42,.08); }
        .pay-bank-top { display: flex; align-items: center; gap: .85rem; margin-bottom: .85rem; }
        .pay-bank-logo {
          width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: .7rem; font-weight: 800; letter-spacing: .03em;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.25);
        }
        .pay-bank-info { min-width: 0; }
        .pay-bank-name { font-weight: 700; color: #0f172a; }
        .pay-bank-owner { color: #64748b; font-size: .85rem; overflow-wrap: anywhere; }

        .pay-acc {
          display: flex; align-items: center; justify-content: space-between; gap: .5rem; flex-wrap: wrap;
          background: #f1f5f9; border-radius: 12px; padding: .55rem .55rem .55rem .9rem;
        }
        .pay-acc-no {
          font-family: SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 1.15rem; font-weight: 700; color: #0f172a; letter-spacing: .08em;
        }
        .pay-copy {
          border: 1px solid #bfdbfe; background: #fff; color: #1d4ed8;
          border-radius: 999px; padding: .35rem .9rem; font-size: .85rem; font-weight: 700;
          min-height: 36px; cursor: pointer; transition: background-color .2s ease;
        }
        .pay-copy:hover { background: #eff6ff; }

        .pay-line {
          display: flex; align-items: center; gap: .85rem; padding: .9rem 1rem;
          border-radius: 16px; background: #f0fdf4; border: 1px solid #bbf7d0;
          text-decoration: none !important; transition: background-color .2s ease, border-color .2s ease;
        }
        .pay-line:hover { background: #dcfce7; border-color: #86efac; }
        .pay-line-ico {
          width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0; background: #06c755; color: #fff;
          display: flex; align-items: center; justify-content: center; font-size: 1.6rem;
        }
        .pay-line-text { display: flex; flex-direction: column; flex-grow: 1; min-width: 0; }
        .pay-line-text strong { color: #166534; }
        .pay-line-text small { color: #15803d; }
        .pay-line-go { color: #16a34a; }

        .pay-foot {
          position: sticky; bottom: 0; background: #fff; border-top: 1px solid #e2e8f0;
          padding: 1rem 1.5rem 1.1rem;
        }
        .pay-submit {
          width: 100%; min-height: 52px; border: 0; border-radius: 999px;
          background: #2563eb; color: #fff; font-weight: 700; font-size: 1.05rem;
          display: inline-flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 18px rgba(37,99,235,.3); cursor: pointer;
          transition: background-color .2s ease, transform .2s ease;
        }
        .pay-submit:not(:disabled):hover { background: #1d4ed8; transform: translateY(-1px); }
        .pay-submit:disabled { background: #cbd5e1; box-shadow: none; cursor: not-allowed; }
        .pay-note { text-align: center; color: #64748b; font-size: .78rem; margin: .6rem 0 0; }

        @media (max-width: 575.98px) {
          .pay-summary { padding: 1.5rem 1rem 1.25rem; }
          .pay-section { padding-left: 1rem; padding-right: 1rem; }
          .pay-steps { padding: .7rem 1rem; }
          .pay-amount { font-size: 2.25rem; }
          .pay-foot { padding: .85rem 1rem 1rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pay-submit:not(:disabled):hover { transform: none; }
        }
      `}</style>
    </Modal>
  );
}

export default BankModal;
