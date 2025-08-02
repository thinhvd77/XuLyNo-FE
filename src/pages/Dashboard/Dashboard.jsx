import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import styles from './Dashboard.module.css';
import { API_ENDPOINTS } from '../../config/api';

// Đăng ký các module cần thiết của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Component con cho các thẻ thống kê
const StatCard = ({ icon, title, value, type = 'primary' }) => (
    <div className={styles.statCard}>
        <div className={`${styles.icon} ${styles[type]}`}>{icon}</div>
        <div className={styles.info}>
            <div className={styles.title}>{title}</div>
            <div className={styles.value}>{value}</div>
        </div>
    </div>
);

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(API_ENDPOINTS.DASHBOARD.STATS, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Không thể tải dữ liệu dashboard.');
                }
                
                const result = await response.json();
                console.log(result)
                setStats(result.data);

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    // Chuẩn bị dữ liệu cho biểu đồ từ state
    const chartData = {
        labels: stats?.officerStats.map(officer => officer.user_fullname) || [],
        datasets: [{
            label: 'Số hồ sơ',
            data: stats?.officerStats.map(officer => officer.caseCount) || [],
            backgroundColor: '#DA251Db3',
            borderColor: '#DA251D',
            borderWidth: 1,
            borderRadius: 4,
            barThickness: 50,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
    };

    if (isLoading) {
        return <div className={styles.message}>Đang tải dữ liệu...</div>;
    }
    
    if (error) {
        return <div className={`${styles.message} ${styles.error}`}>Lỗi: {error}</div>;
    }

    return (
        <>
            <div className={styles.pageHeader}>
                <h1>Tổng quan</h1>
            </div>

            <section className={styles.statsGrid}>
                <StatCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>} 
                    title="Tổng hồ sơ" 
                    value={stats?.totalCases.toLocaleString('vi-VN') || 0} 
                    type="primary" 
                />
                <StatCard 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c2.07-.4 3.5-1.65 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>} 
                    title="Tổng dư nợ" 
                    value={`${(stats?.totalOutstandingDebt / 1e9).toFixed(2) || 0} Tỷ`} 
                    type="secondary" 
                />
            </section>

            {/* Thống kê nội bảng và ngoại bảng */}
            <section className={styles.debtTypeGrid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>Nội bảng</div>
                    <div className={styles.debtTypeStats}>
                        <div className={styles.debtTypeStat}>
                            <div className={styles.statLabel}>Số hồ sơ</div>
                            <div className={styles.statValue}>{stats?.internalCases.toLocaleString('vi-VN') || 0}</div>
                        </div>
                        <div className={styles.debtTypeStat}>
                            <div className={styles.statLabel}>Dư nợ</div>
                            <div className={styles.statValue}>{`${(stats?.internalOutstandingDebt / 1e9).toFixed(2) || 0} Tỷ`}</div>
                        </div>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>Ngoại bảng</div>
                    <div className={styles.debtTypeStats}>
                        <div className={styles.debtTypeStat}>
                            <div className={styles.statLabel}>Số hồ sơ</div>
                            <div className={styles.statValue}>{stats?.externalCases.toLocaleString('vi-VN') || 0}</div>
                        </div>
                        <div className={styles.debtTypeStat}>
                            <div className={styles.statLabel}>Dư nợ</div>
                            <div className={styles.statValue}>{`${(stats?.externalOutstandingDebt / 1e9).toFixed(2) || 0} Tỷ`}</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.contentGrid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>Số lượng hồ sơ theo nhân viên</div>
                    <div className={styles.chartContainer}>
                         <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>
            </section>
        </>
    );
}

export default Dashboard;