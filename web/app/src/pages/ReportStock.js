import Template from "../components/Template";
import Swal from "sweetalert2";
import axios from "axios";
import config from "../config";
import Modal from "../components/Modal";
import { useEffect, useState } from "react";
import * as dayjs from "dayjs";

 function ReportStock() {
  const [stocks, setStocks] = useState([]);
  const [currentStock, setCurrentStock] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await axios
        .get(config.api_path + "/stock/report", config.headers())
        .then((res) => {
          if (res.data.message === "success") {
            setStocks(res.data.results);
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

  return (
    <>
      <Template>
        {/* ปรับ Card ให้ดูทันสมัยด้วยเงาจางๆ และขอบมนพรีเมียม */}
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-header bg-white py-3 border-bottom border-light">
            <div className="card-title h5 mb-0 fw-bold text-primary">
              <i className="fas fa-boxes me-2"></i>
              รายงานตรวจสอบสต็อกสินค้าคงเหลือ
            </div>
          </div>

          <div className="card-body p-0">
            {" "}
            {/* ปรับ Padding เป็น 0 เพื่อให้ตารางชิดขอบดู Clean */}
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small text-uppercase">
                  <tr>
                    <th className="py-3 ps-4">Barcode</th>
                    <th className="py-3">รายการสินค้า</th>
                    <th className="py-3 text-end">รับเข้า</th>
                    <th className="py-3 text-end">ขายออก</th>
                    <th className="py-3 text-end pe-4">คงเหลือ</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.length > 0 ? (
                    stocks.map((item, index) => (
                      <tr key={index}>
                        <td className="ps-4 font-monospace small text-muted">
                          {item.result.barcode}
                        </td>
                        <td className="fw-bold text-dark">
                          {item.result.name}
                        </td>
                        <td className="text-end text-success fw-medium">
                          <a
                            onClick={(e) => setCurrentStock(item)}
                            data-toggle="modal"
                            data-target="#modalStockIn"
                            className="btn btn-Link text-success"
                          >
                            {item.stockIn.toLocaleString()}
                          </a>
                        </td>
                        <td className="text-end text-danger fw-medium">
                          <a
                            onClick={(e) => setCurrentStock(item)}
                            data-toggle="modal"
                            data-target="#modalStockOut"
                            className="btn btn-Link text-danger"
                          >
                            {item.stockOut.toLocaleString()}
                          </a>
                        </td>
                        <td className="text-end pe-4">
                          <span
                            className={`badge rounded-pill px-3 py-2 ${
                              item.stockIn - item.stockOut > 0
                                ? "bg-primary-subtle text-primary"
                                : "bg-danger-subtle text-danger"
                            }`}
                            style={{ fontSize: "0.9rem" }}
                          >
                            {(item.stockIn - item.stockOut).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-muted">
                        <i className="fa fa-box-open fa-3x mb-3 d-block opacity-25"></i>
                        ไม่พบข้อมูลสต็อกสินค้า
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Template>

      <Modal
        id="modalStockIn"
        title="📦 ข้อมูลการรับเข้าสต็อก"
        modalSize="modal-lg"
      >
        {/* เพิ่ม maxHeight และ overflowY เพื่อจำกัดความสูงและเลื่อนดูได้ */}
        <div
          className="table-responsive rounded-3 border shadow-sm bg-white"
          style={{ maxHeight: "500px", overflowY: "auto" }}
        >
          <table className="table table-hover align-middle mb-0">
            {/* เพิ่ม sticky-top เพื่อให้หัวตารางค้างไว้ด้านบนเสมอ */}
            <thead className="table-light text-muted small text-uppercase fw-bold sticky-top">
              <tr>
                <th className="py-3 ps-3 border-0">Barcode</th>
                <th className="py-3 border-0">รายการสินค้า</th>
                <th className="py-3 text-end border-0">จำนวนรับเข้า</th>
                <th className="py-3 text-center border-0 pe-3">
                  วันที่ / เวลา
                </th>
              </tr>
            </thead>
            <tbody>
              {currentStock.result != undefined ? (
                currentStock.result.stocks.map((item, index) => (
                  <tr key={index}>
                    <td className="ps-3 font-monospace small text-muted">
                      {item.product.barcode}
                    </td>
                    <td className="fw-bold text-dark">{item.product.name}</td>
                    <td className="text-end fw-bold text-primary">
                      {Number(item.qty).toLocaleString()}
                    </td>
                    <td className="text-center pe-3">
                      <div className="small fw-medium text-dark">
                        {dayjs(item.createdAt).format("DD/MM/YYYY")}
                      </div>
                      <div className="small text-muted opacity-75">
                        <i className="far fa-clock me-1"></i>
                        {dayjs(item.createdAt).format("HH:mm")} น.
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted small">
                    ไม่พบข้อมูลการรับเข้าสต็อก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>

      <Modal
        id="modalStockOut"
        title="📦 รายละเอียดประวัติการขายสินค้า"
        modalSize="modal-lg"
      >
        {/* เพิ่ม maxHeight และ overflowY เพื่อให้เลื่อนดูได้เฉพาะในตาราง */}
        <div
          className="table-responsive rounded-3 border shadow-sm bg-white"
          style={{ maxHeight: "500px", overflowY: "auto" }}
        >
          <table className="table table-hover align-middle mb-0">
            {/* ส่วนหัวตาราง (ทำให้ติดอยู่กับที่เวลาเลื่อน - Sticky Header) */}
            <thead className="table-light sticky-top">
              <tr className="small text-uppercase fw-bold text-muted">
                <th className="py-3 ps-3 border-0">Barcode</th>
                <th className="py-3 border-0">รายการสินค้า</th>
                <th className="py-3 text-end border-0">จำนวนที่ขาย</th>
                <th className="py-3 text-center border-0 pe-3">
                  วันที่ / เวลาที่ขาย
                </th>
              </tr>
            </thead>
            <tbody>
              {currentStock.result != undefined ? (
                currentStock.result.billSaleDetails.map((item, index) => (
                  <tr key={index}>
                    <td className="ps-3 font-monospace small text-muted">
                      {item.product.barcode}
                    </td>
                    <td className="fw-bold text-dark">{item.product.name}</td>
                    <td className="text-end fw-bold text-danger">
                      - {Number(item.qty).toLocaleString()}
                    </td>
                    <td className="text-center pe-3">
                      <div className="small fw-medium text-dark">
                        {dayjs(item.createdAt).format("DD/MM/YYYY")}
                      </div>
                      <div className="small text-muted opacity-75">
                        <i className="far fa-clock me-1"></i>
                        {dayjs(item.createdAt).format("HH:mm")} น.
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted small">
                    ไม่พบประวัติการขาย
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>

      
    </>
  );
}

export default ReportStock;
