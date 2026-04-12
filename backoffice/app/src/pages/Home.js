import Template from "./Template";
import React, { useEffect, useState } from "react";
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
import Swal from "sweetalert2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

function Home() {
  const myDate = new Date();
  const [year, setYear] = useState(myDate.getFullYear());
  const [arrYear, setArrYear] = useState(() => {
    let arr = [];
    const y = myDate.getFullYear();
    const startYear = y - 5;

    for (let i = startYear; i <= y; i++) {
      arr.push(i);
    }
    return arr;
  });

  const [myData, setMyData] = useState({});

  // 🌟 แก้ไข 1: เอาคำว่า return ออก เพื่อให้ options ส่งไปให้ Chart.js ได้ถูกต้อง
  const [options, setOptions] = useState({
    responsive: true,
    maintainAspectRatio: false, // ช่วยให้เรากำหนดความสูงกราฟเองได้
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false, // ปิด title ของกราฟ เพราะเราทำ Header สวยๆ ไว้ด้านนอกแล้ว
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value.toLocaleString() + " ฿"; // ใส่สัญลักษณ์บาทในแกน Y
          },
        },
      },
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const url = config.api_path + "/changePackage/reportSumSalePerMonth";
      const payload = { year: year };

      await axios
        .post(url, payload, config.headers())
        .then((res) => {
          if (res.data.message === "success") {
            const results = res.data.results;

            // เตรียมกล่องใส่ข้อมูล 12 เดือน (ตั้งค่าเริ่มต้นเป็น 0)
            let arr = new Array(12).fill(0);

            // 🌟 แก้ไข 2: เติม .length เข้าไปใน loop และจับคู่เดือนให้เป๊ะ
            if (results && results.length > 0) {
              for (let i = 0; i < results.length; i++) {
                const item = results[i];
                // สมมติว่า item.month ส่งมาเป็นเลข 1-12 เราจับยัดลง Array index (0-11)
                const monthIndex = parseInt(item.month) - 1;
                if (monthIndex >= 0 && monthIndex <= 11) {
                  arr[monthIndex] = parseInt(item.sum);
                }
              }
            }

            const labels = [
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

            setMyData({
              labels: labels,
              datasets: [
                {
                  label: "รายได้รวม (บาท)",
                  data: arr,
                  backgroundColor: "rgba(13, 110, 253, 0.8)", // เปลี่ยนสีเป็นน้ำเงินพรีเมียม
                  borderColor: "rgba(13, 110, 253, 1)",
                  borderWidth: 1,
                  borderRadius: 6, // 🌟 ทำให้ขอบกราฟแท่งโค้งมน ดูล้ำขึ้น
                  hoverBackgroundColor: "rgba(11, 94, 215, 1)",
                },
              ],
            });
          }
        })
        .catch((err) => {
          throw err.response?.data || err;
        });
    } catch (e) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: e.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
        icon: "error",
      });
    }
  };

  return (
    <>
      <Template>
        <div className="p-4 bg-light min-vh-100">
          <div className="card border-0 rounded-4 shadow-custom overflow-hidden">
            {/* Header */}
            <div className="card-header bg-white py-4 border-0 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <div
                  className="bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center rounded-circle me-3"
                  style={{ width: "50px", height: "50px" }}
                >
                  <i className="fa-solid fa-chart-pie fs-5"></i>
                </div>
                <div>
                  <h5
                    className="mb-1 fw-bold text-dark"
                    style={{ letterSpacing: "0.5px" }}
                  >
                    Dashboard Overview
                  </h5>
                  <small className="text-muted fw-medium">
                    ภาพรวมรายได้และยอดขายของระบบ
                  </small>
                </div>
              </div>
            </div>

            {/* Filter */}
            <div
              className="card-body bg-white border-top border-bottom py-3"
              style={{ borderColor: "#f1f5f9" }}
            >
              <div className="row g-3 align-items-center">
                <div className="col-auto">
                  <div className="input-group shadow-sm rounded">
                    <span className="input-group-text bg-light border-end-0 text-muted fw-bold">
                      เลือกปี
                    </span>
                    <select
                      className="form-select border-start-0 cursor-pointer fw-medium text-dark"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    >
                      {arrYear.map((item, index) => (
                        <option key={index} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-auto">
                  <button
                    onClick={fetchData}
                    className="btn btn-primary px-4 fw-bold shadow-sm btn-search rounded-pill"
                  >
                    <i className="fa-solid fa-magnifying-glass me-2"></i>
                    แสดงข้อมูล
                  </button>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h5 className="fw-bold text-dark">
                  สรุปยอดขายรายเดือน ประจำปี {year}
                </h5>
              </div>

              <div
                className="chart-container w-100"
                style={{ height: "400px" }}
              >
                {/* 🌟 แก้ไข 3: เปลี่ยนจาก <bar> เป็น <Bar> ตัวพิมพ์ใหญ่ */}
                {myData?.datasets ? (
                  <Bar options={options} data={myData} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                    <div
                      className="spinner-border text-primary me-2"
                      role="status"
                    ></div>
                    กำลังโหลดข้อมูลกราฟ...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .shadow-custom { box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04) !important; }
          .btn-search {
            background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
            border: none; transition: all 0.2s ease;
          }
          .btn-search:hover {
            transform: translateY(-1px); box-shadow: 0 5px 15px rgba(13, 110, 253, 0.3) !important;
          }
          .btn-search:active { transform: scale(0.96); }
          .input-group .input-group-text, .input-group .form-select { border-color: #e2e8f0; }
          .input-group .form-select:focus { box-shadow: none; border-color: #cbd5e1; }
        `}</style>
      </Template>
    </>
  );
}

export default Home;
