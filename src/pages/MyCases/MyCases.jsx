import { useState, useMemo } from 'react';
import styles from './MyCases.module.css';
import Pagination from '../../components/Pagination/Pagination'; // Import component mới

// Dữ liệu giả, trong thực tế sẽ lấy từ API
const initialCases = [
    { id: 'HS-2025-07-123', client: 'Công ty TNHH BĐS Thịnh Phát', debt: 12550000000, status: 'Đã khởi kiện', updated: '20/07/2025' },
    { id: 'HS-2025-07-115', client: 'Công ty Vận tải Sài Gòn', debt: 7200000000, status: 'Đang xử lý', updated: '18/07/2025' },
    { id: 'HS-2025-05-101', client: 'Công ty Dệt may An Phước', debt: 3500000000, status: 'Mới', updated: '14/07/2025' },
    // Thêm dữ liệu để thấy phân trang
    { id: 'HS-2025-05-100', client: 'Ông Trần Văn Nam', debt: 1200000000, status: 'Mới', updated: '13/07/2025' },
    { id: 'HS-2025-04-098', client: 'Công ty Xây dựng Hòa Bình', debt: 8900000000, status: 'Đang xử lý', updated: '12/07/2025' },
    { id: 'HS-2025-04-097', client: 'Tập đoàn Hoàng Anh Gia Lai', debt: 25000000000, status: 'Đã khởi kiện', updated: '11/07/2025' },
];

const ITEMS_PER_PAGE = 5; // Số lượng hồ sơ trên mỗi trang

const StatusBadge = ({ status }) => {
    const statusClass = {
        'Mới': styles.statusNew,
        'Đang xử lý': styles.statusInprogress,
        'Đã khởi kiện': styles.statusLawsuit
    };
    return <span className={`${styles.statusBadge} ${statusClass[status] || ''}`}>{status}</span>
};

function MyCases() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Lọc dữ liệu dựa trên thanh tìm kiếm và bộ lọc trạng thái
    const filteredCases = useMemo(() => {
        setCurrentPage(1); // Reset về trang 1 mỗi khi lọc
        return initialCases.filter(c => {
            const searchMatch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                c.client.toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = statusFilter ? c.status === statusFilter : true;
            return searchMatch && statusMatch;
        });
    }, [searchTerm, statusFilter]);

    // Tính toán dữ liệu cho trang hiện tại
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentCases = filteredCases.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCases.length / ITEMS_PER_PAGE);


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
                            <th>Mã HS</th>
                            <th>Tên Khách hàng</th>
                            <th>Dư nợ (VND)</th>
                            <th>Trạng thái</th>
                            <th>Ngày cập nhật cuối</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCases.map(c => (
                            <tr key={c.id}>
                                <td>{c.id}</td>
                                <td>{c.client}</td>
                                <td>{c.debt.toLocaleString('vi-VN')}</td>
                                <td><StatusBadge status={c.status} /></td>
                                <td>{c.updated}</td>
                                <td className={styles.actionCell}><a href="#">Cập nhật</a></td>
                            </tr>
                        ))}
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