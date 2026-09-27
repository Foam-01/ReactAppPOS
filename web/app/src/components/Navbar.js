import config from "../config";
import Swal, { DANGER_COLOR } from "../utils/swal";
import { getErrorMessage } from "../utils/error";
import { useNavigate } from "react-router-dom";
import Modal from './Modal'
import { useState } from "react";
import axios from "axios";

function Navbar() {
  const navigate = useNavigate();
  const [memberName, setMemberName] = useState();

  const handleSignOut = () => {
    
    Swal.fire({
        title: 'ออกจากระบบ',
        text: 'คุณต้องการออกจากระบบใช่หรือไม่?',
        icon: 'warning', // เปลี่ยนเป็น warning เพื่อให้ดูสำคัญขึ้น
        showCancelButton: true,
        confirmButtonText: 'ใช่, ออกจากระบบ',
        confirmButtonColor: DANGER_COLOR,
        cancelButtonText: 'ยกเลิก',
        reverseButtons: true // สลับตำแหน่งปุ่มให้ 'ยกเลิก' อยู่ซ้าย 'ออกจากระบบ' อยู่ขวา (ตามหลัก UX)

    }).then (res => {
      if (res.isConfirmed) {
          localStorage.removeItem(config.token_name)
          navigate('/login');
      }
    })
    
  }

  const handleEditProfile = async () => {
      try {
      axios.get(config.api_path + '/member/info', config.headers()).then(res => {
      if (res.data.message === 'success') {
         setMemberName(res.data.result.name); 
         
      }
      
    }).catch(err => {
      throw err;
    })
    } catch (e) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: getErrorMessage(e),
        icon: 'error'
      })
    }
  }

  const handleChangeProfile = async () => {
    try {
      const url = config.api_path + "/member/changeProfile";
      const paylond = { memberName: memberName };
      const res = await axios.put(url, paylond, config.headers());
      if (res.data.message === "success") {
        window.dispatchEvent(new Event("pos-member-updated"));
        Swal.fire({
          title: "บันทึกแล้ว",
          text: "อัปเดตข้อมูลร้านแล้ว",
          icon: "success",
          timer: 2000,
        });
        document.querySelector("#modalEditProfile .btnClose")?.click();
      }
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
      <nav className="main-header navbar navbar-expand navbar-white navbar-light">
        <ul className="navbar-nav">
          <li className="nav-item">
            <button
              type="button"
              className="nav-link btn btn-link"
              data-widget="pushmenu"
              aria-label="เปิด/ปิดเมนู"
            >
              <i className="fa-solid fa-bars" aria-hidden="true"></i>
            </button>
          </li>
        </ul>

        <ul className="navbar-nav ml-auto">
          <li className="nav-item d-flex align-items-center">
            {/* ปุ่ม Profile: แก้ btb เป็น btn และ btn-infoo เป็น btn-info */}
            <button onClick={handleEditProfile} data-toggle='modal' data-target='#modalEditProfile' 
              className="btn btn-info btn-sm mr-2 text-white" aria-label="แก้ไขข้อมูลร้าน">
              <i className="fa-solid fa-user mr-sm-2" aria-hidden="true"></i>
              <span className="d-none d-sm-inline">Profile</span>
            </button>

            {/* ปุ่ม Sign Out: เพิ่ม btn-sm เพื่อให้ขนาดเท่ากันกับปุ่มข้างๆ */}
            <button onClick={handleSignOut} className="btn btn-danger btn-sm" aria-label="ออกจากระบบ">
              <i className="fa-solid fa-times mr-sm-2" aria-hidden="true"></i>
              <span className="d-none d-sm-inline">ออกจากระบบ</span>
            </button>
          </li>

          <li className="nav-item"></li>
        </ul>
      </nav>

      <Modal  id='modalEditProfile' title='แก้ไขข้อมูลร้านของฉัน'>
        <div>
          <label htmlFor="navbar-field-1">ชื่อร้าน</label>
          <input id="navbar-field-1" value={memberName} onChange={e => setMemberName(e.target.value)} className="form-control" />
        </div>
        <div className="mt-3">
              <button onClick={handleChangeProfile} className="btn btn-primary">
                <i className="fa-solid fa-check mr-2"></i>
                Save
              </button>
        </div>

      </Modal>
    </>
  );
}

export default Navbar;
