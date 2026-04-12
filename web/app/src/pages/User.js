import Template from "../components/Template";
import Modal from "../components/Modal";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import config from "../config";
import axios from "axios";

function User() {
    const [user, setUser] = useState({ level: 'user' }); // กำหนดค่าเริ่มต้นให้ระดับสิทธิ์
    const [users, setUsers] = useState([]);
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
                title: 'error',
                text: e.message,
                icon: 'error'
            })
        }
    }

    const handleSave = async () => {
    try {
        let url = '/user/insert';
        if (user.id !== undefined) {
            url = '/user/edit';
        }

        // 1. ตรวจสอบรหัสผ่าน: ถ้าเป็นการ "เพิ่มใหม่" ต้องกรอก
        // ถ้าเป็นการ "แก้ไข" จะกรอกหรือไม่กรอกก็ได้ (ถ้าไม่กรอกให้ใช้รหัสเดิมใน DB)
        if (password !== passwordConfirm) {
            Swal.fire({
                title: 'ตรวจสอบรหัสผ่าน',
                text: 'โปรดกรอกรหัสผ่านให้ตรงกัน',
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
            title: 'error',
            text: e.response?.data?.message || e.message,
            icon: 'error'
        });
    }
}

    const handleClose = () => {
        const btns = document.getElementsByClassName("btnClose");
        for (let i = 0; i < btns.length; i++) {
            btns[i].click();
        }
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
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#d33'

            }).then(async res => {
                if (res.isConfirmed) {
                    await axios.delete(config.api_path + '/user/delete/' + item.id, config.headers()).then(res => {
                        if (res.data.message === 'success') {
                            Swal.fire({
                                title: 'ลบข้อมูลแล้ว',
                                text: 'ระบบได้ทำการลบข้อมูล เรียบร้อยแล้ว',
                                icon: 'success',
                                timer: 2000
                            })

                            fetchData();
                        }
                    }).catch(err => {
                        throw err.response.data;
                    })
                }
            })
        } catch (e) {
            Swal.fire({
                title: 'error',
                text: e.response?.data?.message || e.message,
                icon: 'error'
            })
        }
    }

    return (
        <>
            <Template>
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-white py-3">
                        <div className="card-title h5 mb-0 text-primary fw-bold">
                            <i className="fas fa-user-shield mr-2"></i> ผู้ใช้งานระบบ
                        </div>
                    </div>

                    <div className="card-body">
                        <button
                            onClick={clearForm}
                            data-toggle="modal"
                            data-target="#modalUser"
                            className="btn btn-primary shadow-sm px-3 py-2"
                        >
                            <i className="fa fa-plus mr-2"></i>
                            เพิ่มรายการ
                        </button>

                        <div className="table-responsive mt-3">
                            <table className="table table-bordered table-striped table-hover align-middle">
                                <thead className="table-light text-secondary">
                                    <tr>
                                        <th>ชื่อ</th>
                                        <th>Username</th>
                                        <th>ระดับสิทธิ์</th>
                                        <th width="120px" className="text-center">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? (
                                        users.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.name}</td>
                                                <td>{item.usr}</td>
                                                <td>
                                                    <span className={`badge ${item.level === 'admin' ? 'bg-success' : 'bg-info'}`}>
                                                        {item.level}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <button onClick={e => setUser(item)}
                                                     data-toggle="modal"
                                                     data-target="#modalUser"
                                                     className="btn btn-info btn-sm me-1 shadow-sm text-white">
                                                        <i className="fa fa-pencil"></i>
                                                    </button>
                                                    <button onClick={e => handleDelete(item)} className="btn btn-danger btn-sm shadow-sm">
                                                        <i className="fa fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4 text-muted">
                                                ไม่พบข้อมูลผู้ใช้งาน
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
                    <label>ชื่อ</label>
                    <input value={user.name || ''} onChange={e => setUser({ ...user, name: e.target.value })} className="form-control" />
                </div>
                <div className="mt-3">
                    <label>username</label>
                    <input value={user.usr || ''} onChange={e => setUser({ ...user, usr: e.target.value })} className="form-control" />
                </div>
                <div className="mt-3">
                    <label>password</label>
                    <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="form-control" />
                </div>
                <div className="mt-3">
                    <label>ยืนยัน password</label>
                    <input value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} type="password" className="form-control" />
                </div>
                <div className="mt-3">
                    <label>ระดับ</label>
                    <select
                        value={user.level}
                        onChange={e => setUser({ ...user, level: e.target.value })}
                        className="form-control" >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className="mt-4 pt-2 border-top">
                    <button onClick={handleSave} className="btn btn-primary px-4 shadow-sm">
                        <i className="fa fa-check me-2"></i>
                        Save
                    </button>
                </div>
            </Modal>
        </>
    );
}

export default User;