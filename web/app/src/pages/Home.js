import { useEffect, useState } from "react";
import Template from "../components/Template";
import { PageHeader, FilterBarButton } from "../components/PageHeader";
import axios from "axios";
import config from "../config";
import Swal from "../utils/swal";
import * as dayjs from "dayjs";
import EmptyState from "../components/EmptyState";
import Loading from "../components/Loading";
import { Link } from "react-router-dom";
import Modal from "../components/Modal"; // 🌟 อย่าลืม Import Modal เข้ามาด้วยนะครับ

const EMPTY_SUMMARY = {
  totalBills: 0,
  totalSales: 0,
  weekSales: [],
  topProducts: [],
  recentBills: [],
  stock: { productCount: 0, totalStock: 0, negativeCount: 0 },
};

function Home() {
  const [products, setProducts] = useState([]);
  // ยอดสรุปคำนวณที่ API (/billSale/summary) แทนการโหลดบิลและสต็อกทุกแถวมารวมเอง
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 เพิ่ม State สำหรับเก็บบิลที่ถูกเลือกเพื่อดูรายละเอียด
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [resProducts, resSummary] = await Promise.all([
        axios
          .get(config.api_path + "/product/list", config.headers())
          .catch(() => ({ data: { results: [] } })),
        axios
          .get(config.api_path + "/billSale/summary", config.headers())
          .catch(() => ({ data: { results: EMPTY_SUMMARY } })),
      ]);

      setProducts(resProducts.data.results || []);
      setSummary(resSummary.data.results || EMPTY_SUMMARY);
    } catch (e) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "โหลดข้อมูลไม่สำเร็จ กด 'รีเฟรชข้อมูล' เพื่อลองใหม่",
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fmtMoney = (n) =>
    Number(n || 0).toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const sumBill = (bill) =>
    bill.billSaleDetails?.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.qty),
      0,
    ) || 0;

  const totalSales = summary.totalSales;
  const billCount = summary.totalBills;
  const avgBill = billCount > 0 ? totalSales / billCount : 0;

  const totalStock = summary.stock.totalStock;
  const negativeStockCount = summary.stock.negativeCount;

  // ยอดขายรายวัน 7 วันล่าสุด (รวมวันนี้) · API ส่งเฉพาะวันที่มียอด
  const weekTotals = Object.fromEntries(
    summary.weekSales.map((d) => [d.date, d.total]),
  );
  const weekSales = Array.from({ length: 7 }, (_, i) => {
    const day = dayjs().subtract(6 - i, "day");
    const key = day.format("YYYY-MM-DD");
    const total = weekTotals[key] || 0;
    return { key, total, label: day.format("DD/MM"), isToday: i === 6 };
  });
  const weekMax = Math.max(...weekSales.map((d) => d.total));
  const weekTotal = weekSales.reduce((sum, d) => sum + d.total, 0);
  const todaySales = weekSales[6].total;

  // สินค้าขายดี 5 อันดับ (ตามจำนวนชิ้น)
  const topProducts = summary.topProducts;

  const recentBills = summary.recentBills;

  return (
    <Template>
      <div className="container-fluid p-0">
        <PageHeader
          eyebrow="ร้านค้า / หน้าหลัก"
          title="ภาพรวมร้าน"
          description="สรุปยอดขาย บิล สินค้า และสต็อกของร้านในหน้าเดียว"
          actions={
            <FilterBarButton
              onClick={fetchDashboardData}
              disabled={isLoading}
              icon={`fa-solid fa-sync-alt ${isLoading ? "fa-spin" : ""}`}
            >
              รีเฟรชข้อมูล
            </FilterBarButton>
          }
          actionsNote={`ข้อมูลล่าสุด ${dayjs().format("DD/MM/YYYY HH:mm")}`}
        />

        {/* ผู้ใช้ใหม่: บอกขั้นตอนเริ่มต้น จนกว่าจะขายบิลแรก */}
        {!isLoading && billCount === 0 && (
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <h5 className="fw-bold text-dark mb-1">เริ่มต้นใช้งาน</h5>
              <p className="text-muted small mb-3">ทำ 3 ขั้นตอนนี้เพื่อเริ่มขายบิลแรก</p>
              <div className="row g-3">
                {[
                  { done: products.length > 0, to: "/product", icon: "fa-box-open", title: "1. เพิ่มสินค้า", desc: "ตั้งชื่อและราคาสินค้า" },
                  { done: summary.stock.productCount > 0, to: "/stock", icon: "fa-truck-loading", title: "2. รับสินค้าเข้าสต็อก", desc: "ระบุจำนวนสินค้าที่มี" },
                  { done: false, to: "/sale", icon: "fa-cash-register", title: "3. เริ่มขาย", desc: "เลือกสินค้าแล้วรับเงิน" },
                ].map((step) => (
                  <div className="col-md-4" key={step.to}>
                    <Link
                      to={step.to}
                      className={`d-flex align-items-center p-3 rounded-3 border text-decoration-none h-100 ${step.done ? "bg-light" : "bg-white"}`}
                    >
                      <i className={`fa-solid ${step.done ? "fa-circle-check text-success" : step.icon + " text-primary"} fa-lg me-3`}></i>
                      <div>
                        <div className={`fw-bold ${step.done ? "text-muted text-decoration-line-through" : "text-dark"}`}>{step.title}</div>
                        <div className="small text-muted">{step.desc}</div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="row g-3 mb-4">
          {[
            {
              label: "ยอดขายรวม",
              value: fmtMoney(totalSales),
              unit: "฿",
              icon: "fa-wallet",
              tone: "success",
              note: `วันนี้ ${fmtMoney(todaySales)} ฿`,
            },
            {
              label: "จำนวนบิลขาย",
              value: billCount.toLocaleString(),
              unit: "บิล",
              icon: "fa-receipt",
              tone: "primary",
              note: `เฉลี่ย ${fmtMoney(avgBill)} ฿ / บิล`,
            },
            {
              label: "เมนู/สินค้าในระบบ",
              value: products.length.toLocaleString(),
              unit: "รายการ",
              icon: "fa-utensils",
              tone: "warning",
              note: "พร้อมขายหน้าร้าน",
            },
            {
              label: "สต็อกคงเหลือรวม",
              value: totalStock.toLocaleString(),
              unit: "ชิ้น",
              icon: "fa-cubes",
              tone: negativeStockCount > 0 ? "danger" : "info",
              note:
                negativeStockCount > 0
                  ? `${negativeStockCount} สินค้าสต็อกติดลบ`
                  : "สต็อกปกติ",
            },
          ].map((kpi) => (
            <div className="col-xl-3 col-md-6" key={kpi.label}>
              <div className={`card border-0 shadow-sm rounded-4 h-100 kpi-card kpi-${kpi.tone}`}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className={`kpi-icon bg-${kpi.tone} text-white me-3`}>
                      <i className={`fa-solid ${kpi.icon}`}></i>
                    </div>
                    <span className="text-muted fw-semibold small">{kpi.label}</span>
                  </div>
                  <div className="d-flex align-items-baseline">
                    <span className="kpi-value text-dark">
                      {isLoading ? "–" : kpi.value}
                    </span>
                    <span className="text-muted small ms-2">{kpi.unit}</span>
                  </div>
                  <div className={`small mt-2 ${kpi.tone === "warning" ? "text-muted" : "text-" + kpi.tone}`}>
                    {kpi.note}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ยอดขาย 7 วัน + สินค้าขายดี */}
        <div className="row g-3 mb-4">
          <div className="col-xl-8">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h6 className="fw-bold text-dark mb-1">ยอดขาย 7 วันล่าสุด</h6>
                    <div className="small text-muted">
                      รวม <span className="fw-bold text-dark">{fmtMoney(weekTotal)} ฿</span>
                    </div>
                  </div>
                  <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2">
                    {dayjs().subtract(6, "day").format("DD/MM")} – {dayjs().format("DD/MM")}
                  </span>
                </div>
                <div className="week-chart">
                  {weekSales.map((d) => (
                    <div className="week-col" key={d.key} title={`${d.label}: ${fmtMoney(d.total)} ฿`}>
                      <div className="week-amount text-muted">
                        {d.total > 0 ? Math.round(d.total).toLocaleString() : ""}
                      </div>
                      <div className="week-track">
                        <div
                          className={`week-bar ${d.isToday ? "today" : ""}`}
                          style={{
                            height: `${weekMax > 0 && d.total > 0 ? Math.max((d.total / weekMax) * 100, 4) : 0}%`,
                          }}
                        ></div>
                      </div>
                      <div className={`small mt-2 ${d.isToday ? "fw-bold text-primary" : "text-muted"}`}>
                        {d.isToday ? "วันนี้" : d.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4">
                <h6 className="fw-bold text-dark mb-3">สินค้าขายดี</h6>
                {topProducts.length === 0 ? (
                  <div className="text-muted small py-4 text-center">ยังไม่มีข้อมูลการขาย</div>
                ) : (
                  topProducts.map((p, i) => (
                    <div className="mb-3" key={p.name}>
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="text-dark fw-semibold text-truncate me-2">
                          <span className="rank-dot me-2">{i + 1}</span>
                          {p.name}
                        </span>
                        <span className="text-muted text-nowrap">{p.qty.toLocaleString()} ชิ้น</span>
                      </div>
                      <div className="progress rounded-pill" style={{ height: 6 }}>
                        <div
                          className="progress-bar rounded-pill"
                          style={{ width: `${(p.qty / topProducts[0].qty) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}

                {negativeStockCount > 0 && (
                  <Link
                    to="/ReportStock"
                    className="d-flex align-items-center mt-4 p-3 rounded-3 bg-danger-subtle text-danger text-decoration-none small"
                  >
                    <i className="fa-solid fa-triangle-exclamation me-2"></i>
                    <span className="flex-grow-1">
                      สต็อกติดลบ {negativeStockCount} รายการ ควรรับสินค้าเข้าสต็อก
                    </span>
                    <i className="fa-solid fa-chevron-right"></i>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-body px-4 pt-4 pb-3 d-flex justify-content-between align-items-center">
            <h6 className="mb-0 fw-bold text-dark">รายการขายล่าสุด</h6>
            <Link to="/billSales" className="small text-decoration-none">
              ดูทั้งหมด <i className="fa-solid fa-arrow-right ms-1"></i>
            </Link>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 recent-table">
              <thead>
                <tr>
                  <th className="ps-4">เลขบิล</th>
                  <th>วันที่ / เวลา</th>
                  <th className="text-center">รายการ</th>
                  <th className="text-end">ยอดขาย</th>
                  <th className="text-end pe-4"></th>
                </tr>
              </thead>
              <tbody>
                {recentBills.length > 0 ? (
                  recentBills.map((bill) => {
                    const billTotal = sumBill(bill);
                    const count = bill.billSaleDetails?.length || 0;
                    return (
                      <tr key={bill.id}>
                        <td className="ps-4">
                          <span className="fw-bold text-dark font-monospace">#{bill.id}</span>
                        </td>
                        <td>
                          <div className="text-dark">{dayjs(bill.createdAt).format("DD/MM/YYYY")}</div>
                          <div className="small text-muted">{dayjs(bill.createdAt).format("HH:mm")} น.</div>
                        </td>
                        <td className="text-center">
                          <span className={`badge rounded-pill fw-normal px-3 py-2 ${count > 0 ? "bg-primary-subtle text-primary" : "bg-light text-muted border"}`}>
                            {count} รายการ
                          </span>
                        </td>
                        <td className={`text-end fw-bold font-monospace ${billTotal > 0 ? "text-dark" : "text-muted"}`}>
                          {fmtMoney(billTotal)} ฿
                        </td>
                        <td className="text-end pe-4">
                          <button
                            className="btn btn-sm btn-light rounded-pill px-3"
                            data-toggle="modal"
                            data-target="#modalRecentBillDetail"
                            onClick={() => setSelectedBill(bill)}
                          >
                            <i className="fa-solid fa-eye me-1 text-primary"></i> ดู
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5">
                      {isLoading ? (
                        <Loading />
                      ) : (
                        <EmptyState icon="fa-file-invoice" text="ยังไม่มีประวัติการขาย" />
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <style>{`
          .kpi-card { position: relative; overflow: hidden; transition: transform .2s ease, box-shadow .2s ease; }
          .kpi-card::before { content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 4px; }
          .kpi-success::before { background: var(--bs-success); }
          .kpi-primary::before { background: var(--bs-primary); }
          .kpi-warning::before { background: var(--bs-warning); }
          .kpi-danger::before { background: var(--bs-danger); }
          .kpi-info::before { background: var(--bs-info); }
          .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1.25rem rgba(0,0,0,.08) !important; }
          .kpi-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
          .kpi-value { font-size: 1.85rem; font-weight: 700; letter-spacing: -.02em; font-variant-numeric: tabular-nums; line-height: 1.1; }
          .week-chart { display: flex; gap: 12px; height: 220px; }
          .week-col { flex: 1; display: flex; flex-direction: column; align-items: center; min-width: 0; }
          .week-amount { height: 20px; font-size: .72rem; white-space: nowrap; }
          .week-track { flex: 1; width: 100%; max-width: 48px; display: flex; align-items: flex-end; background: #f3f5f8; border-radius: 10px; }
          .week-bar { width: 100%; background: #b6ccfe; border-radius: 10px; transition: height .4s ease; }
          .week-bar.today { background: var(--bs-primary); }
          .rank-dot { display: inline-flex; width: 20px; height: 20px; border-radius: 50%; background: #eef2ff; color: var(--bs-primary); font-size: .7rem; font-weight: 700; align-items: center; justify-content: center; }
          .recent-table thead th { font-size: .78rem; font-weight: 600; color: #8a94a6; background: #f8f9fb; border: 0; padding-top: .85rem; padding-bottom: .85rem; }
          .recent-table tbody td { padding-top: .9rem; padding-bottom: .9rem; border-color: #f0f2f5; }
        `}</style>
      </div>

      {/* 🌟 Modal สำหรับแสดงรายละเอียดบิลที่เลือก 🌟 */}
      <Modal
        id="modalRecentBillDetail"
        title={`🧾 รายละเอียดบิล #${selectedBill?.id || ""}`}
        modalSize="modal-lg"
      >
        <div className="p-3">
          <div className="d-flex justify-content-between mb-3 text-muted small">
            <span>
              วันที่ทำรายการ:{" "}
              <span className="fw-bold text-dark">
                {selectedBill
                  ? dayjs(selectedBill.createdAt).format("DD/MM/YYYY HH:mm น.")
                  : "-"}
              </span>
            </span>
            <span>
              สถานะ: <span className="badge bg-success-subtle text-success rounded-pill px-3 py-1">ชำระเงินแล้ว</span>
            </span>
          </div>

          <div className="table-responsive border rounded-3 overflow-hidden shadow-sm">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted small fw-bold">
                <tr>
                  <th className="py-3 ps-3 border-0">รายการสินค้า</th>
                  <th className="py-3 border-0 text-end">ราคา/หน่วย</th>
                  <th className="py-3 border-0 text-center">จำนวน</th>
                  <th className="py-3 border-0 text-end pe-3">ยอดรวม</th>
                </tr>
              </thead>
              <tbody>
                {selectedBill?.billSaleDetails?.map((item, index) => (
                  <tr key={index}>
                    <td className="ps-3 py-3 fw-bold text-dark">
                      {item.product?.name || "ไม่ระบุชื่อ"}
                    </td>
                    <td className="text-end font-monospace text-muted">
                      {Number(item.price).toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="text-center">
                      <span className="badge bg-light text-dark border fw-normal px-2 py-1 font-monospace">
                        {item.qty}
                      </span>
                    </td>
                    <td className="text-end pe-3 fw-bold text-primary font-monospace">
                      {(Number(item.qty) * Number(item.price)).toLocaleString(
                        "th-TH",
                        { minimumFractionDigits: 2 },
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              {selectedBill?.billSaleDetails && (
                <tfoot className="table-light border-top border-2">
                  <tr className="fw-bold">
                    <td colSpan="3" className="text-end py-3">
                      รวมทั้งสิ้น:
                    </td>
                    <td className="text-end pe-3 py-3 h5 mb-0 text-success font-monospace fw-bold">
                      {selectedBill.billSaleDetails
                        .reduce(
                          (sum, item) =>
                            sum + Number(item.price) * Number(item.qty),
                          0,
                        )
                        .toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                        })}{" "}
                      ฿
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </Modal>
    </Template>
  );
}

export default Home;
