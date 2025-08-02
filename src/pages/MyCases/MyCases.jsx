import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './MyCases.module.css';
import Pagination from '../../components/Pagination/Pagination';
import DataTable from '../../components/DataTable/DataTable';
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

// Helper function để format tiền tệ
const formatCurrency = (amount) => {
    const numValue = parseFloat(amount);
    if (isNaN(numValue)) return '0';
    return numValue.toLocaleString('vi-VN');
};

function MyCases() {
    // State quản lý danh sách cases và phân trang
    const [cases, setCases] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCases, setTotalCases] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // State quản lý filters và sorting
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [caseTypeFilter, setCaseTypeFilter] = useState('');
    const [sortField, setSortField] = useState('last_modified_date');
    const [sortDirection, setSortDirection] = useState('desc');
    
    // State để quản lý loading và initial load
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const fetchingRef = useRef(false);
    const navigate = useNavigate();

    // Callback để fetch cases từ server với pagination
    const fetchMyCases = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        if (fetchingRef.current) {
            return;
        }

        try {
            fetchingRef.current = true;
            setIsLoading(true);
            setError(null);
            
            // Tạo URL với các tham số pagination và filtering
            let url = `${API_ENDPOINTS.CASES.MY_CASES}?page=${currentPage}&limit=${ITEMS_PER_PAGE}&search=${searchTerm}&type=${caseTypeFilter}&status=${statusFilter}`;
            
            // Thêm tham số sort nếu có
            if (sortField) {
                url += `&sortBy=${sortField}&sortOrder=${sortDirection}`;
            }
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Không thể tải dữ liệu hồ sơ.');
            }

            const result = await response.json();
            setCases(result.cases || []);
            setTotalPages(result.totalPages || 1);
            setTotalCases(result.totalCases || 0);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            fetchingRef.current = false;
        }
    }, [currentPage, searchTerm, caseTypeFilter, statusFilter, sortField, sortDirection, navigate]);

    // Effect để fetch data
    useEffect(() => {
        fetchMyCases();
    }, [fetchMyCases]);

    // Effect để reset page khi filter thay đổi  
    useEffect(() => {
        if (!isInitialLoad) {
            setCurrentPage(1);
        } else {
            setIsInitialLoad(false);
        }
    }, [searchTerm, statusFilter, caseTypeFilter, sortField, sortDirection]);

    // Hàm xử lý sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Hàm xử lý khi click vào row để xem chi tiết
    const handleRowAction = (caseData) => {
        navigate(`/case/${caseData.case_id}`);
    };

    // Định nghĩa columns cho DataTable
    const tableColumns = [
        {
            key: 'customer_code',
            title: 'Mã Khách hàng',
            width: '150px',
            render: (value) => (
                <span style={{ fontWeight: '600', color: '#495057' }}>{value}</span>
            )
        },
        {
            key: 'customer_name',
            title: 'Tên Khách hàng',
            width: '300px',
            render: (value) => (
                <span style={{ fontWeight: '500' }}>{value}</span>
            )
        },
        {
            key: 'case_type',
            title: 'Loại',
            width: '120px',
            sortValue: (value) => {
                return value === 'internal' ? 1 : 2;
            },
            render: (value) => <CaseTypeBadge caseType={value} />
        },
        {
            key: 'outstanding_debt',
            title: 'Dư nợ (VND)',
            width: '180px',
            sortValue: (value) => {
                const numValue = parseFloat(value);
                return isNaN(numValue) ? 0 : numValue;
            },
            render: (value) => (
                <span style={{ color: '#28a745', fontWeight: '600' }}>
                    {formatCurrency(value)}
                </span>
            )
        },
        {
            key: 'state',
            title: 'Trạng thái',
            width: '150px',
            render: (value) => <StatusBadge status={value} />
        },
        {
            key: 'last_modified_date',
            title: 'Ngày cập nhật cuối',
            width: '160px',
            sortValue: (value) => new Date(value).getTime(),
            render: (value) => new Date(value).toLocaleDateString('vi-VN')
        }
    ];

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
                <Link to="/manager-dashboard" className={styles.backLink}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.backIcon}>
                        <polyline points="15 18 9 12 15 6"></polyline>
                        <line x1="20" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Quay lại Dashboard
                </Link>
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
                    <select
                        className={styles.filterSelect}
                        value={caseTypeFilter}
                        onChange={e => setCaseTypeFilter(e.target.value)}
                    >
                        <option value="">Tất cả Loại</option>
                        <option value="internal">Nội bảng</option>
                        <option value="external">Ngoại bảng</option>
                    </select>
                    <select
                        className={styles.filterSelect}
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
                </div>

                <div className={styles.tableContainer}>
                    <DataTable
                        data={cases}
                        columns={tableColumns}
                        onRowAction={handleRowAction}
                        actionButtonText="Cập nhật"
                        actionWidth="120px"
                        isLoading={isLoading}
                        emptyMessage="Không tìm thấy hồ sơ nào."
                        sortable={true}
                        onSort={handleSort}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        serverSideSort={true}
                    />
                    
                    <div className={styles.paginationContainer}>
                        <div className={styles.pageInfo}>
                            Hiển thị {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalCases)} trên tổng số {totalCases} hồ sơ
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
}

export default MyCases;

