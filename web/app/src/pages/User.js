import Template from "../components/Template";
import Modal from "../components/Modal";
import { useEffect, useState } from "react";
import Swal, { DANGER_COLOR } from "../utils/swal";
import { closeModal } from "../utils/modal";
import { getErrorMessage } from "../utils/error";
import config from "../config";
import EmptyState from "../components/EmptyState";
import axios from "axios";
import { SearchBox } from "../components/ListToolbar";
import { PageHeader, FilterBar, FilterBarButton, FilterBarClear } from "../components/PageHeader";

function User() {
    const [user, setUser] = useState({ level: 'user' }); // กำหนดค่าเริ่มต้นให้ระดับสิทธิ์
    const [isSaving, setIsSaving] = useState(false);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get(config.api_path + '/user/list', config.headers());
            // แก้ไขตัวสะกดจาก message เป็น message
            if (res.data.message === 'success') {
                setUsers(res.data.results);
            }
        } catch (e) {
            Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: getErrorMessage(e),
                icon: 'error'
            })
        }
    }

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
        let url = '/user/insert';
        if (user.id !== undefined) {
            url = '/user/edit';
        }

        // 1. ตรวจสอบรหัสผ่าน: ถ้าเป็นการ "เพิ่มใหม่" ต้องกรอก
        // ถ้าเป็นการ "แก้ไข" จะกรอกหรือไม่กรอกก็ได้ (ถ้าไม่กรอกให้ใช้รหัสเดิมใน DB)
        if (password !== passwordConfirm) {
            Swal.fire({
                title: 'รหัสผ่านไม่ตรงกัน',
                text: 'กรอกรหัสผ่านทั้งสองช่องให้เหมือนกัน',
                icon: 'error'
            });
            return;
        }

        // 2. เตรียมข้อมูลส่ง
        const payload = { ...user };
        
        // ถ้ามีการกรอก password เข้ามา ถึงจะส่งไปอัปเดต
        if (password !== "") {
            payload.pwd = password;
        }

        const res = await axios.post(config.api_path + url, payload, config.headers());
        
        if (res.data.message === 'success') {
            Swal.fire({
                title: 'บันทึกข้อมูล',
                text: 'บันทึกข้อมูลเรียบร้อยแล้ว',
                icon: 'success',
                timer: 2000
            });
            
            fetchData();
            handleClose();
            
            // 3. ล้างค่า password ใน state หลังบันทึก
            setPassword("");
            setPasswordConfirm("");
        }
    } catch (e) {
        Swal.fire({
            title: 'เกิดข้อผิดพลาด',
            text: getErrorMessage(e),
            icon: 'error'
        });
    }
}

    const handleClose = () => {
        closeModal();
    };

    const clearForm = () => {
    setUser({ 
        name: "",    // ล้างชื่อ
        usr: "",     // ล้าง username
        level: 'user', 
        id: undefined 
    });
    setPassword("");
    setPasswordConfirm("");
}

    const handleDelete =  (item) => {
        try {
            Swal.fire({
                title: 'ยืนยันการลบข้อมูล',
            text: `คุณต้องการลบข้อมูลผู้ใช้งาน ${item.name} ใช่หรือไม่?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ลบ',
            confirmButtonColor: DANGER_COLOR,
            cancelButtonText: 'ยกเลิก',

            }).then(async res => {
                if (res.isConfirmed) {
                    await axios.delete(config.api_path + '/user/delete/' + item.id, config.headers()).then(res => {
                        if (res.data.message === 'success') {
                            Swal.fire({
                                title: 'ลบข้อมูลแล้ว',
                                text: 'ลบผู้ใช้แล้ว',
                                icon: 'success',
                                timer: 2000
                            })

                            fetchData();
                        }
                    }).catch(err => {
                        throw err;
                    })
                }
            })
        } catch (e) {
            Swal.fire({
                title: 'เกิดข้อผิดพลาด',
                text: getErrorMessage(e),
                icon: 'error'
            })
        }
    }

    // ค้นหาฝั่งหน้าเว็บจากรายการที่โหลดแล้ว
    const keyword = search.trim().toLowerCase();
    const filteredUsers = keyword
        ? users.filter(u => `${u.name} ${u.usr}`.toLowerCase().includes(keyword))
        : users;

    return (
        <>
            <Template>
                <PageHeader
                    eyebrow="ร้านค้า / ผู้ใช้งาน"
                    title="ผู้ใช้งานระบบ"
                    description="จัดการบัญชีพนักงานและกำหนดระดับสิทธิ์การใช้งาน"
                    count={`${filteredUsers.length.toLocaleString('th-TH')} คน`}
                />
                <FilterBar
                    actions={
                        <FilterBarButton
                            variant="primary"
                            icon="fa-solid fa-plus"
                            onClick={clearForm}
                            data-toggle="modal"
                            data-target="#modalUser"
                        >
                            เพิ่มผู้ใช้
                        </FilterBarButton>
                    }
                >
                    <SearchBox className="fb-search" value={search} onChange={setSearch} placeholder="ค้นหาชื่อหรือ Username" />
                    {search && <FilterBarClear onClick={() => setSearch('')} />}
                </FilterBar>
                <div className="card shadow-sm border-0">
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light text-muted small fw-bold">
                                    <tr>
                                        <th>ชื่อ</th>
                                        <th>Username</th>
                                        <th>ระดับสิทธิ์</th>
                                        <th width="120px" className="text-center">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.name}</td>
                                                <td>{item.usr}</td>
                                                <td>
                                                    <span className={`badge rounded-pill px-3 py-1 ${item.level === 'admin' ? 'bg-primary-subtle text-primary' : 'bg-secondary-subtle text-secondary'}`}>
                                                        {item.level}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                  <div className="table-actions">
                                                    <button onClick={e => setUser(item)}
                                                     data-toggle="modal"
                                                     data-target="#modalUser"
                                                     className="btn btn-outline-primary btn-icon"
                                                     title="แก้ไข" aria-label="แก้ไข">
                                                        <i className="fa-solid fa-pencil"></i>
                                                    </button>
                                                    <button onClick={e => handleDelete(item)} className="btn btn-outline-danger btn-icon" title="ลบ" aria-label="ลบ">
                                                        <i className="fa-solid fa-trash-can"></i>
                                                    </button>
                                                  </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4">
<EmptyState text="ไม่พบข้อมูลผู้ใช้งาน" />
</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Template>

            <Modal id="modalUser" title="ผู้ใช้งานระบบ" modalSize="modal-lg">
                <div>
                    <label htmlFor="user-field-1">ชื่อ</label>
                    <input id="user-field-1" value={user.name || ''} onChange={e => setUser({ ...user, name: e.target.value })} className="form-control" />
                </div>
                <div className="mt-3">
                    <label htmlFor="user-field-2">username</label>
                    <input id="user-field-2" value={user.usr || ''} onChange={e => setUser({ ...user, usr: e.target.value })} className="form-control" />
                </div>
                <div className="mt-3">
                    <label htmlFor="user-field-3">password</label>
                    <input id="user-field-3" value={password} onChange={e => setPassword(e.target.value)} type="password" className="form-control" />
                </div>
                <div className="mt-3">
                    <label htmlFor="user-field-4">ยืนยันรหัสผ่าน</label>
                    <input id="user-field-4" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} type="password" className="form-control" />
                </div>
                <div className="mt-3">
                    <label htmlFor="user-field-5">ระดับสิทธิ์</label>
                    <select id="user-field-5"
                        value={user.level}
                        onChange={e => setUser({ ...user, level: e.target.value })}
                        className="form-control" >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className="mt-4 pt-2 border-top">
                    <button onClick={handleSave} disabled={isSaving} className="btn btn-primary px-4 shadow-sm">
                        <i className="fa-solid fa-check me-2"></i>
                        บันทึก
                    </button>
                </div>
            </Modal>
        </>
    );
}

export default User;