import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MyCases.module.css';
import Pagination from '../../components/Pagination/Pagination';
import { jwtDecode } from "jwt-decode";

const ITEMS_PER_PAGE = 5;

const StatusBadge = ({ status }) => {
    const statusClass = {
        'Mới': styles.statusNew,
        'Đang xử lý': styles.statusInprogress,
        'Đã khởi kiện': styles.statusLawsuit
    };
    return <span className={`${styles.statusBadge} ${statusClass[status] || ''}`}>{status}</span>
};


function MyCases() {
    const [allCases, setAllCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    // Sử dụng useEffect để fetch dữ liệu từ API khi component được mount
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
                const response = await fetch('http://localhost:3000/api/cases/my-cases', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Không thể tải dữ liệu hồ sơ.');
                }

                const data = await response.json();
                setAllCases(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCases();
    }, [navigate]);

    // Lọc dữ liệu dựa trên thanh tìm kiếm và bộ lọc trạng thái
    const filteredCases = useMemo(() => {
        setCurrentPage(1);
        return allCases.filter(c => {
            const searchMatch = c.case_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                c.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = statusFilter ? c.state === statusFilter : true;
            return searchMatch && statusMatch;
        });
    }, [searchTerm, statusFilter, allCases]);

    // Tính toán dữ liệu cho trang hiện tại
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentCases = filteredCases.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCases.length / ITEMS_PER_PAGE);
    
    if (isLoading) {
        return <div className={styles.loading}>Đang tải dữ liệu hồ sơ...</div>;
    }
    
    if (error) {
        return <div className={styles.error}>Lỗi: {error}</div>;
    }

    return (
        <>
            <div className={styles.pageHeader}>
                <h1>Danh sách Hồ sơ được phân công</h1>
            </div>

            <div className={styles.filterBar}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Tìm theo Mã HS, Tên Khách hàng..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <select 
                    className={styles.filterSelect}
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                >
                    <option value="">Tất cả Trạng thái</option>
                    <option value="Mới">Mới</option>
                    <option value="Đang xử lý">Đang xử lý</option>
                    <option value="Đã khởi kiện">Đã khởi kiện</option>
                </select>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Mã Khách hàng</th>
                            <th>Tên Khách hàng</th>
                            <th>Dư nợ (VND)</th>
                            <th>Trạng thái</th>
                            <th>Ngày cập nhật cuối</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCases.length > 0 ? (
                            currentCases.map(c => (
                                <tr key={c.case_id}>
                                    <td>{c.customer_code}</td>
                                    <td>{c.customer_name}</td>
                                    <td>{parseFloat(c.outstanding_debt).toLocaleString('vi-VN')}</td>
                                    <td><StatusBadge status={c.state} /></td>
                                    <td>{new Date(c.last_modified_date).toLocaleDateString('vi-VN')}</td>
                                    <td className={styles.actionCell}><a href="#">Cập nhật</a></td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className={styles.noData}>Không tìm thấy hồ sơ nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className={styles.paginationContainer}>
                    <div className={styles.pageInfo}>
                        Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredCases.length)} trên tổng số {filteredCases.length} hồ sơ
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

export default MyCases;