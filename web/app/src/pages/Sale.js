import { useEffect, useState, useRef } from "react";
import Template from "../components/Template";
import Swal from "sweetalert2";
import axios from "axios";
import config from "../config";
import Modal from "../components/Modal";
import * as dayjs from "dayjs";
import PrintJS from "print-js";

function Sale() {
  const [products, setProducts] = useState([]);
  const [billSale, setBillSale] = useState({});
  const [currentBill, setCurrentBill] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [item, setItem] = useState({});
  const [inputMoney, setInputMoney] = useState(0);
  const [lastBill, setLastBill] = useState({});
  const [billToday, setBillToday] = useState([]);
  const [selectedBill, setSelectedBill] = useState({});
  const [memberInfo, setMemberInfo] = useState({});

  const saleRef = useRef();

  useEffect(() => {
    fetchData();
    openBill();
    fetchBillSaleDetail();
  }, []);

  const fetchBillSaleDetail = async () => {
    try {
      await axios
        .get(config.api_path + "/billSale/currentBillInfo", config.headers())
        .then((res) => {
          if (res.data.results !== null) {
            setCurrentBill(res.data.results);
            sumTotalPrice(res.data.results.billSaleDetails);
          } else {
            // *** เพิ่มตรงนี้: ถ้าระบบส่ง null มา (บิลว่าง) ให้เคลียร์ค่าเป็น 0 ***
            setCurrentBill({});
            setTotalPrice(0);
          }
        });
    } catch (e) {
      Swal.fire({ title: "error", text: e.message, icon: "error" });
    }
  };

  const sumTotalPrice = (billSaleDetails) => {
    let sum = 0;

    for (let i = 0; i < billSaleDetails.length; i++) {
      console.log("i", i);
      const item = billSaleDetails[i];
      const qty = parseInt(item.qty);
      const price = parseInt(item.price);

      sum += qty * price;
    }

    setTotalPrice(sum);
  };

  const openBill = async () => {
    try {
      const res = await axios.get(
        config.api_path + "/billSale/openBill",
        config.headers(),
      );
      if (res.data.message === "success") {
        setBillSale(res.data.results);
      }
    } catch (e) {
      Swal.fire({ title: "error", text: e.message, icon: "error" });
    }
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(
        config.api_path + "/product/listForSale",
        config.headers(),
      );
      if (res.data.message === "success") {
        setProducts(res.data.results);
      }
    } catch (e) {
      Swal.fire({ title: "error", text: e.message, icon: "error" });
    }
  };

  const handleSave = async (item) => {
    try {
      await axios
        .post(config.api_path + "/billSele/sele", item, config.headers())
        .then((res) => {
          if (res.data.message === "success") {
            fetchBillSaleDetail();
          }
        });
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const handleDelete = async (item) => {
    try {
      const result = await Swal.fire({
        title: "ยืนยันการลบ?",
        text: `คุณต้องการลบรายการ "${item.product?.name || "สินค้า"}" ใช่หรือไม่?`,
        icon: "warning", // เปลี่ยนจาก question เป็น warning เพื่อความชัดเจน
        showCancelButton: true,
        confirmButtonColor: "#e11d48", // สีแดง Rose (โทนเดียวกับที่คุณชอบ)
        cancelButtonColor: "#64748b", // สีเทา Slate
        confirmButtonText: "ใช่, ลบเลย!",
        cancelButtonText: "ยกเลิก",
        reverseButtons: true, // เอาปุ่มยืนยันไว้ขวา (User มักจะถนัดแบบนี้)
      });

      if (result.isConfirmed) {
        // แสดง Loading เล็กน้อยระหว่างรอ API
        Swal.showLoading();

        const res = await axios.delete(
          `${config.api_path}/billSale/deleteItem/${item.id}`,
          config.headers(),
        );

        if (res.data.message === "success") {
          await fetchBillSaleDetail(); // รอโหลดข้อมูลใหม่

          // แจ้งเตือนเบาๆ มุมขวา (Toast) เมื่อลบสำเร็จ
          const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,

            didOpen: (toast) => {
              toast.addEventListener("mouseenter", Swal.stopTimer); // เอาเมาส์วางแล้วเวลาหยุด (เผื่ออ่านไม่ทัน)
              toast.addEventListener("mouseleave", Swal.resumeTimer); // เอาเมาส์ออกแล้วนับเวลาต่อ
            },
          });
          Toast.fire({ icon: "success", title: "ลบรายการเรียบร้อย" });
        }
      }
    } catch (e) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: e.message,
        icon: "error",
        confirmButtonColor: "#4f46e5",
      });
    }
  };

  const handleUpdataQty = async () => {
    try {
      axios
        .post(config.api_path + "/billSale/updateQty", item, config.headers())
        .then((res) => {
          if (res.data.message === "success") {
            // --- ส่วนของ Toast Notification ที่เพิ่มเข้ามา ---
            const Toast = Swal.mixin({
              toast: true,
              position: "top-end",
              showConfirmButton: false,
              timer: 2000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.addEventListener("mouseenter", Swal.stopTimer);
                toast.addEventListener("mouseleave", Swal.resumeTimer);
              },
            });
            Toast.fire({ icon: "success", title: "ปรับปรุงจำนวนเรียบร้อย" });
            // ------------------------------------------

            let btns = document.getElementsByClassName("btnClose");
            for (let i = 0; i < btns.length; i++) btns[i].click();

            fetchBillSaleDetail();
          }
        })
        .catch((err) => {
          throw err.response.data;
        });
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const handleEndSale = () => {
    // *** 1. ดักจับ: ถ้าไม่มีรายการสินค้าในบิล ห้ามทำต่อ ***
    if (
      !currentBill?.billSaleDetails ||
      currentBill.billSaleDetails.length === 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "ไม่สามารถจบการขายได้",
        text: "กรุณาเลือกสินค้าอย่างน้อย 1 รายการก่อนทำการชำระเงิน",
      });
      return;
    }

    // *** 2. ดักจับ: ถ้าเงินที่รับมา น้อยกว่ายอดรวม ห้ามทำต่อ ***
    if (inputMoney < totalPrice) {
      Swal.fire({
        icon: "error",
        title: "ยอดเงินไม่ถูกต้อง",
        text: "จำนวนเงินที่รับมาน้อยกว่ายอดชำระ",
      });
      return;
    }

    Swal.fire({
      title: "จบการขาย",
      text: "ยืนยันจบการขาย",
      icon: "question",
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonColor: "#198754",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await axios
            .get(config.api_path + "/billSale/endSale", config.headers())
            .then((res) => {
              if (res.data.message === "success") {
                const Toast = Swal.mixin({
                  toast: true,
                  position: "top-end",
                  showConfirmButton: false,
                  timer: 2000,
                  timerProgressBar: true,
                });
                Toast.fire({ icon: "success", title: "จบการขายสำเร็จแล้ว" });

                // *** 3. รีเซ็ตค่าทุกอย่างให้เป็น 0 หลังจากขายเสร็จ ***
                setCurrentBill({});
                setTotalPrice(0);
                setInputMoney(0);

                openBill();
                fetchBillSaleDetail();

                let btns = document.getElementsByClassName("btnClose");
                for (let i = 0; i < btns.length; i++) btns[i].click();

                if (saleRef.current) {
                  saleRef.current.refreshConuntBill();
                }
              }
            })
            .catch((err) => {
              throw err.response.data;
            });
        } catch (e) {
          Swal.fire({
            title: "error",
            text: e.message,
            icon: "error",
          });
        }
      }
    });
  };

  const handleLastBill = async () => {
    try {
      await axios
        .get(config.api_path + "/billSale/lastBill", config.headers())
        .then((res) => {
          if (res.data.message === "success") {
            setLastBill(res.data.result[0]);
          }
        })
        .catch((err) => {
          throw err.response.data;
        });
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const handleBillToday = async () => {
    try {
      await axios
        .get(config.api_path + "/billSale/billToday", config.headers())
        .then((res) => {
          if (res.data.message === "success") {
            setBillToday(res.data.results);
          }
        })
        .catch((err) => {
          throw err.response.data;
        });
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  const handlePrint = async () => {
    try {
      await axios
        .get(config.api_path + "/member/info", config.headers())
        .then((res) => {
          if (res.data.message === "success") {
            setMemberInfo(res.data.result);
            
          }
        })
        .catch((err) => {
          throw err.response.data;
        });

       handleLastBill();

       
        PrintJS({
          printable: "slip",
          maxWidth: 250,
          type: "html",
        });


    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };

  return (
    <>
      <Template ref={saleRef}>
        <div className="row g-3">
          {/* ฝั่งซ้าย: รายการเลือกสินค้า (แบบธรรมดาอ่านง่าย) */}
          <div className="col-md-8">
            <div className="card shadow-sm border">
              <div className="card-header bg-white py-3 border-bottom">
                <h5 className="mb-0 fw-bold text-dark">
                  <i className="fa fa-th-large text-primary me-2"></i>{" "}
                  รายการสินค้า
                </h5>
              </div>
              <div
                className="card-body bg-light overflow-auto p-3"
                style={{ maxHeight: "75vh" }}
              >
                <div className="row g-2">
                  {products.length > 0 ? (
                    products.map((item, index) => (
                      <div
                        className="col-lg-3 col-md-4 col-6 mb-2"
                        key={index}
                        onClick={(e) => handleSave(item)}
                      >
                        <div className="card h-100 border shadow-sm pointer hover-effect">
                          <div className="position-relative">
                            <img
                              className="card-img-top border-bottom"
                              style={{ height: "110px", objectFit: "cover" }}
                              src={
                                item.productlmages?.[0]?.imageName
                                  ? config.api_path +
                                    "/uploads/" +
                                    item.productlmages[0].imageName
                                  : "https://via.placeholder.com/150?text=No+Image"
                              }
                              alt={item.name}
                            />
                            <div className="position-absolute bottom-0 end-0 bg-primary text-white px-2 py-1 small fw-bold">
                              {Number(item.price).toLocaleString()}.-
                            </div>
                          </div>
                          <div className="card-body p-2 d-flex flex-column text-center">
                            <div
                              className="fw-bold text-dark text-truncate small mb-2"
                              title={item.name}
                            >
                              {item.name}
                            </div>
                            <button className="btn btn-primary btn-sm w-100 mt-auto fw-bold">
                              <i className="fa fa-plus me-1"></i> เลือก
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12 text-center py-5">
                      <p className="text-muted">ไม่พบข้อมูลสินค้า</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ฝั่งขวา: รายการในบิลและการสรุปยอด */}
          <div className="col-md-4">
            <div className="card shadow-sm border h-100">
              <div className="card-body p-3 d-flex flex-column">
                {/* ส่วนแสดงยอดเงินรวม (แบบเครื่องคิดเงินมาตรฐาน) */}
                <div
                  className="p-3 rounded border mb-3 text-end"
                  style={{ backgroundColor: "#212529" }}
                >
                  <div className="text-secondary small fw-bold mb-1 text-uppercase">
                    Total Amount
                  </div>
                  <div
                    className="h1 mb-0 fw-bold"
                    style={{ color: "#70FE3F", fontFamily: "monospace" }}
                  >
                    {/* เติม () หลัง toLocaleString และใส่ 2 เพื่อแสดงทศนิยม 2 ตำแหน่งแบบเครื่องคิดเงิน */}
                    {totalPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>

                <div className="h6 fw-bold text-dark mb-3">
                  <i className="fa fa-shopping-cart text-primary me-2"></i>{" "}
                  รายการขาย
                </div>

                <div
                  className="table-responsive flex-grow-1 border rounded bg-white"
                  style={{
                    minHeight: "35vh",
                    maxHeight: "50vh",
                    overflowY: "auto",
                    overflowX: "auto",
                  }}
                >
                  <table
                    className="table table-striped table-hover align-middle mb-0"
                    style={{
                      minWidth: "350px",
                      tableLayout: "fixed",
                    }}
                  >
                    <thead className="table-light small sticky-top">
                      <tr>
                        {/* แบ่งสัดส่วน % ให้ชัดเจน */}
                        <th className="ps-2" style={{ width: "40%" }}>
                          สินค้า
                        </th>
                        <th className="text-center" style={{ width: "20%" }}>
                          จำนวน
                        </th>
                        <th className="text-end" style={{ width: "20%" }}>
                          รวม
                        </th>
                        <th
                          className="text-center"
                          style={{ width: "20%" }}
                        ></th>{" "}
                        {/* ล็อกพื้นที่ปุ่มไว้ 20% */}
                      </tr>
                    </thead>

                    <tbody className="small">
                      {currentBill?.billSaleDetails?.length > 0 ? (
                        currentBill.billSaleDetails.map((item, index) => (
                          <tr key={index}>
                            <td className="ps-3 py-2">
                              <div
                                className="fw-bold text-truncate"
                                style={{ width: "100%" }}
                                title={item.product?.name}
                              >
                                {item.product?.name || "ไม่มีชื่อสินค้า"}
                              </div>
                              <div
                                className="text-muted"
                                style={{ fontSize: "10px" }}
                              >
                                {Number(item.price).toLocaleString()} x{" "}
                                {item.qty}
                              </div>
                            </td>

                            <td className="text-center fw-bold">{item.qty}</td>

                            <td className="text-end fw-bold text-primary">
                              {(item.price * item.qty).toLocaleString()}
                            </td>

                            <td className="text-center px-1">
                              <div className="d-flex justify-content-center gap-1">
                                {/* ปุ่มแก้ไข - ปรับให้เล็กลง */}
                                <button
                                  onClick={(e) => setItem(item)}
                                  data-toggle="modal"
                                  data-target="#modalQty"
                                  className="btn btn-sm text-primary p-1 border-0 shadow-none"
                                  style={{ background: "transparent" }}
                                >
                                  <i
                                    className="fa fa-pencil-alt"
                                    style={{ fontSize: "14px" }}
                                  ></i>
                                </button>
                                {/* ปุ่มลบ */}
                                <button
                                  className="btn btn-sm text-danger p-1 border-0 shadow-none"
                                  onClick={(e) => handleDelete(item)}
                                  style={{ background: "transparent" }}
                                >
                                  <i
                                    className="fa fa-times-circle"
                                    style={{ fontSize: "16px" }}
                                  ></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center py-5 text-muted opacity-50"
                          >
                            <i className="fa fa-shopping-basket fa-3x mb-3 d-block"></i>
                            ยังไม่มีรายการสินค้า
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ปุ่มควบคุมด้านล่าง */}
                <div
                  className="mt-4 pt-4 border-top"
                  style={{ borderColor: "#f0f0f0" }}
                >
                  <button
                    data-toggle="modal"
                    data-target="#modalEndSale"
                    className="btn btn-lg w-100 py-3 fw-bold mb-3 shadow-sm border-0"
                    // *** เพิ่มบรรทัดนี้: ปิดปุ่มถ้าไม่มีสินค้า ***
                    disabled={
                      !currentBill?.billSaleDetails ||
                      currentBill.billSaleDetails.length === 0
                    }
                    style={{
                      backgroundColor: "#28a745",
                      backgroundImage:
                        "linear-gradient(45deg, #28a745, #34ce57)",
                      color: "white",
                      borderRadius: "12px",
                      // ทำให้ปุ่มดูซีดลงเวลากดไม่ได้
                      opacity:
                        !currentBill?.billSaleDetails ||
                        currentBill.billSaleDetails.length === 0
                          ? 0.5
                          : 1,
                    }}
                  >
                    <i className="fa fa-check-circle me-2"></i> ยืนยันการขาย
                  </button>

                  <div className="row g-2">
                    <div className="col-6">
                      <button
                        onClick={handleBillToday}
                        data-toggle="modal"
                        data-target="#modalBillToday"
                        className="btn w-100 py-2 border-0"
                        style={{
                          backgroundColor: "#eef2ff", // Soft Blue/Indigo
                          color: "#4f46e5",
                          borderRadius: "10px",
                        }}
                      >
                        <i className="fa fa-file-invoice me-1"></i> บิลวันนี้
                      </button>
                    </div>

                    <div className="col-6">
                      <button
                        data-toggle="modal"
                        data-target="#modalLastBill"
                        onClick={handleLastBill}
                        className="btn w-100 py-2 border-0"
                        style={{
                          backgroundColor: "#fff7ed", // Soft Orange/Amber
                          color: "#ea580c", // Deep Orange
                          borderRadius: "10px",
                        }}
                      >
                        {/* เปลี่ยนไอคอนเป็นประวัติ (history) หรือนาฬิกา (clock) */}
                        <i className="fa fa-history me-1"></i> บิลล่าสุด
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
        .hover-effect:hover { border-color: #0d6efd !important; transition: 0.2s; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #ced4da; border-radius: 10px; }
      `}</style>
      </Template>

      <Modal id="modalQty" title="แก้ไขจำนวน" modalSize="modal-sm">
        <div className="p-3 p-md-4">
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-3"
              style={{ width: "60px", height: "60px" }}
            >
              <i className="fa fa-calculator fa-2x"></i>
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
                <i className="fa fa-minus text-danger fs-5"></i>
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
                <i className="fa fa-plus text-success fs-5"></i>
              </button>
            </div>
          </div>

          {/* ปุ่มบันทึก */}
          <div className="d-grid mt-2">
            <button
              onClick={handleUpdataQty}
              className="btn btn-primary btn-lg fw-bold border-0 shadow-sm py-3 rounded-pill d-flex align-items-center justify-content-center hover-up"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
              }}
            >
              <i className="fa fa-check-circle me-2 fs-5"></i>
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
            <label
              className="text-secondary small fw-bold text-uppercase mb-2 d-block"
              style={{ letterSpacing: "1px" }}
            >
              ยอดรวมที่ต้องชำระ (Total Due)
            </label>
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
              <label className="form-label fw-bold text-dark small text-uppercase">
                รับเงินสด (Cash Received)
              </label>
              <div className="input-group input-group-lg shadow-sm">
                <span className="input-group-text bg-white border-end-0">
                  <i className="fa fa-money-bill-wave text-muted"></i>
                </span>
                <input
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
                      ? "เงินทอน (Change)"
                      : "ยอดค้างชำระ (Remaining)"}
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
                <i className="fa fa-mouse-pointer me-2 small"></i>
                จ่ายพอดี
              </button>
            </div>
            <div className="col-6">
              <button
                onClick={handleEndSale}
                className="btn btn-dark btn-lg w-100 py-3 fw-bold rounded-3 shadow border-0"
                disabled={inputMoney - totalPrice < 0}
                style={{ transition: "all 0.2s" }}
              >
                <i className="fa fa-check-circle me-2"></i>
                จบการขาย
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

      <Modal
        id="modalLastBill"
        title="🧾 รายละเอียดบิลล่าสุด"
        modalSize="modal-lg"
      >
        <div className="p-2">
          {/* สรุปข้อมูลหัวบิลสั้นๆ */}
          <div className="d-flex justify-content-between mb-3 small text-muted px-2">
            <span>
              เลขที่บิล:{" "}
              <span className="fw-bold text-dark">{lastBill?.id || "-"}</span>
            </span>
            <span>
              วันที่:{" "}
              <span className="fw-bold text-dark">
                {lastBill?.createdAt
                  ? new Date(lastBill.createdAt).toLocaleDateString()
                  : "-"}
              </span>
            </span>
          </div>

          <div
            className="table-responsive border rounded shadow-sm"
            style={{ maxHeight: "60vh" }}
          >
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light sticky-top">
                <tr
                  className="small text-uppercase"
                  style={{ letterSpacing: "0.5px" }}
                >
                  <th className="ps-3" width="150">
                    Barcode
                  </th>
                  <th>รายการสินค้า</th>
                  <th className="text-end" width="100">
                    ราคา
                  </th>
                  <th className="text-center" width="80">
                    จำนวน
                  </th>
                  <th className="text-end pe-3" width="120">
                    ยอดรวม
                  </th>
                </tr>
              </thead>
              <tbody className="small">
                {lastBill?.billSaleDetails !== undefined &&
                lastBill.billSaleDetails.length > 0 ? (
                  lastBill.billSaleDetails.map((item, index) => (
                    <tr key={index}>
                      <td className="ps-3 text-muted">
                        {item.product.barcode}
                      </td>
                      <td>
                        <div className="fw-bold">{item.product.name}</div>
                      </td>
                      <td className="text-end">
                        {Number(item.price).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="text-center fw-bold text-primary bg-light">
                        {item.qty}
                      </td>
                      <td className="text-end pe-3 fw-bold">
                        {(item.price * item.qty).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      <i className="fa fa-file-invoice fa-2x mb-2 d-block opacity-25"></i>
                      ไม่พบข้อมูลรายการในบิลนี้
                    </td>
                  </tr>
                )}
              </tbody>
              {/* ส่วนสรุปท้ายตาราง */}
              <tfoot className="table-light fw-bold">
                <tr>
                  <td colSpan="4" className="text-end">
                    รวมทั้งสิ้น (Total)
                  </td>
                  <td className="text-end pe-3 text-primary h5 mb-0 fw-bold">
                    {lastBill?.billSaleDetails
                      ?.reduce((sum, item) => sum + item.price * item.qty, 0)
                      .toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="text-center mt-4 mb-2">
            <button
              onClick={handlePrint}
              className="btn btn-primary px-4 rounded-pill ms-2 shadow-sm"
            >
              <i className="fa fa-print me-2"></i> พิมพ์บิลอีกครั้ง
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        id="modalBillToday"
        title="📅 รายการบิลของวันนี้"
        modalSize="modal-lg"
      >
        <div className="p-2">
          <div className="table-responsive border rounded-3 overflow-hidden shadow-sm">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-uppercase fw-bold text-muted">
                  <th width="120px" className="text-center py-3 border-0"></th>
                  <th className="py-3 border-0">เลขบิล</th>
                  <th className="py-3 border-0 text-end pe-4">
                    วัน เวลาที่ขาย
                  </th>
                </tr>
              </thead>
              <tbody>
                {billToday.length > 0 ? (
                  billToday.map((item, index) => (
                    <tr key={index}>
                      <td className="text-center py-2">
                        {/* เพิ่มคลาส text-nowrap เข้าไปครับ */}
                        <button
                          onClick={(e) => setSelectedBill(item)}
                          data-toggle="modal"
                          data-target="#modalBillSaleDetail"
                          className="btn btn-sm btn-primary rounded-pill px-3 shadow-sm d-inline-flex align-items-center justify-content-center text-nowrap"
                          style={{ height: "32px", fontSize: "0.85rem" }}
                        >
                          <i
                            className="fa fa-eye me-1"
                            style={{ fontSize: "0.9rem" }}
                          ></i>
                          ดูรายการ
                        </button>
                      </td>
                      <td className="fw-bold text-dark fs-6">#{item.id}</td>
                      <td className="text-end pe-4 text-muted">
                        {/* จัด Badge ให้ตรงกลางเหมือนกัน */}
                        <span className="badge bg-light text-dark fw-normal border d-inline-flex align-items-center px-2 py-1">
                          <i className="fa fa-clock me-2 opacity-50"></i>
                          {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-5 text-muted">
                      <i className="fa fa-folder-open fa-3x mb-3 d-block opacity-25"></i>
                      ยังไม่มีรายการขายในวันนี้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      <Modal
        id="modalBillSaleDetail"
        title="🧾 รายละเอียดสินค้าในบิล"
        modalSize="modal-lg"
      >
        <div className="p-0">
          {" "}
          {/* ปรับ padding เป็น 0 เพื่อให้ตารางชิดขอบ Modal */}
          <div
            className="table-responsive border-0"
            style={{
              maxHeight: "70vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <table className="table table-hover align-middle mb-0">
              <thead
                className="table-light sticky-top"
                style={{ zIndex: 10, top: 0 }}
              >
                <tr className="small text-uppercase fw-bold text-muted border-bottom">
                  <th className="ps-3 py-3">Barcode</th>
                  <th className="py-3">รายการสินค้า</th>
                  <th className="py-3 text-end">ราคา</th>
                  <th className="py-3 text-center">จำนวน</th>
                  <th className="py-3 text-end pe-3">ยอดรวม</th>
                </tr>
              </thead>

              <tbody>
                {selectedBill?.billSaleDetails?.length > 0 ? (
                  selectedBill.billSaleDetails.map((item, index) => (
                    <tr key={index}>
                      <td className="ps-3 text-muted small">
                        {item.product.barcode}
                      </td>
                      <td className="fw-bold">{item.product.name}</td>
                      <td className="text-end font-monospace">
                        {Number(item.price).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark border fw-normal px-3">
                          {item.qty}
                        </span>
                      </td>
                      <td className="text-end pe-3 fw-bold text-primary font-monospace">
                        {(item.price * item.qty).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-5 text-muted font-italic"
                    >
                      <i className="fa fa-info-circle fa-2x mb-2 d-block opacity-25"></i>
                      ไม่พบข้อมูลรายการสินค้าในบิลนี้
                    </td>
                  </tr>
                )}
              </tbody>

              {/* ยอดรวมล็อกไว้ด้านล่าง (Sticky Footer) */}
              {selectedBill?.billSaleDetails?.length > 0 && (
                <tfoot
                  className="sticky-bottom bg-white"
                  style={{
                    zIndex: 10,
                    bottom: 0,
                    boxShadow: "0 -2px 10px rgba(0,0,0,0.05)", // เพิ่มเงาให้ดูมีมิติ
                  }}
                >
                  <tr className="border-top border-2">
                    <td colSpan="4" className="text-end fw-bold py-3 bg-light">
                      ยอดรวมทั้งสิ้น (Total):
                    </td>
                    <td className="text-end pe-3 py-3 fw-bold h5 mb-0 text-primary font-monospace bg-light">
                      {selectedBill.billSaleDetails
                        .reduce((sum, i) => sum + i.price * i.qty, 0)
                        .toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </Modal>

      <div
        id="slip"
        className="receipt-paper mx-auto bg-white text-dark p-3 shadow-sm"
      >
        <style>{`
          .receipt-paper {
            width: 80mm;
            max-width: 100%;
            font-family: 'Courier New', Courier, monospace, 'Sarabun', sans-serif;
            font-size: 12px;
            color: #000;
          }
          .receipt-paper * {
            line-height: 1.4 !important;
          }
          .receipt-paper p, .receipt-paper div, .receipt-paper td { margin: 0; padding: 0; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          .fw-bold { font-weight: bold; }
          .dashed-line { border-bottom: 1px dashed #000; margin: 8px 0; height: 1px; }
          table.w-100 { width: 100%; }
          table td { vertical-align: top; padding: 2px 0; }

          /* 🌟 โค้ดบังคับให้ปริ้นต์สีดำและเส้นต่างๆ ออกมาให้ครบ 🌟 */
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body * { visibility: hidden; }
            #slip, #slip * { visibility: visible; color: #000 !important; }
            #slip { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 80mm; 
              padding: 0; margin: 0;
              box-shadow: none !important; border: none !important;
            }
            @page { size: auto; margin: 0mm; }
          }
        `}</style>

        {lastBill && lastBill.id ? (
          <>
            <div className="text-center mb-2">
              <div className="fw-bold" style={{ fontSize: "18px" }}>
                POS ON CLOUD
              </div>
              <div>123 ถ.ตัวอย่าง แขวงทดสอบ</div>
              <div>เขตจำลอง กรุงเทพฯ 10000</div>
              <div>TAX ID: 0105555000000</div>
              <div className="fw-bold mt-2" style={{ fontSize: "14px" }}>
                ใบเสร็จรับเงิน / ย่อ
              </div>
              <div>(RECEIPT)</div>
            </div>

            <table className="w-100 mt-2">
              <tbody>
                <tr>
                  <td className="text-left">เลขที่บิล (No):</td>
                  <td className="text-right fw-bold">#{lastBill.id}</td>
                </tr>
                <tr>
                  <td className="text-left">วันที่ (Date):</td>
                  <td className="text-right">
                    {dayjs(lastBill.createdAt).format("DD/MM/YYYY HH:mm")}
                  </td>
                </tr>
                <tr>
                  <td className="text-left">พนักงาน:</td>
                  <td className="text-right">{memberInfo?.name || "Admin"}</td>
                </tr>
              </tbody>
            </table>

            <div className="dashed-line"></div>

            <table className="w-100">
              <thead>
                <tr className="fw-bold">
                  <td className="text-left">รายการ (Item)</td>
                  <td className="text-right">รวม</td>
                </tr>
              </thead>
              {lastBill.billSaleDetails?.map((item, index) => (
                <tbody key={index}>
                  <tr>
                    <td colSpan="2" className="text-left fw-bold pt-1">
                      {item.product?.name || "ไม่ระบุชื่อ"}
                    </td>
                  </tr>
                  <tr>
                    <td
                      className="text-left text-muted"
                      style={{ paddingLeft: "10px" }}
                    >
                      {item.qty} x {Number(item.price).toLocaleString("th-TH")}
                    </td>
                    <td className="text-right">
                      {(item.qty * item.price).toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                </tbody>
              ))}
            </table>

            <div className="dashed-line"></div>

            {/* 🌟 ส่วนตารางสรุปยอดที่แก้ Logic เข้าไปแล้ว 🌟 */}
            {(() => {
              // คำนวณยอดรวมของบิลนี้
              const billTotal =
                lastBill.billSaleDetails?.reduce(
                  (sum, item) => sum + item.price * item.qty,
                  0,
                ) || 0;
              // ถ้า Backend ส่งยอดที่รับมาให้ (lastBill.pay) ก็ใช้ค่านั้น ถ้าไม่มีก็ถือว่าจ่ายพอดีเป๊ะ
              const cashReceived = lastBill.pay
                ? Number(lastBill.pay)
                : billTotal;
              // คำนวณเงินทอน
              const change = cashReceived - billTotal;

              return (
                <table className="w-100">
                  <tbody>
                    <tr>
                      <td className="text-left">รวมเป็นเงิน:</td>
                      <td className="text-right">
                        {billTotal.toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                    <tr className="fw-bold" style={{ fontSize: "14px" }}>
                      <td className="text-left py-1">ยอดสุทธิ (TOTAL):</td>
                      <td className="text-right py-1">
                        {billTotal.toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-left">รับเงินสด:</td>
                      <td className="text-right">
                        {cashReceived.toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-left">เงินทอน:</td>
                      <td className="text-right">
                        {change.toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              );
            })()}

            <div className="dashed-line"></div>

            <div className="text-center mt-3 pb-4">
              <div className="fw-bold">ขอบคุณที่ใช้บริการ</div>
              <div>Thank you, please come again.</div>

              <div className="mt-3">
                <svg
                  width="140"
                  height="35"
                  viewBox="0 0 120 30"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 0h4v30H0zM6 0h2v30H6zM10 0h6v30h-6zM20 0h2v30h-2zM26 0h8v30h-8zM36 0h2v30h-2zM42 0h4v30h-4zM50 0h6v30h-6zM58 0h2v30h-2zM64 0h4v30h-4zM72 0h2v30h-2zM78 0h8v30h-8zM88 0h2v30h-2zM92 0h4v30h-4zM100 0h6v30h-6zM108 0h2v30h-2zM114 0h6v30h-6z"
                    fill="#000"
                  />
                </svg>
                <div
                  style={{
                    fontSize: "11px",
                    letterSpacing: "4px",
                    marginTop: "2px",
                  }}
                >
                  {String(lastBill.id).padStart(10, "0")}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-5 text-muted">
            <i className="fa-solid fa-receipt fa-2x mb-2 opacity-50"></i>
            <div>ไม่พบข้อมูลสลิป</div>
          </div>
        )}
      </div>
    </>
  );
}

export default Sale;
