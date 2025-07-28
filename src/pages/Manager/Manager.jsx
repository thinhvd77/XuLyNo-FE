import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Manager.module.css';
import Pagination from '../../components/Pagination/Pagination';
// import toast from 'react-hot-toast';

function Manager(){
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const navigate = useNavigate();

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
                const response = await fetch('http://localhost:3000/api/users/managed', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Không thể tải dữ liệu người dùng.');
                }

                const data = await response.json();
                setUsers(data);
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
            user.employee_code.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [users, searchTerm]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

    if (isLoading) {
        return <div className={styles.message}>Đang tải danh sách người dùng...</div>;
    }
    
    if (error) {
        return <div className={`${styles.message} ${styles.error}`}>Lỗi: {error}</div>;
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.filterBar}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Tìm theo Mã NV, Tên, Tên đăng nhập..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className={styles.tableWrapper}>
                <div className={styles.tableContainer}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Mã Nhân viên</th>
                                <th>Họ và Tên</th>
                                <th>Chức vụ</th>
                                <th>Trạng thái</th>
                                <th>Dư nợ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map(user => (
                                <tr key={user.employee_code}>
                                    <td>{user.employee_code}</td>
                                    <td>{user.fullname}</td>
                                    <td>{
                                        user.role === 'employee' ? "Cán bộ tín dụng"
                                            : user.role === "manager" ? "Trưởng phòng"
                                                : user.role === "deputy_manager" ? "Phó phòng"
                                                    : user.role === "director" ? "Giám đốc"
                                                        : user.role === "deputy_director" ? "Phó giám đốc"
                                                            : user.role === "administrator" ? "Administrator" : "Chưa xác định"
                                    }</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[user.status]}`}>
                                            {user.status === 'active' ? 'Hoạt động' : 'Vô hiệu hóa'}
                                        </span>
                                    </td>
                                    <td>0</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className={styles.paginationContainer}>
                <div className={styles.rowsPerPageSelector}>
                    <span>Hiển thị:</span>
                    <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                        <option value={5}>5 dòng</option>
                        <option value={10}>10 dòng</option>
                        <option value={15}>15 dòng</option>
                    </select>
                </div>
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
    )
}

export default Manager;