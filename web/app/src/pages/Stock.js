import Template from "../components/Template";
import Swal from "sweetalert2";
import axios from "axios";
import config from "../config";
import Modal from "../components/Modal";
import { useEffect, useState } from "react";
import * as dayjs from "dayjs";

function Stock() {
  const [product, setProduct] = useState([]);
  const [productName, setProductName] = useState("");
  const [productId, setProductId] = useState(0);
  const [qty, setQty] = useState(1);
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    fetchDataStock();
  }, []);

  const fetchData = async () => {
    try {
      await axios
        .get(config.api_path + "/product/list", config.headers())
        .then((res) => {
          if (res.data.message === "success") {
            setProduct(res.data.results);
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

  const fetchDataStock = async () => {
    try {
      await axios
        .get(config.api_path + "/stock/list", config.headers())
        .then((res) => {
          if (res.data.message === "success") {
            setStocks(res.data.results);
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

  const handleChooseProduct = (item) => {
    setProductName(item.name);
    setProductId(item.id);

    const btns = document.getElementsByClassName("btnClose");
    for (let i = 0; i < btns.length; i++) btns[i].click();
  };

  const handleSave = async () => {
    try {
      const payload = {
        qty: qty,
        productId: productId,
      };

      // เพิ่ม payload เข้าไปใน axios.post
      await axios
        .post(config.api_path + "/stock/save", payload, config.headers())
        .then((res) => {
          if (res.data.message === "success") {
            fetchDataStock();
            setQty(1);

            // ปรับ Swal ให้เป็นแบบ Toast Notification (เด้งมุมจอ)
            const Toast = Swal.mixin({
              toast: true,
              position: "top-end", // มุมขวาบน
              showConfirmButton: false,
              timer: 2000, // แสดง 2 วินาที
              timerProgressBar: true,
            });

            Toast.fire({
              icon: "success",
              title: "บันทึกเข้า Stock เรียบร้อยแล้ว",
            });
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

  const handleDelete = (item) => {
    Swal.fire({
      title: "ยืนยันการลบ",
      text: "คุณต้องการลบรายการสต็อกนี้ใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await axios
            .delete(config.api_path + "/stock/delete/" + item.id,config.headers(),)
            .then((res) => {
              if (res.data.message === "success") {
                fetchDataStock();

                const Toast = Swal.mixin({
                  toast: true,
                  position: "top-end",
                  showConfirmButton: false,
                  timer: 2000,
                  timerProgressBar: true,
                });

                Toast.fire({
                  icon: "success",
                  title: "ลบข้อมูลเรียบร้อยแล้ว",
                });
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

  return (
    <>
      <Template>
        {/* ปรับ Card ให้ดูพรีเมียมด้วย Shadow และขอบมน */}
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-header bg-white py-3 border-bottom border-light">
            <div className="card-title h5 mb-0 fw-bold text-primary">
              <i className="fas fa-box-open me-2"></i>
              รับสินค้าเข้า Stock
            </div>
          </div>

          <div className="card-body">
            {/* ส่วน Input ปรับให้ดูเป็นระเบียบด้วย Row Gap */}
            <div className="row g-3 align-items-end mb-4">
              <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">
                  สินค้าที่เลือก
                </label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-light text-muted">
                    <i className="fa fa-tag"></i>
                  </span>
                  <input
                    disabled
                    value={productName}
                    className="form-control bg-white"
                    placeholder="โปรดเลือกสินค้า..."
                  />
                  <button
                    onClick={fetchData}
                    data-toggle="modal"
                    data-target="#modalProduct"
                    className="btn btn-primary px-3"
                  >
                    <i className="fa fa-search"></i>
                  </button>
                </div>
              </div>

              <div className="col-md-2">
                <label className="form-label small fw-bold text-muted">
                  จำนวนรับเข้า
                </label>
                <div className="input-group shadow-sm">
                  <input
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    type="number"
                    className="form-control"
                    placeholder="0"
                  />
                  <span className="input-group-text bg-light small">หน่วย</span>
                </div>
              </div>

              <div className="col-md-6">
                <button
                  onClick={handleSave}
                  className="btn btn-primary px-4 py-2 shadow-sm fw-bold rounded-3"
                >
                  <i className="fa fa-check me-2"></i>
                  บันทึกรายการ
                </button>
              </div>
            </div>

            {/* ตารางรายการสต็อก ปรับให้ดูอ่านง่ายสไตล์ Dashboard */}
            <div className="table-responsive rounded-3 border">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="small text-muted text-uppercase fw-bold">
                    <th className="py-3 ps-3">Barcode</th>
                    <th className="py-3">รายการสินค้า</th>
                    <th className="py-3 text-end">จำนวน</th>
                    <th className="py-3 text-center">วันที่รับเข้า</th>
                    <th width="120px" className="py-3 text-center">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.length > 0 ? (
                    stocks.map((item, index) => (
                      <tr key={index}>
                        <td className="ps-3 font-monospace small text-muted">
                          {item.product.barcode}
                        </td>
                        <td className="fw-bold text-dark">
                          {item.product.name}
                        </td>
                        <td className="text-end fw-bold text-primary">
                          {Number(item.qty).toLocaleString()}
                        </td>
                        <td className="text-center small text-muted">
                          {new Date(item.createdAt).toLocaleString("th-TH")}
                        </td>
                        <td className="text-center">
                          <button
                            onClick={(e) => handleDelete(item)}
                            className="btn btn-outline-danger btn-sm rounded-pill px-3"
                          >
                            <i className="fa fa-trash-alt me-1"></i>
                            ลบ
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-5 text-muted small"
                      >
                        <i className="fa fa-folder-open fa-2x d-block mb-2 opacity-25"></i>
                        ยังไม่มีข้อมูลการรับเข้าสต็อก
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Template>

      <Modal id="modalProduct" title="เลือกสินค้า" modalSize="modal-lg">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th width="180px"></th>
              <th width="150px">barcode</th>
              <th>รายการ</th>
            </tr>
          </thead>
          <tbody>
            {product.length > 0
              ? product.map((item) => (
                  <tr>
                    <td className="text-center">
                      <button
                        onClick={(e) => handleChooseProduct(item)}
                        className="btn btn-primary"
                      >
                        <i className="fa fa-check me-2"></i>
                        เลือกรายการ
                      </button>
                    </td>
                    <td>{item.barcode}</td>
                    <td>{item.name}</td>
                  </tr>
                ))
              : ""}
          </tbody>
        </table>
      </Modal>
    </>
  );
}

export default Stock;
