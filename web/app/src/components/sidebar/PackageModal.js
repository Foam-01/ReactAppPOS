import Modal from "../Modal";
import Loading from "../Loading";

// เลือกแพ็กเกจเพื่ออัปเกรด (renderButton มาจาก Sidebar)
function PackageModal({ packages, renderButton, packageName }) {
  return (
    <Modal
      id="modalPackage"
      title="อัปเกรดแพ็กเกจ"
      modalSize="modal-xl modal-dialog-scrollable"
    >
      <div className="pkg-wrap">
        <div className="pkg-head">
          <h4 className="pkg-title">เลือกแพ็กเกจที่เหมาะกับธุรกิจคุณ</h4>
          <p className="pkg-sub">
            เปรียบเทียบแพ็กเกจแล้วเลือกแบบที่ใช่ อัปเกรดได้ทุกเมื่อ
          </p>
          {packageName && (
            <span className="pkg-now">
              <i className="fa-solid fa-crown me-1" aria-hidden="true"></i>
              แพ็กเกจปัจจุบัน: <strong>{packageName}</strong>
            </span>
          )}
        </div>

        {packages.length > 0 ? (
          <div className="pkg-grid">
            {packages.map((item, index) => {
              const isPopular = index === 1; // ตัวกลาง (Pro)
              const isPremium = index === 2; // ตัวท็อป (Enterprise)
              const isCurrent = packageName === item.name;

              const features = [
                { text: "ระบบจัดการสต็อกสินค้าพื้นฐาน", included: true },
                { text: "รายงานสรุปยอดขายรายวัน", included: true },
                { text: "รองรับการใช้งานหลายสาขา", included: index >= 1 },
                { text: "เพิ่มพนักงานได้ไม่จำกัด", included: index >= 1 },
                { text: "รายงานยอดขายแบบละเอียด", included: index >= 2 },
                { text: "ทีมซัพพอร์ตดูแลโดยตรง", included: index >= 2 },
              ];

              return (
                <section
                  key={item.id || index}
                  className={`pkg-card ${isPopular ? "is-popular" : ""} ${isPremium ? "is-premium" : ""}`}
                  aria-label={`แพ็กเกจ ${item.name}`}
                >
                  {isPopular && (
                    <span className="pkg-ribbon">
                      <i className="fa-solid fa-star me-1" aria-hidden="true"></i>
                      ยอดนิยม
                    </span>
                  )}
                  {isCurrent && <span className="pkg-tag">ใช้งานอยู่</span>}

                  <div className="pkg-name">{item.name}</div>
                  <div className="pkg-price">
                    <span className="pkg-cur">฿</span>
                    <span className="pkg-amount">
                      {Number(item.price).toLocaleString()}
                    </span>
                    <span className="pkg-per">/เดือน</span>
                  </div>

                  <div className="pkg-limit">
                    <i className="fa-solid fa-receipt me-2" aria-hidden="true"></i>
                    สร้างบิลสูงสุด
                    <strong>{Number(item.bill_amount).toLocaleString()}</strong>
                    บิล/เดือน
                  </div>

                  <ul className="pkg-features">
                    {features.map((feature, fIndex) => (
                      <li
                        key={fIndex}
                        className={feature.included ? "" : "is-off"}
                      >
                        <span className="pkg-ico" aria-hidden="true">
                          <i
                            className={`fa-solid ${feature.included ? "fa-check" : "fa-minus"}`}
                          ></i>
                        </span>
                        <span>
                          {feature.text}
                          {!feature.included && (
                            <span className="sr-only"> (ไม่รวมในแพ็กเกจนี้)</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="pkg-foot">{renderButton(item, index)}</div>
                </section>
              );
            })}
          </div>
        ) : (
          <Loading text="กำลังโหลดแพ็กเกจ..." />
        )}
      </div>

      <style>{`
        #modalPackage .modal-body { padding: 0; }
        .pkg-wrap {
          padding: 2.25rem 1.5rem 2rem;
          background: radial-gradient(900px 260px at 50% -100px, #dbeafe 0%, transparent 70%), #f8fafc;
        }
        .pkg-head { text-align: center; margin-bottom: 2.5rem; }
        .pkg-title { font-weight: 800; color: #0f172a; margin-bottom: .35rem; }
        .pkg-sub { color: #64748b; font-size: .9rem; margin-bottom: .9rem; }
        .pkg-now {
          display: inline-flex; align-items: center; gap: .25rem;
          padding: .3rem .9rem; border-radius: 999px;
          background: #fff7e0; color: #8a5a00; font-size: .8rem; border: 1px solid #ffe3a1;
        }

        .pkg-grid {
          display: grid; gap: 1.5rem;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          align-items: stretch; max-width: 1040px; margin: 0 auto;
        }
        .pkg-card {
          position: relative; display: flex; flex-direction: column;
          background: #fff; border: 1px solid #e2e8f0; border-radius: 20px;
          padding: 2rem 1.5rem 1.5rem;
          box-shadow: 0 1px 2px rgba(15,23,42,.04), 0 8px 24px rgba(15,23,42,.05);
          transition: transform .25s ease, box-shadow .25s ease;
        }
        .pkg-card:hover { transform: translateY(-4px); box-shadow: 0 18px 40px rgba(15,23,42,.10); }
        .pkg-card.is-popular { border: 2px solid #3b82f6; box-shadow: 0 18px 44px rgba(59,130,246,.18); }
        .pkg-card.is-premium {
          background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
          border-color: #1e293b; color: #e2e8f0;
        }

        .pkg-ribbon {
          position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
          background: linear-gradient(90deg, #2563eb, #3b82f6); color: #fff;
          font-size: .75rem; font-weight: 700; padding: .3rem .95rem; border-radius: 999px;
          box-shadow: 0 6px 14px rgba(37,99,235,.35); white-space: nowrap;
        }
        .pkg-tag {
          position: absolute; top: 1.1rem; right: 1.1rem;
          font-size: .7rem; font-weight: 700; padding: .2rem .6rem; border-radius: 999px;
          background: #dcfce7; color: #166534;
        }

        .pkg-name {
          font-size: .85rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
          color: #2563eb; margin-bottom: .75rem;
        }
        .is-premium .pkg-name { color: #fbbf24; }

        .pkg-price { display: flex; align-items: baseline; gap: .3rem; margin-bottom: 1.1rem; }
        .pkg-cur { font-size: 1.25rem; font-weight: 700; color: #64748b; }
        .pkg-amount { font-size: 2.75rem; font-weight: 800; line-height: 1; color: #0f172a; letter-spacing: -.02em; }
        .pkg-per { color: #64748b; font-size: .9rem; }
        .is-premium .pkg-cur, .is-premium .pkg-per { color: #94a3b8; }
        .is-premium .pkg-amount { color: #fff; }

        .pkg-limit {
          display: flex; align-items: center; flex-wrap: wrap; gap: .3rem;
          padding: .7rem .9rem; border-radius: 12px; margin-bottom: 1.25rem;
          background: #f1f5f9; color: #334155; font-size: .875rem;
        }
        .pkg-limit strong { color: #0f172a; }
        .is-popular .pkg-limit { background: #eff6ff; color: #1e40af; }
        .is-popular .pkg-limit strong { color: #1d4ed8; }
        .is-premium .pkg-limit { background: rgba(251,191,36,.12); color: #fde68a; }
        .is-premium .pkg-limit strong { color: #fbbf24; }

        .pkg-features { list-style: none; padding: 0; margin: 0 0 1.5rem; flex-grow: 1; }
        .pkg-features li {
          display: flex; align-items: flex-start; gap: .65rem;
          padding: .5rem 0; font-size: .9rem; line-height: 1.45; color: #1e293b;
        }
        .pkg-features li + li { border-top: 1px dashed #e9eef5; }
        .is-premium .pkg-features li { color: #e2e8f0; }
        .is-premium .pkg-features li + li { border-top-color: rgba(255,255,255,.08); }
        .pkg-features li.is-off { color: #64748b; }
        .is-premium .pkg-features li.is-off { color: #94a3b8; }

        .pkg-ico {
          flex-shrink: 0; width: 20px; height: 20px; margin-top: 1px; border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center; font-size: 10px;
          background: #dcfce7; color: #15803d;
        }
        .is-popular .pkg-ico { background: #dbeafe; color: #1d4ed8; }
        .is-premium .pkg-ico { background: #fbbf24; color: #1e293b; }
        li.is-off .pkg-ico, .is-popular li.is-off .pkg-ico { background: #f1f5f9; color: #94a3b8; }
        .is-premium li.is-off .pkg-ico { background: rgba(255,255,255,.08); color: #64748b; }

        .pkg-foot { margin-top: auto; }
        .pkg-btn {
          width: 100%; min-height: 46px; border-radius: 999px; font-weight: 700; font-size: .95rem;
          border: 2px solid transparent; display: inline-flex; align-items: center; justify-content: center;
          transition: background-color .2s ease, box-shadow .2s ease, transform .2s ease;
          cursor: pointer;
        }
        .pkg-btn:not(:disabled):hover { transform: translateY(-1px); }
        .pkg-btn-primary { background: #2563eb; color: #fff; box-shadow: 0 8px 18px rgba(37,99,235,.3); }
        .pkg-btn-primary:hover { background: #1d4ed8; }
        .pkg-btn-outline { background: #fff; color: #1d4ed8; border-color: #bfdbfe; }
        .pkg-btn-outline:hover { background: #eff6ff; border-color: #93c5fd; }
        .pkg-btn-gold { background: linear-gradient(90deg, #fbbf24, #f59e0b); color: #1e293b; box-shadow: 0 8px 18px rgba(245,158,11,.3); }
        .pkg-btn-gold:hover { filter: brightness(1.05); }
        .pkg-btn-current { background: #f1f5f9; color: #475569; border-color: #e2e8f0; cursor: default; }
        .is-premium .pkg-btn-current { background: rgba(255,255,255,.08); color: #cbd5e1; border-color: rgba(255,255,255,.12); }

        @media (max-width: 575.98px) {
          .pkg-wrap { padding: 1.75rem 1rem 1.25rem; }
          .pkg-amount { font-size: 2.25rem; }
          .pkg-grid { gap: 1.75rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pkg-card:hover, .pkg-btn:not(:disabled):hover { transform: none; }
        }
      `}</style>
    </Modal>
  );
}

export default PackageModal;
