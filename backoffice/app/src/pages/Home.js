import Template from "./Template";
import { PageHeader, FilterBar, FilterBarButton } from "../components/PageHeader";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import config from "../config";
import Swal from "../utils/swal";
import { getErrorMessage } from "../utils/error";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const MONTH_LABELS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];
const MONTH_SHORT = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const YEAR_RANGE = 5; // แสดงตัวเลือกย้อนหลัง 5 ปี
const TOP_PACKAGES = 5;

const baht = (n) => Number(n || 0).toLocaleString("th-TH");

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false, // ช่วยให้เรากำหนดความสูงกราฟเองได้
  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: {
      callbacks: {
        title: (items) => MONTH_LABELS[items[0].dataIndex],
        label: (ctx) => ` ${baht(ctx.parsed.y)} ฿`,
      },
    },
  },
  scales: {
    x: { grid: { display: false } },
    y: {
      beginAtZero: true,
      grid: { color: "rgba(148, 163, 184, 0.15)" },
      ticks: {
        callback: (value) => value.toLocaleString() + " ฿", // ใส่สัญลักษณ์บาทในแกน Y
      },
    },
  },
};

function KpiCard({ icon, tone, label, value, hint }) {
  return (
    <div className="col-6 col-xl-3">
      <div className="kpi-card h-100">
        <div className={`kpi-icon kpi-icon-${tone}`}>
          <i className={icon}></i>
        </div>
        <div className="min-w-0">
          <div className="kpi-label">{label}</div>
          <div className="kpi-value">{value}</div>
          {hint && <div className="kpi-hint">{hint}</div>}
        </div>
      </div>
    </div>
  );
}

function Home() {
  const myDate = new Date();
  const [year, setYear] = useState(myDate.getFullYear());
  const [arrYear] = useState(() => {
    let arr = [];
    const y = myDate.getFullYear();
    for (let i = y - YEAR_RANGE; i <= y; i++) {
      arr.push(i);
    }
    return arr;
  });

  const [results, setResults] = useState(null); // null = ยังไม่เคยโหลด
  const [loading, setLoading] = useState(false);
  const [loadedAt, setLoadedAt] = useState(null);
  // ถ้าเปลี่ยนปีเร็ว ๆ ให้ใช้ผลของคำขอล่าสุดเท่านั้น
  const requestId = useRef(0);

  const fetchData = async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const url = config.api_path + "/changePackage/reportSumSalePerMonth";
      const res = await axios.post(url, { year: year }, config.headers());
      if (id === requestId.current && res.data.message === "success") {
        setResults(res.data.results || []);
        setLoadedAt(new Date());
      }
    } catch (e) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: getErrorMessage(e.response?.data || e),
        icon: "error",
      });
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  };

  // โหลดอัตโนมัติเมื่อเปิดหน้าและเมื่อเปลี่ยนปี
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  // สรุปตัวเลขจากข้อมูลรายเดือนที่ได้มา (ไม่เรียก API เพิ่ม)
  const summary = useMemo(() => {
    const perMonth = new Array(12).fill(0);
    let count = 0;
    const packages = {};

    for (const item of results || []) {
      // item.month ส่งมาเป็นเลข 1-12 เราจับยัดลง Array index (0-11)
      const monthIndex = parseInt(item.month) - 1;
      if (monthIndex >= 0 && monthIndex <= 11) {
        perMonth[monthIndex] = parseInt(item.sum) || 0;
      }
      for (const row of item.results || []) {
        count++;
        const pkg = row.package || row.Package;
        const name = pkg?.name || "ไม่ระบุแพ็กเกจ";
        if (!packages[name]) packages[name] = { name, count: 0, total: 0 };
        packages[name].count++;
        packages[name].total += parseInt(pkg?.price) || 0;
      }
    }

    const total = perMonth.reduce((a, b) => a + b, 0);
    const isCurrentYear = parseInt(year) === myDate.getFullYear();
    // ปีปัจจุบันเฉลี่ยเฉพาะเดือนที่ผ่านมาแล้ว
    const monthsElapsed = isCurrentYear ? myDate.getMonth() + 1 : 12;
    const bestIndex = total > 0 ? perMonth.indexOf(Math.max(...perMonth)) : -1;
    const topPackages = Object.values(packages)
      .sort((a, b) => b.total - a.total)
      .slice(0, TOP_PACKAGES);

    return {
      perMonth,
      count,
      total,
      average: total / monthsElapsed,
      bestIndex,
      topPackages,
      currentMonthIndex: isCurrentYear ? myDate.getMonth() : -1,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, year]);

  const chartData = useMemo(
    () => ({
      labels: MONTH_SHORT,
      datasets: [
        {
          label: "รายได้รวม (บาท)",
          data: summary.perMonth,
          // เดือนปัจจุบันสีเข้ม เดือนอื่นสีอ่อน
          backgroundColor: summary.perMonth.map((_, i) =>
            i === summary.currentMonthIndex
              ? "rgba(13, 110, 253, 1)"
              : "rgba(13, 110, 253, 0.55)",
          ),
          hoverBackgroundColor: "rgba(11, 94, 215, 1)",
          borderRadius: 8, // 🌟 ทำให้ขอบกราฟแท่งโค้งมน
          maxBarThickness: 44,
        },
      ],
    }),
    [summary],
  );

  const isFirstLoad = results === null;
  const topMax = summary.topPackages[0]?.total || 0;

  return (
    <>
      <Template>
        <div className="p-4 bg-light min-vh-100">
          <PageHeader
            eyebrow="ภาพรวม / Dashboard"
            title="ภาพรวมระบบ"
            description="สรุปรายได้ค่าบริการรายเดือนของทุกร้านในปีที่เลือก"
            actions={
              <FilterBarButton
                icon={loading ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-rotate-right"}
                onClick={fetchData}
                disabled={loading}
              >
                รีเฟรช
              </FilterBarButton>
            }
            actionsNote={
              loadedAt &&
              `ข้อมูลล่าสุด ${loadedAt.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`
            }
          />
          <FilterBar>
            <select aria-label="ปี" value={year} onChange={(e) => setYear(e.target.value)} className="form-select w-auto">
              {arrYear.map((item) => (
                <option key={item} value={item}>
                  ปี {item}
                </option>
              ))}
            </select>
          </FilterBar>

          {/* ตัวเลขสรุป */}
          <div className={`row g-3 mb-3 ${loading && !isFirstLoad ? "opacity-50" : ""}`}>
            <KpiCard
              icon="fa-solid fa-sack-dollar"
              tone="blue"
              label={`รายได้รวมปี ${year}`}
              value={isFirstLoad ? "…" : `${baht(summary.total)} ฿`}
            />
            <KpiCard
              icon="fa-solid fa-receipt"
              tone="emerald"
              label="รายการชำระค่าบริการ"
              value={isFirstLoad ? "…" : `${baht(summary.count)} รายการ`}
            />
            <KpiCard
              icon="fa-solid fa-chart-line"
              tone="violet"
              label="เฉลี่ยต่อเดือน"
              value={isFirstLoad ? "…" : `${baht(Math.round(summary.average))} ฿`}
            />
            <KpiCard
              icon="fa-solid fa-trophy"
              tone="amber"
              label="เดือนที่รายได้สูงสุด"
              value={isFirstLoad ? "…" : summary.bestIndex >= 0 ? MONTH_LABELS[summary.bestIndex] : "-"}
              hint={summary.bestIndex >= 0 ? `${baht(summary.perMonth[summary.bestIndex])} ฿` : null}
            />
          </div>

          <div className="row g-3">
            {/* กราฟรายเดือน */}
            <div className="col-xl-8">
              <div className="card border-0 rounded-4 shadow-custom h-100">
                <div className="card-body p-4">
                  <div className="d-flex align-items-baseline justify-content-between mb-3">
                    <h5 className="fw-bold text-dark mb-0">
                      สรุปยอดขายรายเดือน ประจำปี {year}
                    </h5>
                    {summary.currentMonthIndex >= 0 && (
                      <span className="small text-muted">
                        <span className="legend-dot me-1"></span>เดือนปัจจุบัน
                      </span>
                    )}
                  </div>
                  <div className="chart-container w-100" style={{ height: "360px" }}>
                    {isFirstLoad ? (
                      <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                        <div className="spinner-border text-primary me-2" role="status"></div>
                        กำลังโหลดข้อมูลกราฟ...
                      </div>
                    ) : (
                      <Bar options={chartOptions} data={chartData} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* แพ็กเกจที่ทำรายได้สูงสุด */}
            <div className="col-xl-4">
              <div className="card border-0 rounded-4 shadow-custom h-100">
                <div className="card-body p-4">
                  <h5 className="fw-bold text-dark mb-3">แพ็กเกจยอดนิยม</h5>
                  {isFirstLoad ? (
                    <div className="text-muted small">กำลังโหลด...</div>
                  ) : summary.topPackages.length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <i className="fa-regular fa-folder-open fa-2x mb-2 d-block"></i>
                      ยังไม่มีการชำระค่าบริการในปีนี้
                    </div>
                  ) : (
                    <ul className="list-unstyled mb-0">
                      {summary.topPackages.map((pkg, index) => (
                        <li key={pkg.name} className="mb-3">
                          <div className="d-flex justify-content-between small mb-1">
                            <span className="fw-semibold text-dark text-truncate me-2">
                              <span className="rank-badge me-2">{index + 1}</span>
                              {pkg.name}
                            </span>
                            <span className="text-nowrap fw-bold">{baht(pkg.total)} ฿</span>
                          </div>
                          <div className="progress" style={{ height: "6px" }}>
                            <div
                              className="progress-bar"
                              style={{ width: `${topMax ? (pkg.total / topMax) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <div className="text-muted mt-1" style={{ fontSize: "0.75rem" }}>
                            {baht(pkg.count)} รายการ
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Template>
    </>
  );
}

export default Home;
