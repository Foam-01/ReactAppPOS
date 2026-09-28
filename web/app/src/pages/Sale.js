import { useEffect, useState, useRef } from "react";
import { flushSync } from "react-dom";
import Template from "../components/Template";
import Swal, { DANGER_COLOR } from "../utils/swal";
import { closeModal } from "../utils/modal";
import { getErrorMessage } from "../utils/error";
import axios from "axios";
import config from "../config";
import EmptyState from "../components/EmptyState";
import PrintJS from "print-js";
import QtyModal from "./sale/QtyModal";
import EndSaleModal from "./sale/EndSaleModal";
import LastBillModal from "./sale/LastBillModal";
import BillTodayModal from "./sale/BillTodayModal";
import BillDetailModal from "./sale/BillDetailModal";
import ReceiptSlip from "./sale/ReceiptSlip";
import { Link } from "react-router-dom";
import { PageHeader, FilterBar, FilterBarClear } from "../components/PageHeader";
import { SearchBox } from "../components/ListToolbar";

const NO_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="110"><rect width="100%" height="100%" fill="#e9ecef"/><text x="50%" y="50%" fill="#6c757d" font-family="sans-serif" font-size="14" text-anchor="middle" dominant-baseline="middle">No Image</text></svg>',
  );

function Sale() {
  const [products, setProducts] = useState([]);
  const [, setBillSale] = useState({});
  const [currentBill, setCurrentBill] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [item, setItem] = useState({});
  const [inputMoney, setInputMoney] = useState(0);
  const [lastBill, setLastBill] = useState({});
  const [billToday, setBillToday] = useState([]);
  const [selectedBill, setSelectedBill] = useState({});
  const [memberInfo, setMemberInfo] = useState({});
  const [isEndingSale, setIsEndingSale] = useState(false);
  const [search, setSearch] = useState("");

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
      Swal.fire({ title: "เกิดข้อผิดพลาด", text: getErrorMessage(e), icon: "error" });
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
      Swal.fire({ title: "เกิดข้อผิดพลาด", text: getErrorMessage(e), icon: "error" });
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
      Swal.fire({ title: "เกิดข้อผิดพลาด", text: getErrorMessage(e), icon: "error" });
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
        title: "เกิดข้อผิดพลาด",
        text: getErrorMessage(e),
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
        confirmButtonText: "ลบ",
        confirmButtonColor: DANGER_COLOR,
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
        text: getErrorMessage(e),
        icon: "error",
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
            Toast.fire({ icon: "success", title: "แก้จำนวนแล้ว" });
            // ------------------------------------------

            closeModal();

            fetchBillSaleDetail();
          }
        })
        .catch((err) => {
          throw err;
        });
    } catch (e) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: getErrorMessage(e),
        icon: "error",
      });
    }
  };

  const handleEndSale = async () => {
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
        text: "เงินที่รับมาน้อยกว่ายอดที่ต้องชำระ",
      });
      return;
    }

    // ยอดเงินถูกตรวจแล้วใน modal ชำระเงิน จึงบันทึกได้ทันทีโดยไม่ต้องยืนยันซ้ำ
    if (isEndingSale) return;
    setIsEndingSale(true);
    try {
      const res = await axios.get(
        config.api_path + "/billSale/endSale",
        config.headers(),
      );
      if (res.data.message === "success") {
        // *** 3. รีเซ็ตค่าทุกอย่างให้เป็น 0 หลังจากขายเสร็จ ***
        setCurrentBill({});
        setTotalPrice(0);
        setInputMoney(0);

        openBill();
        fetchBillSaleDetail();

        closeModal();

        if (saleRef.current) {
          saleRef.current.refreshConuntBill();
        }

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "บันทึกการขายแล้ว",
          showConfirmButton: true,
          confirmButtonText: "พิมพ์ใบเสร็จ",
          timer: 6000,
          timerProgressBar: true,
        }).then((result) => {
          if (result.isConfirmed) handlePrint();
        });
      }
    } catch (e) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: getErrorMessage(e),
        icon: "error",
      });
    }
    setIsEndingSale(false);
  };

  const keyword = search.trim().toLowerCase();
  const filteredProducts = keyword
    ? products.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(keyword) ||
          String(p.barcode || "").toLowerCase() === keyword,
      )
    : products;

  // กด Enter ในช่องค้นหา: ถ้าบาร์โค้ดตรงหรือเหลือสินค้ารายการเดียว ให้เพิ่มลงบิลทันที
  const handleSearchEnter = (e) => {
    if (e.key !== "Enter" || !keyword) return;
    e.preventDefault();
    const exact = products.find(
      (p) => String(p.barcode || "").toLowerCase() === keyword,
    );
    const target = exact || (filteredProducts.length === 1 ? filteredProducts[0] : null);
    if (target) {
      handleSave(target);
      setSearch("");
    }
  };

  // คืนบิลล่าสุดให้ผู้เรียกใช้ต่อได้ (เช่น พิมพ์สลิป)
  const handleLastBill = async () => {
    let bill = null;
    try {
      await axios
        .get(config.api_path + "/billSale/lastBill", config.headers())
        .then((res) => {
          if (res.data.message === "success") {
            setLastBill(res.data.result[0]);
            bill = res.data.result[0];
          }
        })
        .catch((err) => {
          throw err;
        });
    } catch (e) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: getErrorMessage(e),
        icon: "error",
      });
    }
    return bill;
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
          throw err;
        });
    } catch (e) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: getErrorMessage(e),
        icon: "error",
      });
    }
  };

  const handlePrint = async () => {
    try {
      const [infoRes, bill] = await Promise.all([
        axios.get(config.api_path + "/member/info", config.headers()),
        handleLastBill(),
      ]);
      if (!bill) {
        Swal.fire({ title: "ยังไม่มีบิลที่ชำระแล้ว", icon: "info" });
        return;
      }

      // ต้องให้ React วาด #slip ด้วยข้อมูลใหม่ให้เสร็จก่อน PrintJS อ่าน DOM
      flushSync(() => {
        if (infoRes.data.message === "success") setMemberInfo(infoRes.data.result);
        setLastBill(bill);
      });

      PrintJS({
        printable: "slip",
        maxWidth: 250,
        type: "html",
      });
    } catch (e) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: getErrorMessage(e),
        icon: "error",
      });
    }
  };


  return (
    <>
      <Template ref={saleRef}>
        {/* มือถือ: แถบยอดรวมและปุ่มชำระเงินติดด้านล่าง ไม่ต้องเลื่อนผ่านรายการสินค้า */}
        {currentBill?.billSaleDetails?.length > 0 && (
          <>
            <div className="d-md-none" style={{ height: "76px" }}></div>
            <div
              className="d-md-none fixed-bottom bg-white border-top shadow-lg px-3 py-2 d-flex align-items-center"
              style={{ zIndex: 1030 }}
            >
              <div className="me-auto">
                <div className="small text-muted">
                  ยอดรวม ({currentBill.billSaleDetails.length} รายการ)
                </div>
                <div className="h5 mb-0 fw-bold">
                  {totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })} ฿
                </div>
              </div>
              <button
                data-toggle="modal"
                data-target="#modalEndSale"
                className="btn btn-success btn-lg fw-bold px-4 rounded-pill"
              >
                <i className="fa-solid fa-check-circle me-2"></i>ชำระเงิน
              </button>
            </div>
          </>
        )}
        <PageHeader
          eyebrow="ร้านค้า / ขายสินค้า"
          title="ขายสินค้า"
          description="เลือกหรือสแกนสินค้าเข้าบิล แล้วกดชำระเงินเพื่อปิดการขาย"
          count={`${filteredProducts.length.toLocaleString("th-TH")} รายการ`}
        />
        <FilterBar>
          <SearchBox
            className="fb-search"
            value={search}
            onChange={setSearch}
            placeholder="ค้นหาชื่อ หรือสแกนบาร์โค้ด แล้วกด Enter"
            onKeyDown={handleSearchEnter}
            autoFocus={window.innerWidth >= 768}
          />
          {search && <FilterBarClear onClick={() => setSearch("")} />}
        </FilterBar>
        <div className="row g-3">
          {/* ฝั่งซ้าย: รายการเลือกสินค้า (แบบธรรมดาอ่านง่าย) */}
          <div className="col-md-8">
            <div className="card shadow-sm border">
              <div
                className="card-body bg-light overflow-auto p-3"
                style={{ maxHeight: "75vh" }}
              >
                <div className="row g-2">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((item, index) => (
                      <div
                        className="col-lg-3 col-md-4 col-6 mb-2"
                        key={index}
                        onClick={(e) => handleSave(item)}
                      >
                        <div className="card h-100 border shadow-sm pointer hover-effect">
                          <div className="position-relative">
                            <img
                              className="card-img-top border-bottom"
                              loading="lazy"
                              decoding="async"
                              style={{ height: "110px", objectFit: "cover" }}
                              width="240"
                              height="110"
                              src={
                                item.productlmages?.[0]?.imageName
                                  ? config.api_path +
                                    "/uploads/thumb/" +
                                    item.productlmages[0].imageName
                                  : NO_IMAGE
                              }
                              // รูปย่อไม่ได้ → ลองรูปต้นฉบับ → ไม่ได้อีกใช้ NO_IMAGE
                              onError={(e) => {
                                const img = e.target;
                                const name = item.productlmages?.[0]?.imageName;
                                if (!img.dataset.fallback && name) {
                                  img.dataset.fallback = "original";
                                  img.src = config.api_path + "/uploads/" + name;
                                } else if (img.dataset.fallback !== "none") {
                                  img.dataset.fallback = "none";
                                  img.src = NO_IMAGE;
                                }
                              }}
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
                              <i className="fa-solid fa-plus me-1"></i> เลือก
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12">
                      {products.length > 0 ? (
                        <EmptyState icon="fa-magnifying-glass" text={`ไม่พบสินค้า "${search}"`} />
                      ) : (
                        <EmptyState
                          icon="fa-box-open"
                          text="ยังไม่มีสินค้าให้ขาย"
                          hint={<>เพิ่มสินค้าที่ <Link to="/product">หน้าสินค้า</Link> แล้วรับเข้าสต็อกก่อนเริ่มขาย</>}
                        />
                      )}
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
                    ยอดรวม
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
                  <i className="fa-solid fa-shopping-cart text-primary me-2"></i>{" "}
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
                    className="table table-hover align-middle mb-0"
                    style={{
                      minWidth: "350px",
                      tableLayout: "fixed",
                    }}
                  >
                    <thead className="table-light text-muted small fw-bold sticky-top">
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
                                style={{ fontSize: "0.75rem" }}
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
                                    className="fa-solid fa-pencil-alt"
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
                                    className="fa-solid fa-times-circle"
                                    style={{ fontSize: "16px" }}
                                  ></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4">
<EmptyState icon="fa-shopping-basket" text="ยังไม่มีรายการสินค้า" />
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
                    <i className="fa-solid fa-check-circle me-2"></i> ชำระเงิน
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
                        <i className="fa-solid fa-file-invoice me-1"></i> บิลวันนี้
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
                        <i className="fa-solid fa-history me-1"></i> บิลล่าสุด
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
        .hover-effect:hover { border-color: var(--color-primary) !important; transition: 0.2s; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #ced4da; border-radius: 10px; }
      `}</style>
      </Template>

      <QtyModal item={item} setItem={setItem} onSave={handleUpdataQty} />

      <EndSaleModal
        totalPrice={totalPrice}
        inputMoney={inputMoney}
        setInputMoney={setInputMoney}
        onEndSale={handleEndSale}
        isEndingSale={isEndingSale}
      />

      <LastBillModal lastBill={lastBill} onPrint={handlePrint} />

      <BillTodayModal billToday={billToday} onSelectBill={setSelectedBill} />

      <BillDetailModal bill={selectedBill} />

      <ReceiptSlip lastBill={lastBill} memberInfo={memberInfo} />
    </>
  );
}

export default Sale;
