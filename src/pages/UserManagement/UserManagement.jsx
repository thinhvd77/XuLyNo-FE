import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './UserManagement.module.css';
import Pagination from '../../components/Pagination/Pagination';

const ITEMS_PER_PAGE = 8;

// --- COMPONENT MỚI: MODAL THÊM NGƯỜI DÙNG ---
const AddUserModal = ({ isOpen, onClose, onSave }) => {
    const [fullname, setFullname] = useState('');
    const [employee_code, setEmployeeCode] = useState('');
    const [dept, setDept] = useState('');
    const [branch_code, setBranchCode] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!fullname || !username || !password) {
            toast.error('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        onSave({
            fullname,
            employee_code,
            dept,
            branch_code,
            username,
            password,
            role
        });
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Thêm Người dùng mới</h2>
                    <button onClick={onClose} className={styles.closeButton}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.modalBody}>
                        <div className={styles.formGroup}>
                            <label htmlFor="fullname">Mã cán bộ</label>
                            <input id="employee_code" type="text" value={employee_code} onChange={e => setEmployeeCode(e.target.value)} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="fullname">Họ và Tên</label>
                            <input id="fullname" type="text" value={fullname} onChange={e => setFullname(e.target.value)} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="fullname">Phòng ban</label>
                            <select id="dept" value={dept} onChange={e => setDept(e.target.value)}>
                                <option value="">Chọn phòng ban</option>
                                <option value="KHCN">Khách hàng cá nhân</option>
                                <option value="KHDN">Khách hàng doanh nghiệp</option>
                                <option value="KH&QLRR">Kế hoạch & quản lý rủi ro</option>
                                <option value="BGD">Ban Giám đốc</option>
                                <option value="IT">IT</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="role">Chức vụ</label>
                            <select id="role" value={role} onChange={e => setRole(e.target.value)}>
                                <option value="">Chọn chức vụ</option>
                                <option value="employee">Cán bộ tín dụng</option>
                                <option value="manager">Trưởng phòng</option>
                                <option value="deputy_manager">Phó phòng</option>
                                <option value="director">Giám đốc</option>
                                <option value="deputy_director">Phó giám đốc</option>
                                <option value="administrator">Administrator</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="fullname">Mã chi nhánh</label>
                            <select id="branch_code" value={branch_code} onChange={e => setBranchCode(e.target.value)}>
                                <option value="">Chọn mã chi nhánh</option>
                                <option value="6421">Hội sở - 6421</option>
                                <option value="6221">Chi nhánh Nam Hoa - 6221</option>
                                <option value="1605">Chi nhánh 6 - 1605</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="username">Tên đăng nhập</label>
                            <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="password">Mật khẩu</label>
                            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                    </div>
                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>Hủy</button>
                        <button type="submit" className={styles.saveButton}>Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const navigate = useNavigate();

    // Giả lập việc fetch dữ liệu từ API
    useEffect(() => {
        const fetchCases = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                // Nếu không có token, người dùng chưa đăng nhập, chuyển về trang login
                navigate('/login');
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch('http://localhost:3000/api/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Không thể tải dữ liệu người dùng.');
                }

                const data = await response.json();
                setUsers(data.users);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCases();
    }, [navigate]);

    const filteredUsers = useMemo(() => {
        setCurrentPage(1);
        if (!searchTerm) return users;
        return users.filter(user =>
            user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.employee_code.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

    const handleAddUser = async (newUserData) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Không tìm thấy token. Vui lòng đăng nhập lại.');
            return;
        }
        // console.log('Adding new user with data:', newUserData);

        try {
            const response = await fetch('http://localhost:3000/api/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newUserData)
            });

            const result = await response.json();

            if (!response.ok) {
                // console.error();
                throw new Error(result.message || 'Không thể tạo người dùng.');
            }

            // gọi lại api để cập nhật danh sách người dùng
            const updatedResponse = await fetch('http://localhost:3000/api/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const updatedData = await updatedResponse.json();
            setUsers(updatedData.users);

            setIsAddModalOpen(false); // Đóng modal sau khi lưu thành công
            toast.success('Thêm người dùng mới thành công!');

        } catch (error) {
            // console.error('Lỗi khi thêm người dùng:', error);
            toast.error(`Đã xảy ra lỗi: ${error.message}`);
        }
    };

    const handleDisableUser = (userId) => {
        // Mô phỏng gọi API để thay đổi trạng thái
        setUsers(users.map(user =>
            user.id === userId ? { ...user, status: user.status === 'active' ? 'disabled' : 'active' } : user
        ));
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
            // gọi API để xóa người dùng
            fetch(`http://localhost:3000/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Không thể xóa người dùng.');
                    }
                    return response.json();
                })
                .then(async () => {
                    // gọi lại api để cập nhật danh sách người dùng
                    const updatedResponse = await fetch('http://localhost:3000/api/users', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    const updatedData = await updatedResponse.json();
                    setUsers(updatedData.users);
                    toast.success('Xóa người dùng thành công!');
                })
                .catch(error => {
                    // console.error('Lỗi khi xóa người dùng:', error);
                    toast.error(`Đã xảy ra lỗi: ${error.message}`);
                })
        }
    };

    if (isLoading) {
        return <div className={styles.message}>Đang tải danh sách người dùng...</div>;
    }

    if (error) {
        return <div className={`${styles.message} ${styles.error}`}>Lỗi: {error}</div>;
    }

    return (
        <>
            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddUser}
            />

            <div className={styles.pageHeader}>
                <h1>Quản lý Người dùng</h1>
                <button className={styles.addButton} onClick={() => setIsAddModalOpen(true)}>
                    + Thêm Người dùng
                </button>
            </div>

            <div className={styles.filterBar}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Tìm theo Mã NV, Tên, Tên đăng nhập..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Mã Nhân viên</th>
                            <th>Họ và Tên</th>
                            <th>Tên đăng nhập</th>
                            <th>Phòng ban</th>
                            <th>Chức vụ</th>
                            <th>Chi nhánh</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map(user => (
                            <tr key={user.employee_code}>
                                <td>{user.employee_code}</td>
                                <td>{user.fullname}</td>
                                <td>{user.username}</td>
                                <td>{
                                    user.dept === 'KHCN' ? "Khách hàng cá nhân"
                                        : user.dept === "KHDN" ? "Khách hàng doanh nghiệp"
                                            : user.dept === "KH&QLRR" ? "Kế hoạch & quản lý rủi ro"
                                                : user.dept === "BGD" ? "Ban Giám đốc"
                                                    : user.dept === "IT" ? "IT" : "Chưa xác định"

                                }</td>
                                <td>{
                                    user.role === 'employee' ? "Cán bộ tín dụng"
                                        : user.role === "manager" ? "Trưởng phòng"
                                            : user.role === "deputy_manager" ? "Phó phòng"
                                                : user.role === "director" ? "Giám đốc"
                                                    : user.role === "deputy_director" ? "Phó giám đốc"
                                                        : user.role === "administrator" ? "Administrator" : "Chưa xác định"
                                }</td>
                                <td>{
                                    user.branch_code === '6421' ? "Hội sở"
                                        : user.branch_code === "6221" ? "Chi nhánh Nam Hoa"
                                            : user.branch_code === "1605" ? "Chi nhánh 6"
                                                : "Chưa xác định"
                                }</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${styles[user.status]}`}>
                                        {user.status === 'active' ? 'Hoạt động' : 'Vô hiệu hóa'}
                                    </span>
                                </td>
                                <td className={styles.actionCell}>
                                    <button className={styles.actionButton}>Sửa</button>
                                    <button className={`${styles.actionButton} ${styles.disable}`} onClick={() => handleDisableUser(user.employee_code)}>
                                        {user.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                    </button>
                                    <button className={`${styles.actionButton} ${styles.delete}`} onClick={() => handleDeleteUser(user.employee_code)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className={styles.paginationContainer}>
                    <div className={styles.pageInfo}>
                        Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} trên tổng số {filteredUsers.length} người dùng
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </>
    );
}

export default UserManagement;