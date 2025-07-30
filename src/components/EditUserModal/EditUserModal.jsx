import { useState, useEffect } from 'react';
import styles from './EditUserModal.module.css';

const EditUserModal = ({ isOpen, onClose, onSave, user }) => {
    const [fullname, setFullname] = useState('');
    const [role, setRole] = useState('employee');
    const [dept, setDept] = useState('');
    const [branch_code, setBranchCode] = useState('');

    useEffect(() => {
        if (user) {
            setFullname(user.fullname);
            setRole(user.role);
            setDept(user.dept);
            setBranchCode(user.branch_code);
        }
    }, [user]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(user.employee_code, { fullname, role, dept, branch_code });
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Chỉnh sửa Người dùng</h2>
                    <button onClick={onClose} className={styles.closeButton}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.modalBody}>
                        <div className={styles.formGroup}>
                            <label>Mã Nhân viên</label>
                            <input type="text" value={user.employee_code} disabled />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Tên đăng nhập</label>
                            <input type="text" value={user.username} disabled />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="edit-fullname">Họ và Tên</label>
                            <input id="edit-fullname" type="text" value={fullname} onChange={e => setFullname(e.target.value)} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="edit-branch">Chi nhánh</label>
                            <select 
                                id="edit-branch" 
                                value={branch_code} 
                                onChange={e => {
                                    const newBranchCode = e.target.value;
                                    setBranchCode(newBranchCode);
                                    // Reset phòng ban và chức vụ khi thay đổi chi nhánh
                                    if (newBranchCode !== '6421' && ['KHCN', 'KHDN', 'KH&QLRR', 'IT'].includes(dept)) {
                                        setDept('');
                                        setRole('');
                                    }
                                }}
                            >
                                <option value="6421">Hội sở</option>
                                <option value="6221">Chi nhánh Nam Hoa</option>
                                <option value="1605">Chi nhánh 6</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="edit-dept">Phòng ban</label>
                            <select 
                                id="edit-dept" 
                                value={dept} 
                                onChange={e => {
                                    const newDept = e.target.value;
                                    setDept(newDept);
                                    // Reset chức vụ khi thay đổi phòng ban nếu không phù hợp
                                    if ((newDept === 'BGĐ' && !['director', 'deputy_director'].includes(role)) ||
                                        (newDept === 'IT' && role !== 'administrator') ||
                                        (!['BGĐ', 'IT'].includes(newDept) && !['employee', 'deputy_manager', 'manager'].includes(role))) {
                                        setRole('');
                                    }
                                }}
                            >
                                {branch_code === '6421' ? (
                                    // Hội sở - 6421: có đầy đủ các phòng ban
                                    <>
                                        <option value="KHCN">Khách hàng cá nhân</option>
                                        <option value="KHDN">Khách hàng doanh nghiệp</option>
                                        <option value="KH&QLRR">Kế hoạch & quản lý rủi ro</option>
                                        <option value="BGĐ">Ban Giám đốc</option>
                                        <option value="IT">IT</option>
                                    </>
                                ) : (
                                    // Các chi nhánh khác: chỉ có phòng Khách hàng và BGĐ
                                    <>
                                        <option value="KH">Khách hàng</option>
                                        <option value="BGĐ">Ban Giám đốc</option>
                                    </>
                                )}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="edit-role">Chức vụ</label>
                            <select id="edit-role" value={role} onChange={e => setRole(e.target.value)}>
                                {dept === 'BGĐ' ? (
                                    // Ban Giám đốc: chỉ có Giám đốc và Phó giám đốc
                                    <>
                                        <option value="director">Giám đốc</option>
                                        <option value="deputy_director">Phó giám đốc</option>
                                    </>
                                ) : dept === 'IT' ? (
                                    // IT: chỉ có Administrator
                                    <>
                                        <option value="administrator">Administrator</option>
                                    </>
                                ) : (
                                    // Các phòng khác: CBTD, Phó phòng, Trưởng phòng
                                    <>
                                        <option value="employee">Cán bộ tín dụng</option>
                                        <option value="deputy_manager">Phó phòng</option>
                                        <option value="manager">Trưởng phòng</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>
                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>Hủy</button>
                        <button type="submit" className={styles.saveButton}>Lưu thay đổi</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;
