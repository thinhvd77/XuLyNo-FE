import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UserManagement.module.css';
import Pagination from '../../components/Pagination/Pagination';

const ITEMS_PER_PAGE = 5;

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
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

    const handleDisableUser = (userId) => {
        // Mô phỏng gọi API để thay đổi trạng thái
        setUsers(users.map(user =>
            user.id === userId ? { ...user, status: user.status === 'active' ? 'disabled' : 'active' } : user
        ));
    };

    const handleDeleteUser = (userId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
            // Mô phỏng gọi API để xóa
            setUsers(users.filter(user => user.id !== userId));
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
            <div className={styles.pageHeader}>
                <h1>Quản lý Người dùng</h1>
                <button className={styles.addButton}>+ Thêm Người dùng</button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Mã Cán Bộ</th>
                            <th>Họ và Tên</th>
                            <th>Phòng ban</th>
                            <th>Chức vụ</th>
                            <th>Mã chi nhánh</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.employee_code}>
                                <td>{user.employee_code}</td>
                                <td>{user.fullname}</td>
                                <td>{user.dept}</td>
                                <td>{user.role}</td>
                                <td>{user.branch_code}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${styles[user.status]}`}>
                                        {user.status === 'active' ? 'Hoạt động' : 'Vô hiệu hóa'}
                                    </span>
                                </td>
                                <td className={styles.actionCell}>
                                    <button className={styles.actionButton}>Sửa</button>
                                    <button className={`${styles.actionButton} ${styles.disable}`} onClick={() => handleDisableUser(user.id)}>
                                        {user.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                    </button>
                                    <button className={`${styles.actionButton} ${styles.delete}`} onClick={() => handleDeleteUser(user.id)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default UserManagement;