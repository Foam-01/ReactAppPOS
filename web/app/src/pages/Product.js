import Template from "../components/Template";
import usePagedList from "../utils/usePagedList";
import { SearchBox, Pagination } from "../components/ListToolbar";
import Swal, { DANGER_COLOR } from "../utils/swal";
import { closeModal } from "../utils/modal";
import { getErrorMessage } from "../utils/error";
import config from "../config";
import axios from "axios";
import { useState, useEffect } from "react";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import { PageHeader, FilterBar, FilterBarButton, FilterBarClear } from "../components/PageHeader";

function Product() {
  const [product, setProduct] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [productImage, setProductImage] = useState({});
  const [productImages, setProductImages] = useState([]);
  const list = usePagedList(products, (p) => `${p.name} ${p.barcode}`);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await axios
        .get(config.api_path + "/product/list", config.headers())
        .then((res) => {
          if (res.data.message === "success") {
            setProducts(res.data.results);
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

  const saveData = async (e) => {
    e.preventDefault();
    try {
      let url = config.api_path + "/product/insert";

      if (product.id !== undefined) {
        url = config.api_path + "/product/update";
      }

      const res = await axios.post(url, product, config.headers());
      if (res.data.message === "success") {
        Swal.fire({
          title: "บันทึกข้อมูล",
          text: "บันทึกข้อมูลเรียบร้อยแล้ว",
          icon: "success",
          timer: 2000, // เพิ่มให้ปิดเองอัตโนมัติเพื่อความลื่นไหล
        });
        // อาจจะเคลียร์ฟอร์มหลังบันทึกเสร็จ
        // setProduct({});
        fetchData();
        handleClose();
        clearForm();
      }
    } catch (e) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: getErrorMessage(e), // แสดง Error จริงจาก Server
        icon: "error",
      });
    }
  };

  const clearForm = () => {
    setProduct({
      name: "",
      detail: "",
      price: "",
      cost: "",
      barcode: "",
    });
  };

  const handleClose = () => {
    closeModal();
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: "ลบข้อมูล",
      text: "ต้องการลบสินค้านี้ใช่ไหม",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      confirmButtonColor: DANGER_COLOR,
      cancelButtonText: "ยกเลิก",
    }).then(async (res) => {
      // *** จุดสำคัญ: ต้องเช็คว่ากดยืนยันจริงๆ หรือไม่ ***
      if (res.isConfirmed) {
        try {
          const response = await axios.delete(
            config.api_path + "/product/delete/" + item.id,
            config.headers(),
          );

          if (response.data.message === "success") {
            fetchData();
            Swal.fire({
              title: "ลบข้อมูล",
              text: "ลบสินค้าแล้ว",
              icon: "success",
              timer: 2000,
            });
          }
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

  const handleChangeFile = (files) => {
    setProductImage(files[0]);
  };

  const handleUplond = () => {
    Swal.fire({
      title: "อัปโหลดรูปภาพ?",
      text: "ต้องการอัปโหลดรูปนี้ใช่ไหม",
      icon: "question",
      showCancelButton: true,
      showConfirmButton: true,
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          const _config = {
            headers: {
              Authorization:
                "Bearer " + localStorage.getItem(config.token_name),
              "Content-Type": "multipart/form-data",
            },
          };
          const formData = new FormData();
          formData.append("productImage", productImage);
          formData.append("productImageName", productImage.name);
          formData.append("productId", product.id);

          await axios
            .post(config.api_path + "/productImage/insert", formData, _config)
            .then((res) => {
              if (res.data.message === "success") {
                Swal.fire({
                  title: "อัปโหลดสำเร็จ",
                  text: "เพิ่มรูปสินค้าแล้ว",
                  icon: "success",
                  timer: 2000,
                });

                fetchDataProductImage({id: product.id});

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

  const fetchDataProductImage = async (item) => {
    try {
      // ใช้ await สำหรับดึงข้อมูล และลบ .then/.catch ออก
      const res = await axios.get(
        config.api_path + "/productImage/list/" + item.id,
        config.headers(),
      );

      if (res.data.message === "success") {
        setProductImages(res.data.results);
      }
    } catch (e) {
      // ดึง Error Message จาก Server มาแสดง ถ้ามี
      const errorMessage = getErrorMessage(e);

      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: errorMessage,
        icon: "error",
      });
    }
  };

  const handleChooseProduct = (item) => {
    setProduct(item);
    fetchDataProductImage(item);
  };

  const handleChooseMainImage = (item) => {
    Swal.fire({
      title: "เลือกภาพหลัก",
      text: "ยืนยันเลือกภาพนี้ เป็นภาพหลักของสินค้า",
      icon: "question",
      showCancelButton: true,
      showConfirmButton: true,
    }).then(async (res) => {
      try {
        const url =
          config.api_path +
          "/productImage/chooseMainImage/" +
          item.id +
          "/" +
          item.productId;
        await axios
          .get(url, config.headers())
          .then((res) => {
            if (res.data.message === "success") {
              fetchDataProductImage({
                id: item.productId,
              });

              Swal.fire({
                title: "เลือกรูปภาพหลัก",
                text: "ตั้งเป็นรูปหลักแล้ว",
                icon: "success",
                timer: 2000,
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
    });
  };

  const handleDeleteProductImage = (item) => {
    Swal.fire({
      title: "ลบภาพสินค้า",
      text: "คุณยืนยันการลบภาพสินค้าใช่หรือไม่?",
      icon: "warning", // ใช้ warning จะดูเด่นกว่าสำหรับงานลบ
      showCancelButton: true,
      confirmButtonText: "ลบ",
      confirmButtonColor: DANGER_COLOR,
      cancelButtonText: "ยกเลิก",
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          // แก้ไข: เติม / หน้า ID เพื่อให้ URL ถูกต้อง
          const response = await axios.delete(config.api_path + "/productImage/delete/" + item.id,config.headers(),);

          if (response.data.message === "success") {
            Swal.fire({
              title: "ลบสำเร็จ",
              text: "ลบภาพสินค้าเรียบร้อยแล้ว",
              icon: "success",
              timer: 2000,
            });
            // อย่าลืมดึงข้อมูลรูปภาพใหม่เพื่อให้หน้าจออัปเดต
            fetchDataProductImage({ id: item.productId });
          }
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
          eyebrow="ร้านค้า / สินค้า"
          title="จัดการสินค้า"
          description="เพิ่ม แก้ไข และลบสินค้าพร้อมราคาทุน ราคาขาย และบาร์โค้ด"
          count={`${list.filtered.length.toLocaleString("th-TH")} รายการ`}
        />
        <FilterBar
          actions={
            <FilterBarButton
              variant="primary"
              icon="fa-solid fa-plus"
              onClick={clearForm}
              data-toggle="modal"
              data-target="#modalProduct"
            >
              เพิ่มสินค้า
            </FilterBarButton>
          }
        >
          <SearchBox className="fb-search" value={list.search} onChange={list.setSearch} placeholder="ค้นหาชื่อสินค้าหรือบาร์โค้ด" />
          {list.search && <FilterBarClear onClick={() => list.setSearch("")} />}
        </FilterBar>
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-muted small fw-bold">
                  <tr>
                    <th width="100px" className="text-center">
                      บาร์โค้ด
                    </th>
                    <th>ชื่อสินค้า</th>
                    <th className="text-right" width="120px">
                      ราคาทุน
                    </th>
                    <th className="text-right" width="120px">
                      ราคาจำหน่าย
                    </th>
                    <th>รายละเอียด</th>
                    <th width="140px" className="text-center">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.pageItems.length > 0 ? (
                    list.pageItems.map((item, index) => (
                      <tr key={index}>
                        <td className="align-middle text-center text-muted">
                          {item.barcode}
                        </td>
                        <td className="align-middle fw-bold text-dark">
                          {item.name}
                        </td>
                        <td className="align-middle text-right text-danger">
                          {Number(item.cost).toLocaleString()}
                        </td>
                        <td className="align-middle text-right text-success fw-bold">
                          {Number(item.price).toLocaleString()}
                        </td>
                        <td className="align-middle text-muted small">
                          {item.detail || "-"}
                        </td>
                        <td className="text-center align-middle">
                          <div className="table-actions">
                            {/* ปุ่มรูปภาพ */}
                            <button
                              onClick={(e) => handleChooseProduct(item)}
                              data-toggle="modal"
                              data-target="#modalProductImage"
                              className="btn btn-outline-secondary btn-icon"
                              title="จัดการรูปภาพ"
                              aria-label="จัดการรูปภาพ"
                            >
                              <i className="fa-solid fa-image"></i>
                            </button>

                            {/* ปุ่มแก้ไข */}
                            <button
                              onClick={(e) => setProduct(item)}
                              data-toggle="modal"
                              data-target="#modalProduct"
                              className="btn btn-outline-primary btn-icon"
                              title="แก้ไขข้อมูล"
                              aria-label="แก้ไขข้อมูล"
                            >
                              <i className="fa-solid fa-pencil"></i>
                            </button>

                            {/* ปุ่มลบ */}
                            <button
                              onClick={(e) => handleDelete(item)}
                              className="btn btn-outline-danger btn-icon"
                              title="ลบรายการ"
                              aria-label="ลบรายการ"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6">
<EmptyState icon="fa-box-open" text={list.search ? "ไม่พบรายการที่ค้นหา" : "ยังไม่มีสินค้า"} />
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

      <Modal id="modalProduct" title="สินค้า" modalSize="modal-lg">
        <form onSubmit={handleSave} className="p-2">
          <div className="row">
            <div className="mt-3 col-md-3 col-sm-12">
              <label htmlFor="product-field-1" className="form-label fw-bold">บาร์โค้ด</label>
              <input id="product-field-1"
                value={product.barcode}
                onChange={(e) =>
                  setProduct({ ...product, barcode: e.target.value })
                }
                className="form-control"
                placeholder="สแกนหรือพิมพ์บาร์โค้ด"
              />
            </div>

            {/* ชื่อสินค้า - เน้นให้กว้างครอบคลุม */}
            <div className="mt-3 col-md-9 col-sm-12">
              <label htmlFor="product-field-2" className="form-label fw-bold">ชื่อสินค้า</label>
              <input id="product-field-2"
                value={product.name}
                onChange={(e) =>
                  setProduct({ ...product, name: e.target.value })
                }
                className="form-control"
                placeholder="ระบุชื่อสินค้า"
              />
            </div>

            {/* ราคาจำหน่าย - ใส่ type="number" เพื่อให้คีย์บอร์ดมือถือขึ้นตัวเลข */}
            <div className="mt-3 col-md-3 col-sm-6">
              <label htmlFor="product-field-3" className="form-label fw-bold text-success">
                ราคาจำหน่าย
              </label>
              <input id="product-field-3"
                value={product.price}
                onChange={(e) =>
                  setProduct({ ...product, price: e.target.value })
                }
                type="number"
                className="form-control border-success"
                placeholder="0.00"
              />
            </div>

            {/* ราคาทุน */}
            <div className="mt-3 col-md-3 col-sm-6">
              <label htmlFor="product-field-4" className="form-label fw-bold text-danger">ราคาทุน</label>
              <input id="product-field-4"
                value={product.cost}
                onChange={(e) =>
                  setProduct({ ...product, cost: e.target.value })
                }
                type="number"
                className="form-control border-danger"
                placeholder="0.00"
              />
            </div>

            {/* รายละเอียด */}
            <div className="mt-3 col-md-6 col-sm-12">
              <label htmlFor="product-field-5" className="form-label fw-bold">รายละเอียดสินค้า</label>
              <input id="product-field-5"
                value={product.detail}
                onChange={(e) =>
                  setProduct({ ...product, detail: e.target.value })
                }
                className="form-control"
                placeholder="ระบุข้อมูลเพิ่มเติม (ถ้ามี)"
              />
            </div>
          </div>

          {/* ส่วนของปุ่ม Save */}
          <div className="mt-4 pt-2 border-top">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn-primary px-4 shadow-sm"
            >
              <i className="fa-solid fa-check mr-2" />
              บันทึกรายการ
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        id="modalProductImage"
        title="จัดการภาพสินค้า"
        modalSize="modal-lg"
      >
        <div className="row p-2">
          {/* Barcode */}
          <div className="col-md-4 col-sm-12">
            <div className="form-group">
              <label htmlFor="product-field-6" className="fw-bold text-muted small text-uppercase">
                บาร์โค้ด
              </label>
              <input id="product-field-6"
                value={product.barcode}
                disabled
                className="form-control bg-light border-0"
              />
            </div>
          </div>

          {/* ชื่อสินค้า */}
          <div className="col-md-8 col-sm-12">
            <div className="form-group">
              <label htmlFor="product-field-7" className="fw-bold text-muted small">ชื่อสินค้า</label>
              <input id="product-field-7"
                value={product.name}
                disabled
                className="form-control bg-light border-0"
              />
            </div>
          </div>

          {/* รายละเอียด */}
          <div className="col-12 mt-2">
            <div className="form-group">
              <label htmlFor="product-field-8" className="fw-bold text-muted small">รายละเอียด</label>
              <input id="product-field-8"
                value={product.detail || "-"}
                disabled
                className="form-control bg-light border-0"
              />
            </div>
          </div>

          {/* ส่วนเลือกภาพสินค้า */}
          <div className="col-12 mt-3 p-3 bg-light rounded border">
            <label htmlFor="product-field-9" className="fw-bold mb-2">
              <i className="fa-solid fa-cloud-upload mr-2 text-primary"></i>
              เลือกไฟล์ภาพสินค้า
            </label>
            <input id="product-field-9"
              onChange={(e) => handleChangeFile(e.target.files)}
              type="file"
              name="imageName"
              className="form-control border-primary"
              accept="image/*"
            />
            {productImage.name !== undefined ? (
              <div>File: {productImage.name}</div>
            ) : (
              ""
            )}
            <small className="text-muted mt-1 d-block">
              รองรับไฟล์ JPG และ PNG
            </small>
          </div>

          {/* ปุ่ม Save */}
          <div className="col-12 mt-4 pt-3 border-top text-right">
            {productImage.name !== undefined ? (
              <button
                onClick={handleUplond}
                className="btn btn-primary px-5 shadow-sm"
              >
                <i className="fa-solid fa-check mr-2"></i>
                บันทึกรูปภาพ
              </button>
            ) : (
              ""
            )}
          </div>
        </div>

        <div className="mt-4 fw-bold text-secondary border-bottom pb-2">
          <i className="fa-solid fa-images mr-2 text-primary"></i> คลังภาพสินค้า
        </div>

        <div className="row mt-3">
          {productImages.length > 0 ? (
            productImages.map((item) => (
              <div className="col-lg-3 col-md-4 col-6 mb-4" key={item.id}>
                <div className="card h-100 shadow-sm border-0 overflow-hidden">
                  {/* ส่วนแสดงรูปภาพ: คุมความสูงและตัดส่วนเกินด้วย object-fit */}
                  <div
                    style={{
                      height: "150px",
                      overflow: "hidden",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    <img
                      className="card-img-top"
                      loading="lazy"
                      decoding="async"
                      src={config.api_path + "/uploads/thumb/" + item.imageName}
                      onError={(e) => {
                        // รูปย่อไม่ได้ → ใช้รูปต้นฉบับ
                        if (e.target.dataset.fallback) return;
                        e.target.dataset.fallback = "1";
                        e.target.src = config.api_path + "/uploads/" + item.imageName;
                      }}
                      alt={item.imageName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  <div className="card-body p-2 text-center bg-white">
                    {/* ส่วนปุ่มภาพหลัก */}
                    <div className="mb-2">
                      {item.isMain ? (
                        <button className="btn btn-success btn-sm w-100 shadow-sm fw-bold">
                          <i className="fa-solid fa-star mr-1"></i> ภาพหลัก
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleChooseMainImage(item)}
                          className="btn btn-outline-primary btn-sm w-100"
                        >
                          ตั้งเป็นภาพหลัก
                        </button>
                      )}
                    </div>

                    {/* ปุ่มลบรูปภาพ - แก้ไขตัวสะกดและปรับดีไซน์ */}
                    <button
                      onClick={(e) => handleDeleteProductImage(item)}
                      className="btn btn-outline-danger btn-sm w-100 border-0" // เพิ่ม border-0 ถ้าอยากให้ดูเบาขึ้นไปอีก
                    >
                      <i className="fa-solid fa-trash-alt mr-1"></i> ลบรูปภาพ
                    </button>
                    
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5 text-muted bg-light rounded">
              <i className="fa-solid fa-image fa-2x mb-2 d-block opacity-50"></i>
              ยังไม่มีรูปสินค้า
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

export default Product;
