import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import styles from './DirectorDashboard.module.css';
import { API_ENDPOINTS } from '../../config/api';
import CaseDetailModal from '../../components/CaseDetailModal/CaseDetailModal';
import DataTable from '../../components/DataTable/DataTable';
import { jwtDecode } from "jwt-decode";

// Đăng ký các module cần thiết của Chart.js
ChartJS.register(CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend);

// Component con cho các thẻ thống kê
const StatCard = ({ icon, title, value, type = 'primary', onClick }) => (
    <div className={`${styles.statCard} ${onClick ? styles.clickable : ''}`} onClick={onClick}>
        <div className={`${styles.icon} ${styles[type]}`}>{icon}</div>
        <div className={styles.info}>
            <div className={styles.title}>{title}</div>
            <div className={styles.value}>{value}</div>
        </div>
    </div>
);

export default function DirectorDashboard() {
    // View state: 'overview' or 'cases'
    const [currentView, setCurrentView] = useState('overview');
    
    // Dashboard stats states
    const [stats, setStats] = useState(null);
    const [isStatsLoading, setIsStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState(null);
    
    // Cases states
    const [cases, setCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterEmployee, setFilterEmployee] = useState('');
    const [filterBranch, setFilterBranch] = useState('');
    const [employees, setEmployees] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedCaseId, setSelectedCaseId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [totalCases, setTotalCases] = useState(0);
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentUser, setCurrentUser] = useState(null);
    const limit = 10; // Số dòng mỗi trang
    const navigate = useNavigate();

    // Get current user from token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setCurrentUser(decoded);
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
    }, []);

    // Fetch dashboard stats when in overview mode
    useEffect(() => {
        if (currentView === 'overview') {
            fetchDashboardStats();
        }
    }, [currentView]);

    // Fetch cases when in cases mode
    useEffect(() => {
        if (currentView === 'cases') {
            fetchAllCases();
        }
    }, [currentView, currentPage, searchTerm, filterType, filterStatus, filterEmployee, filterBranch, sortField, sortDirection, currentUser]);

    // Reset trang về 1 khi thay đổi bộ lọc hoặc sort
    useEffect(() => {
        if (currentView === 'cases' && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [searchTerm, filterType, filterStatus, filterEmployee, filterBranch, sortField, sortDirection]);

    // Fetch employees when component mounts
    useEffect(() => {
        fetchEmployees();
        fetchBranches();
    }, []);

    const fetchDashboardStats = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            setIsStatsLoading(true);
            const response = await fetch(API_ENDPOINTS.DASHBOARD.DIRECTOR_STATS, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Không thể tải dữ liệu dashboard.');
            }
            
            const result = await response.json();
            setStats(result.data);

        } catch (err) {
            setStatsError(err.message);
        } finally {
            setIsStatsLoading(false);
        }
    };

    const fetchAllCases = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            setIsLoading(true);
            // Tạo URL với các tham số sort
            let url = `${API_ENDPOINTS.CASES.ALL_CASES}?page=${currentPage}&limit=${limit}&search=${searchTerm}&type=${filterType}&status=${filterStatus}&employee_code=${filterEmployee}&branch_code=${filterBranch}`;
            
            // Thêm tham số sort nếu có
            if (sortField) {
                url += `&sortBy=${sortField}&sortOrder=${sortDirection}`;
            }

            // Branch-based filtering for BGĐ directors
            // Nếu BGĐ thuộc chi nhánh khác không phải 6421 thì chỉ hiển thị hồ sơ thuộc chi nhánh đó
            if (currentUser && currentUser.dept === 'BGĐ' && currentUser.branch_code !== '6421') {
                url += `&branch_code=${currentUser.branch_code}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Không thể tải danh sách hồ sơ.');
            }

            const result = await response.json();
            setCases(result.data.cases || []);
            setTotalPages(result.data.totalPages || 1);
            setTotalCases(result.data.totalCases || 0);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEmployees = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(API_ENDPOINTS.USERS.EMPLOYEES_FOR_FILTER, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                setEmployees(result.employees || []);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchBranches = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(API_ENDPOINTS.USERS.BRANCHES_FOR_FILTER, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                setBranches(result.branches || []);
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    // Chuẩn bị dữ liệu cho pie chart hồ sơ nội bảng/ngoại bảng
    const casesPieChartData = {
        labels: ['Nội bảng', 'Ngoại bảng'],
        datasets: [{
            data: [stats?.internalCases || 0, stats?.externalCases || 0],
            backgroundColor: [
                '#3b82f6', // Nội bảng - đỏ
                '#f97316'  // Ngoại bảng - xanh lá
            ],
            borderColor: [
                '#3b82f6',
                '#f97316'
            ],
            borderWidth: 2,
        }]
    };

    // Chuẩn bị dữ liệu cho pie chart dư nợ nội bảng/ngoại bảng
    const debtPieChartData = {
        labels: ['Nội bảng', 'Ngoại bảng'],
        datasets: [{
            data: [stats?.internalOutstandingDebt || 0, stats?.externalOutstandingDebt || 0],
            backgroundColor: [
                '#0ea5e9', // Nội bảng - xanh dương
                '#f59e0b'  // Ngoại bảng - cam
            ],
            borderColor: [
                '#0ea5e9',
                '#f59e0b'
            ],
            borderWidth: 2,
        }]
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    font: {
                        size: 14
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value.toLocaleString('vi-VN')} (${percentage}%)`;
                    }
                }
            }
        },
        animation: {
            animateRotate: true,
            animateScale: true
        }
    };

    const debtPieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    font: {
                        size: 14
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        const formattedValue = (value / 1e9).toFixed(2);
                        return `${label}: ${formattedValue} Tỷ (${percentage}%)`;
                    }
                }
            }
        },
        animation: {
            animateRotate: true,
            animateScale: true
        }
    };

    // Plugin tùy chỉnh để hiển thị values trên pie chart
    const valueDisplayPlugin = {
        id: 'valueDisplay',
        afterDatasetsDraw: function(chart) {
            const ctx = chart.ctx;
            const datasets = chart.data.datasets;
            
            datasets.forEach((dataset, datasetIndex) => {
                const meta = chart.getDatasetMeta(datasetIndex);
                
                meta.data.forEach((element, index) => {
                    const data = dataset.data[index];
                        const total = dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((data / total) * 100).toFixed(1);
                    
                    // Tính toán vị trí để đặt text
                    const { x, y } = element.tooltipPosition();
                    
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 12px Arial';
                    
                    // Hiển thị giá trị và phần trăm
                    let displayText;
                    if (chart.canvas.id === 'debt-chart') {
                        const formattedValue = (data / 1e9).toFixed(1);
                        displayText = `${formattedValue}Tỷ\n${percentage}%`;
                    } else {
                        displayText = `${data.toLocaleString('vi-VN')}\n${percentage}%`;
                    }
                    
                    const lines = displayText.split('\n');
                    lines.forEach((line, lineIndex) => {
                        ctx.fillText(line, x, y + (lineIndex - 0.5) * 15);
                    });
                    
                    ctx.restore();
                });
            });
        }
    };

    const handleViewDetail = (row) => {
        setSelectedCaseId(row.case_id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCaseId(null);
    };

    const handleSort = (field) => {
        // Nếu click vào cùng field, đổi direction
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Field mới, set thành asc
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Component để hiển thị loại case (nội bảng/ngoại bảng) - đồng bộ với MyCases
    const CaseTypeBadge = ({ caseType }) => {
        const isInternal = caseType === 'internal';
        return (
            <span className={`${styles.caseTypeBadge} ${isInternal ? styles.internal : styles.external}`}>
                {isInternal ? 'Nội bảng' : 'Ngoại bảng'}
            </span>
        );
    };

    // Helper function để chuyển đổi status code thành tên hiển thị (đồng bộ với MyCases)
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

    const getStatusClass = (status) => {
        const statusClassMap = {
            'beingFollowedUp': 'beingFollowedUp',
            'beingSued': 'beingSued',
            'awaitingJudgmentEffect': 'awaitingJudgmentEffect',
            'beingExecuted': 'beingExecuted',
            'proactivelySettled': 'proactivelySettled',
            'debtSold': 'debtSold',
            'amcHired': 'amcHired',
        };
        return statusClassMap[status] || 'statusDefault';
    };

    // Định nghĩa columns cho DataTable
    const tableColumns = [
        {
            key: 'customer_code',
            title: 'Mã KH',
            width: '120px',
            render: (value) => (
                <span style={{ fontWeight: '600', color: '#495057' }}>{value}</span>
            )
        },
        {
            key: 'customer_name',
            title: 'Tên khách hàng',
            width: '300px',
            render: (value) => (
                <span className="customerNameCell" style={{
                    fontWeight: '500'
                }}>{value}</span>
            )
        },
        {
            key: 'outstanding_debt',
            title: 'Dư nợ',
            width: '150px',
            sortValue: (value) => {
                // Chuyển đổi về số để sort chính xác
                const numValue = parseFloat(value);
                return isNaN(numValue) ? 0 : numValue;
            },
            render: (value) => (
                <span className="currencyCell" style={{ color: '#28a745', fontWeight: '600' }}>
                    {formatCurrency(value)}
                </span>
            )
        },
        {
            key: 'case_type',
            title: 'Loại',
            width: '120px',
            sortValue: (value) => {
                // Trả về số để sort theo thứ tự logic: Nội bảng (1) trước, Ngoại bảng (2) sau
                return value === 'internal' ? 1 : 2;
            },
            render: (value) => <CaseTypeBadge caseType={value} />
        },
        {
            key: 'state',
            title: 'Trạng thái',
            width: '120px',
            sortValue: (value) => {
                // Sắp xếp theo thứ tự ưu tiên status codes
                const order = {
                    'beingFollowedUp': 1,
                    'beingSued': 2,
                    'awaitingJudgmentEffect': 3,
                    'beingExecuted': 4,
                    'proactivelySettled': 5,
                    'debtSold': 6,
                    'amcHired': 7
                };
                return order[value] || 999;
            },
            render: (value) => (
                <span className={`statusCell ${styles[getStatusClass(value)]}`}>
                    {getStatusDisplayName(value)}
                </span>
            )
        },
        {
            key: 'created_date',
            title: 'Ngày tạo',
            width: '120px',
            sortValue: (value) => {
                // Chuyển đổi string thành Date object để sort chính xác
                return new Date(value).getTime();
            },
            render: (value) => (
                <span className="dateCell" style={{ color: '#6c757d', fontSize: '13px' }}>
                    {formatDate(value)}
                </span>
            )
        },
        {
            key: 'officer',
            title: 'Người phụ trách',
            width: '180px',
            sortValue: (value, row) => row.officer?.fullname || 'Chưa phân công',
            render: (value, row) => (
                <span className="officerCell" style={{ color: '#495057', fontWeight: '500' }}>
                    {row.officer?.fullname || 'Chưa phân công'}
                </span>
            )
        }
    ];

    if (error && currentView === 'cases') {
        return <div className={`${styles.message} ${styles.error}`}>Lỗi: {error}</div>;
    }

    if (statsError && currentView === 'overview') {
        return <div className={`${styles.message} ${styles.error}`}>Lỗi: {statsError}</div>;
    }

    return (
        <div className={styles.directorDashboard}>
            {currentView === 'overview' ? (
                // Overview View - Dashboard Stats
                <>
                    <div className={styles.pageHeader}>
                        <div className={styles.headerContent}>
                            <h1>Tổng quan</h1>
                            <p>Thống kê tổng thể dư nợ</p>
                        </div>
                    </div>

                    {isStatsLoading ? (
                        <div className={styles.message}>Đang tải dữ liệu...</div>
                    ) : (
                        <>
                            <section className={styles.statsGrid}>
                                <StatCard 
                                    icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>} 
                                    title="Tổng hồ sơ" 
                                    value={stats?.totalCases?.toLocaleString('vi-VN') || 0} 
                                    type="primary"
                                    onClick={() => setCurrentView('cases')}
                                />
                                <StatCard 
                                    icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c2.07-.4 3.5-1.65 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>} 
                                    title="Tổng dư nợ" 
                                    value={`${(stats?.totalOutstandingDebt / 1e9)?.toFixed(2) || 0} Tỷ`} 
                                    type="secondary" 
                                />
                            </section>

                            {/* Pie Charts cho Hồ sơ và Dư nợ */}
                            <section className={styles.pieChartsGrid}>
                                <div className={styles.card}>
                                    <div className={styles.cardHeader}>Phân bố hồ sơ theo loại</div>
                                    <div className={styles.pieChartContainer}>
                                        <Pie 
                                            data={casesPieChartData} 
                                            options={pieChartOptions}
                                            plugins={[valueDisplayPlugin]}
                                            id="cases-chart"
                                        />
                                    </div>
                                </div>
                                <div className={styles.card}>
                                    <div className={styles.cardHeader}>Phân bố dư nợ theo loại</div>
                                    <div className={styles.pieChartContainer}>
                                        <Pie 
                                            data={debtPieChartData} 
                                            options={debtPieChartOptions}
                                            plugins={[valueDisplayPlugin]}
                                            id="debt-chart"
                                        />
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </>
            ) : (
                // Cases List View - Current DirectorDashboard
                <>
                    <div className={styles.pageHeader}>
                        <div className={styles.headerProfiles}>
                            <h1>Danh sách tất cả hồ sơ</h1>
                            <button 
                                onClick={() => setCurrentView('overview')} 
                                className={styles.backButton}
                            >
                                ◀ Quay lại tổng quan
                            </button>
                        </div>
                    </div>

            {/* Bộ lọc và tìm kiếm */}
            <div className={styles.filterSection}>
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên khách hàng hoặc mã khách hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.filters}>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">Tất cả loại</option>
                        <option value="internal">Nội bảng</option>
                        <option value="external">Ngoại bảng</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="beingFollowedUp">Đang đôn đốc</option>
                        <option value="beingSued">Đang khởi kiện</option>
                        <option value="awaitingJudgmentEffect">Chờ hiệu lực án</option>
                        <option value="beingExecuted">Đang thi hành án</option>
                        <option value="proactivelySettled">Chủ động XLTS</option>
                        <option value="debtSold">Bán nợ</option>
                        <option value="amcHired">Thuê AMC XLN</option>
                    </select>
                    <select
                        value={filterEmployee}
                        onChange={(e) => setFilterEmployee(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">Tất cả nhân viên</option>
                        {employees.map(employee => (
                            <option key={employee.employee_code} value={employee.employee_code}>
                                {employee.fullname}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filterBranch}
                        onChange={(e) => setFilterBranch(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">Tất cả chi nhánh</option>
                        {branches.map(branch => (
                            <option key={branch.branch_code} value={branch.branch_code}>
                                {branch.branch_code === '6421' ? 'Hội sở' : branch.branch_code === '6221' ? 'Chi nhánh Nam Hoa' : 'Chi nhánh 6'}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Container cho DataTable với phân trang */}
            <div className={styles.tableWithPagination}>
                {/* Danh sách hồ sơ - Data Table */}
                <div style={{ minHeight: 0, display: 'flex', flexDirection: 'column', height: '600px' }}>
                    <DataTable
                        data={cases}
                        columns={tableColumns}
                        onRowAction={handleViewDetail}
                        actionButtonText="Xem chi tiết"
                        actionWidth="120px"
                        isLoading={isLoading}
                        emptyMessage="Không tìm thấy hồ sơ nào."
                        sortable={true}
                        onSort={handleSort}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        serverSideSort={true}
                    />
                </div>

                {/* Phân trang - Fixed at bottom */}
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className={styles.pageBtn}
                        >
                            Trang trước
                        </button>
                        <span className={styles.pageInfo}>
                            Trang {currentPage} / {totalPages} ({totalCases} hồ sơ)
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className={styles.pageBtn}
                        >
                            Trang sau
                        </button>
                    </div>
                )}
            </div>

            {/* Modal hiển thị chi tiết case */}
            <CaseDetailModal
                caseId={selectedCaseId}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
                </>
            )}
        </div>
    );
}
