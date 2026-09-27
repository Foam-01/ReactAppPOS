import Template from "../components/Template";
import { PageHeader, FilterBar, FilterBarClear } from "../components/PageHeader";
import usePagedList from "../utils/usePagedList";
import { SearchBox, Pagination } from "../components/ListToolbar";
import Swal, { DANGER_COLOR } from "../utils/swal";
import { closeModal } from "../utils/modal";
import { getErrorMessage } from "../utils/error";
import axios from "axios";
import config from "../config";
import Modal from "../components/Modal";
import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState";

function Stock() {
  const [product, setProduct] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [productName, setProductName] = useState("");
  const [productId, setProductId] = useState(0);
  const [qty, setQty] = useState(1);
  const [stocks, setStocks] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const productKeyword = productSearch.trim().toLowerCase();
  const productOptions = productKeyword
    ? product.filter((p) => `${p.name} ${p.barcode}`.toLowerCase().includes(productKeyword))
    : product;
  const list = usePagedList(stocks, (s) => `${s.product?.name} ${s.product?.barcode}`);

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
        title: "เกิดข้อผิดพลาด",
        text: getErrorMessage(e),
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

  const handleChooseProduct = (item) => {
    setProductName(item.name);
    setProductId(item.id);

    closeModal();
  };

  // กันกดบันทึกซ้ำระหว่างรอ server
  const handleSave = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      await saveData(e);
    } finally {
      setIsSaving(false);
    }
  };

  const saveData = async () => {
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
              title: "รับสินค้าเข้าสต็อกแล้ว",
            });
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

  const handleDelete = (item) => {
    Swal.fire({
      title: "ยืนยันการลบ",
      text: "คุณต้องการลบรายการสต็อกนี้ใช่หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      confirmButtonColor: DANGER_COLOR,
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
              throw err;
            });
        } catch (e) {
          Swal.fire({
            title: "เกิดข้อผิดพลาด",
            text: getErrorMessage(e),
            icon: "error",
          });
        }
      }
    });
  };

  return (
    <>
      <Template>
        <PageHeader
          eyebrow="ร้านค้า / สต็อก"
          title="รับสินค้าเข้าสต็อก"
          description="เลือกสินค้า ระบุจำนวน แล้วบันทึกเพื่อเพิ่มยอดคงเหลือ"
          count={`${list.filtered.length.toLocaleString("th-TH")} รายการ`}
        />
        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="card-body">
            {/* ส่วน Input ปรับให้ดูเป็นระเบียบด้วย Row Gap */}
            <div className="row g-3 align-items-end mb-4">
              <div className="col-md-4">
                <label htmlFor="stock-field-1" className="form-label small fw-bold text-muted">
                  สินค้าที่เลือก
                </label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-light text-muted">
                    <i className="fa-solid fa-tag"></i>
                  </span>
                  <input id="stock-field-1"
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
                    <i className="fa-solid fa-search"></i>
                  </button>
                </div>
              </div>

              <div className="col-md-2">
                <label htmlFor="stock-field-2" className="form-label small fw-bold text-muted">
                  จำนวนรับเข้า
                </label>
                <div className="input-group shadow-sm">
                  <input id="stock-field-2"
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
                  disabled={isSaving}
                  className="btn btn-primary px-4 py-2 shadow-sm fw-bold rounded-3"
                >
                  <i className="fa-solid fa-check me-2"></i>
                  บันทึกรายการ
                </button>
              </div>
            </div>

            <FilterBar>
              <SearchBox className="fb-search" value={list.search} onChange={list.setSearch} placeholder="ค้นหาชื่อสินค้าหรือบาร์โค้ด" />
              {list.search && <FilterBarClear onClick={() => list.setSearch("")} />}
            </FilterBar>
            {/* ตารางรายการสต็อก ปรับให้ดูอ่านง่ายสไตล์ Dashboard */}
            <div className="table-responsive rounded-3 border">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small fw-bold">
                  <tr className="small text-muted text-uppercase fw-bold">
                    <th className="py-3 ps-3">บาร์โค้ด</th>
                    <th className="py-3">รายการสินค้า</th>
                    <th className="py-3 text-end">จำนวน</th>
                    <th className="py-3 text-center">วันที่รับเข้า</th>
                    <th width="120px" className="py-3 text-center">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.pageItems.length > 0 ? (
                    list.pageItems.map((item, index) => (
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
                            className="btn btn-outline-danger btn-icon"
                            title="ลบ"
                            aria-label="ลบ"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">
<EmptyState icon="fa-folder-open" text={list.search ? "ไม่พบรายการที่ค้นหา" : "ยังไม่มีข้อมูลการรับเข้าสต็อก"} />
</td>
                    </tr>
                  )}
                </tbody>
              </table>
<Pagination page={list.page} totalPages={list.totalPages} total={list.filtered.length} onChange={list.setPage} />
            </div>
          </div>
        </div>
      </Template>

      <Modal id="modalProduct" title="เลือกสินค้า" modalSize="modal-lg">
        <div className="mb-3">
          <SearchBox value={productSearch} onChange={setProductSearch} placeholder="ค้นหาชื่อสินค้าหรือบาร์โค้ด" />
        </div>
        <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light text-muted small fw-bold">
            <tr>
              <th width="180px"><span className="sr-only">เลือก</span></th>
              <th width="150px">บาร์โค้ด</th>
              <th>รายการ</th>
            </tr>
          </thead>
          <tbody>
            {productOptions.length > 0
              ? productOptions.map((item) => (
                  <tr key={item.id}>
                    <td className="text-center">
                      <button
                        onClick={(e) => handleChooseProduct(item)}
                        className="btn btn-primary"
                      >
                        <i className="fa-solid fa-check me-2"></i>
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
        </div>
      </Modal>
    </>
  );
}

export default Stock;
