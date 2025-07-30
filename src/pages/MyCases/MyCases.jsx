import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './MyCases.module.css';
import Pagination from '../../components/Pagination/Pagination';
import { jwtDecode } from "jwt-decode";
import { API_ENDPOINTS } from '../../config/api';

const ITEMS_PER_PAGE = 10;

// Helper function để chuyển đổi status code thành tên hiển thị (đồng bộ với CaseDetail)
const getStatusDisplayName = (status) => {
    const statusMap = {
        'beingFollowedUp': 'Đang đôn đốc',
        'beingSued': 'Đang khởi kiện', 
        'awaitingJudgmentEffect': 'Chờ hiệu lực án',
        'beingExecuted': 'Đang thi hành án',
        'proactivelySettled': 'Chủ động XLTS',
        'debtSold': 'Bán nợ',
        'amcHired': 'Thuê AMC XLN'
    };
    return statusMap[status] || status;
};

const StatusBadge = ({ status }) => {
    const statusClass = {
        'beingFollowedUp': styles.beingFollowedUp,
        'beingSued': styles.beingSued,
        'awaitingJudgmentEffect': styles.awaitingJudgmentEffect,
        'beingExecuted': styles.beingExecuted,
        'proactivelySettled': styles.proactivelySettled,
        'debtSold': styles.debtSold,
        'amcHired': styles.amcHired,
    };
    return <span className={`${styles.statusBadge} ${statusClass[status] || ''}`}>{getStatusDisplayName(status)}</span>
};

// Component để hiển thị loại case (nội bảng/ngoại bảng)
const CaseTypeBadge = ({ caseType }) => {
    const isInternal = caseType === 'internal';
    return (
        <span className={`${styles.caseTypeBadge} ${isInternal ? styles.internal : styles.external}`}>
            {isInternal ? 'Nội bảng' : 'Ngoại bảng'}
        </span>
    );
};

// Component SortableHeader để hiển thị cột có thể sort
const SortableHeader = ({ field, currentSortField, sortDirection, onSort, children }) => {
    const handleClick = () => {
        onSort(field);
    };

    const getSortIcon = () => {
        if (currentSortField !== field) {
            return (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 10L12 6L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 14L12 18L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
        }
        return sortDirection === 'asc' 
            ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 14L12 10L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            )
            : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 10L12 14L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
    };

    return (
        <th 
            onClick={handleClick} 
            className={`${styles.sortableHeader} ${currentSortField === field ? styles.sorted : ''}`}
            style={{ cursor: 'pointer', userSelect: 'none' }}
        >
            <div className={styles.headerContent}>
                <span>{children}</span>
                <span className={styles.sortIcon}>{getSortIcon()}</span>
            </div>
        </th>
    );
};


function MyCases() {
    const [allCases, setAllCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [caseTypeFilter, setCaseTypeFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
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
                const response = await fetch(API_ENDPOINTS.CASES.MY_CASES, {
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

    // Hàm xử lý sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Lọc và sắp xếp dữ liệu
    const filteredCases = useMemo(() => {
        setCurrentPage(1);
        let filtered = allCases.filter(c => {
            const searchMatch = c.case_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = statusFilter ? c.state === statusFilter : true;
            const caseTypeMatch = caseTypeFilter ? c.case_type === caseTypeFilter : true;
            return searchMatch && statusMatch && caseTypeMatch;
        });

        // Áp dụng sorting nếu có
        if (sortField) {
            filtered.sort((a, b) => {
                let aValue = a[sortField];
                let bValue = b[sortField];

                // Xử lý đặc biệt cho cột dư nợ (outstanding_debt)
                if (sortField === 'outstanding_debt') {
                    aValue = parseFloat(aValue) || 0;
                    bValue = parseFloat(bValue) || 0;
                }
                // Xử lý đặc biệt cho cột ngày (last_modified_date)
                else if (sortField === 'last_modified_date') {
                    aValue = new Date(aValue);
                    bValue = new Date(bValue);
                }
                // Xử lý cho các cột text
                else if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                if (sortDirection === 'asc') {
                    return aValue > bValue ? 1 : -1;
                } else {
                    return aValue < bValue ? 1 : -1;
                }
            });
        }

        return filtered;
    }, [searchTerm, statusFilter, caseTypeFilter, allCases, sortField, sortDirection]);

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
                <h1>Hồ sơ của tôi</h1>
            </div>

            <div className={styles.card}>
                <div className={styles.filterBar}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Tìm theo Mã HS, Tên Khách hàng..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <div className={styles.customSelectWrapper}>
                        <select
                            className={styles.customSelect}
                            value={caseTypeFilter}
                            onChange={e => setCaseTypeFilter(e.target.value)}
                        >
                            <option value="">Tất cả Loại</option>
                            <option value="internal">Nội bảng</option>
                            <option value="external">Ngoại bảng</option>
                        </select>
                        <svg className={styles.selectIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6,9 12,15 18,9"></polyline>
                        </svg>
                    </div>
                    <div className={styles.customSelectWrapper}>
                        <select
                            className={styles.customSelect}
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="">Tất cả Trạng thái</option>
                            <option value="beingFollowedUp">Đang đôn đốc</option>
                            <option value="beingSued">Đang khởi kiện</option>
                            <option value="awaitingJudgmentEffect">Chờ hiệu lực án</option>
                            <option value="beingExecuted">Đang thi hành án</option>
                            <option value="proactivelySettled">Chủ động XLTS</option>
                            <option value="debtSold">Bán nợ</option>
                            <option value="amcHired">Thuê AMC XLN</option>
                        </select>
                        <svg className={styles.selectIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6,9 12,15 18,9"></polyline>
                        </svg>
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <SortableHeader 
                                        field="customer_code" 
                                        currentSortField={sortField} 
                                        sortDirection={sortDirection} 
                                        onSort={handleSort}
                                    >
                                        Mã Khách hàng
                                    </SortableHeader>
                                    <SortableHeader 
                                        field="customer_name" 
                                        currentSortField={sortField} 
                                        sortDirection={sortDirection} 
                                        onSort={handleSort}
                                    >
                                        Tên Khách hàng
                                    </SortableHeader>
                                    <th>Loại</th>
                                    <SortableHeader 
                                        field="outstanding_debt" 
                                        currentSortField={sortField} 
                                        sortDirection={sortDirection} 
                                        onSort={handleSort}
                                    >
                                        Dư nợ (VND)
                                    </SortableHeader>
                                    <th>Trạng thái</th>
                                    <SortableHeader 
                                        field="last_modified_date" 
                                        currentSortField={sortField} 
                                        sortDirection={sortDirection} 
                                        onSort={handleSort}
                                    >
                                        Ngày cập nhật cuối
                                    </SortableHeader>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentCases.length > 0 ? (
                                    currentCases.map(c => (
                                        <tr key={c.case_id}>
                                            <td>{c.customer_code}</td>
                                            <td>{c.customer_name}</td>
                                            <td><CaseTypeBadge caseType={c.case_type} /></td>
                                            <td>{parseFloat(c.outstanding_debt).toLocaleString('vi-VN')}</td>
                                            <td><StatusBadge status={c.state} /></td>
                                            <td>{new Date(c.last_modified_date).toLocaleDateString('vi-VN')}</td>
                                            <td className={styles.actionCell}><Link to={`/case/${c.case_id}`}>Cập nhật</Link></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className={styles.noData}>Không tìm thấy hồ sơ nào.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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
            </div>
        </>
    );
} export default MyCases;