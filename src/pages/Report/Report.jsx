import { useState, useEffect } from 'react';
import styles from './Report.module.css';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Report() {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [filterOptions, setFilterOptions] = useState({
        statuses: [],
        branches: [],
        departments: [],
        employees: []
    });

    const [filters, setFilters] = useState({
        status: '',
        caseType: '',
        branch: '',
        department: '',
        employeeCode: '',
        startDate: '',
        endDate: ''
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    // Lấy danh sách options cho filter
    useEffect(() => {
        fetchFilterOptions();
    }, []);

    const fetchFilterOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/report/filters`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                setFilterOptions(result.data);
            } else {
                toast.error('Lỗi khi tải danh sách bộ lọc');
            }
        } catch (error) {
            console.error('Error fetching filter options:', error);
            toast.error('Lỗi kết nối khi tải bộ lọc');
        }
    };

    // Lấy dữ liệu báo cáo
    const fetchReportData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams();
            
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch(`${API_BASE_URL}/api/report/data?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                setReportData(result.data);
                setCurrentPage(1);
                toast.success(`Đã tải ${result.total} bản ghi`);
            } else {
                toast.error('Lỗi khi tải dữ liệu báo cáo');
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
            toast.error('Lỗi kết nối khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // Xuất Excel
    const exportToExcel = async () => {
        setExporting(true);
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams();
            
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch(`${API_BASE_URL}/api/report/export?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `BaoCao_${new Date().toISOString().slice(0, 10)}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success('Xuất báo cáo thành công!');
            } else {
                toast.error('Lỗi khi xuất báo cáo');
            }
        } catch (error) {
            console.error('Error exporting report:', error);
            toast.error('Lỗi kết nối khi xuất báo cáo');
        } finally {
            setExporting(false);
        }
    };

    // Xử lý thay đổi filter
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Reset filters
    const resetFilters = () => {
        setFilters({
            status: '',
            caseType: '',
            branch: '',
            department: '',
            employeeCode: '',
            startDate: '',
            endDate: ''
        });
        setReportData([]);
    };

    // Pagination
    const totalPages = Math.ceil(reportData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = reportData.slice(startIndex, endIndex);

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount) return '';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    return (
        <div className={styles.reportPage}>
            <div className={styles.pageHeader}>
                <h1>Báo cáo xuất Excel</h1>
            </div>

            <div className={styles.card}>
                {/* Bộ lọc */}
                <div className={styles.filterSection}>
                    <h3>Bộ lọc báo cáo</h3>
                    
                    <div className={styles.filterGrid}>
                        {/* Trạng thái khoản vay */}
                        <div className={styles.filterGroup}>
                            <label>Trạng thái khoản vay</label>
                            <select 
                                value={filters.status} 
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="">Tất cả trạng thái</option>
                                {filterOptions.statuses.map(status => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Loại Case */}
                        <div className={styles.filterGroup}>
                            <label>Loại</label>
                            <select 
                                value={filters.caseType} 
                                onChange={(e) => handleFilterChange('caseType', e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="">Tất cả loại case</option>
                                <option value="internal">Nội bảng</option>
                                <option value="external">Ngoại bảng</option>
                            </select>
                        </div>

                        {/* Chi nhánh */}
                        <div className={styles.filterGroup}>
                            <label>Chi nhánh</label>
                            <select 
                                value={filters.branch} 
                                onChange={(e) => handleFilterChange('branch', e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="">Tất cả chi nhánh</option>
                                {filterOptions.branches.map(branch => (
                                    <option key={branch} value={branch}>{branch}</option>
                                ))}
                            </select>
                        </div>

                        {/* Phòng ban */}
                        <div className={styles.filterGroup}>
                            <label>Phòng ban</label>
                            <select 
                                value={filters.department} 
                                onChange={(e) => handleFilterChange('department', e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="">Tất cả phòng ban</option>
                                {filterOptions.departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        {/* CBTD */}
                        <div className={styles.filterGroup}>
                            <label>Cán bộ tín dụng</label>
                            <select 
                                value={filters.employeeCode} 
                                onChange={(e) => handleFilterChange('employeeCode', e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="">Tất cả CBTD</option>
                                {filterOptions.employees.map(emp => (
                                    <option key={emp.employee_code} value={emp.employee_code}>
                                        {emp.fullname} ({emp.employee_code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Từ ngày */}
                        <div className={styles.filterGroup}>
                            <label>Từ ngày</label>
                            <input 
                                type="date" 
                                value={filters.startDate} 
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                className={styles.filterInput}
                            />
                        </div>

                        {/* Đến ngày */}
                        <div className={styles.filterGroup}>
                            <label>Đến ngày</label>
                            <input 
                                type="date" 
                                value={filters.endDate} 
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                className={styles.filterInput}
                            />
                        </div>
                    </div>

                    <div className={styles.filterActions}>
                        <button 
                            onClick={fetchReportData} 
                            disabled={loading}
                            className={styles.searchBtn}
                        >
                            {loading ? 'Đang tải...' : 'Tìm kiếm'}
                        </button>
                        <button 
                            onClick={resetFilters}
                            className={styles.resetBtn}
                        >
                            Đặt lại
                        </button>
                        <button 
                            onClick={exportToExcel}
                            disabled={exporting || reportData.length === 0}
                            className={styles.exportBtn}
                        >
                            {exporting ? 'Đang xuất...' : 'Xuất Excel'}
                        </button>
                    </div>
                </div>

                {/* Kết quả */}
                {reportData.length > 0 && (
                    <div className={styles.resultsSection}>
                        <div className={styles.resultsHeader}>
                            <h3>Kết quả tìm kiếm</h3>
                            <span className={styles.resultCount}>
                                Tổng: {reportData.length} bản ghi
                            </span>
                        </div>

                        <div className={styles.tableContainer}>
                            <table className={styles.dataTable}>
                                <thead>
                                    <tr>
                                        {/* <th>STT</th> */}
                                        <th>Mã KH</th>
                                        <th>Tên KH</th>
                                        <th>Trạng thái</th>
                                        {/* <th>Dư nợ</th> */}
                                        <th>Loại Case</th>
                                        <th>Chi nhánh</th>
                                        <th>CBTD</th>
                                        <th>Cập nhật mới nhất</th>
                                        <th>Ngày cập nhật</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentData.map((row, index) => (
                                        <tr key={`${row.debt_cases_customer_code}-${index}`}>
                                            {/* <td>{startIndex + index + 1}</td> */}
                                            <td>{row.debt_cases_customer_code}</td>
                                            <td>{row.debt_cases_customer_name}</td>
                                            <td>
                                                <span className={styles.statusBadge}>
                                                    {row.debt_cases_state}
                                                </span>
                                            </td>
                                            {/* <td>{formatCurrency(row.debt_cases_outstanding_debt)}</td> */}
                                            <td>
                                                <span className={styles.typeBadge}>
                                                    {row.debt_cases_case_type}
                                                </span>
                                            </td>
                                            <td>{row.user_branch_code === '6421' ? 'Hội sở' : row.user_branch_code === '6221' ? 'CN Nam Hoa' : 'Chi nhánh 6'}</td>
                                            <td>{row.user_fullname || 'Chưa phân công'}</td>
                                            <td className={styles.updateContent}>
                                                {row.case_update_update_content || 'Chưa có cập nhật'}
                                            </td>
                                            <td>{formatDate(row.update_date)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={styles.pageBtn}
                                >
                                    Trước
                                </button>
                                
                                <span className={styles.pageInfo}>
                                    Trang {currentPage} / {totalPages}
                                </span>
                                
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={styles.pageBtn}
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty state */}
                {!loading && reportData.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>Chưa có dữ liệu. Vui lòng chọn điều kiện lọc và nhấn "Tìm kiếm".</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Report;
