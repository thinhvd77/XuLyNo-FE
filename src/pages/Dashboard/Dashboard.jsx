import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import styles from './Dashboard.module.css';

// Đăng ký các module cần thiết của Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Tách StatCard thành component con để code sạch hơn
const StatCard = ({ icon, title, value, type }) => (
    <div className={styles.statCard}>
        <div className={`${styles.icon} ${styles[type]}`}>
            {icon}
        </div>
        <div className={styles.info}>
            <div className={styles.title}>{title}</div>
            <div className={styles.value}>{value}</div>
        </div>
    </div>
);

// Dữ liệu giả cho biểu đồ
const chartData = {
    labels: ['Nguyễn Văn An', 'Bùi Thị Hoa', 'Trần Minh Long', 'Phạm Anh Tuấn', 'Lê Thu Hà'],
    datasets: [{
        label: 'Số hồ sơ',
        data: [25, 18, 22, 15, 28],
        backgroundColor: '#DA251Db3', // ~70% opacity
        borderColor: '#DA251D',
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 20,
    }]
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#000',
            titleFont: { size: 14 },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 4,
        }
    },
    scales: {
        y: { beginAtZero: true, grid: { color: '#dee2e6' } },
        x: { grid: { display: false } }
    }
};

function Dashboard() {
    return (
        <>
            <div className={styles.pageHeader}>
                <h1>Bảng điều khiển</h1>
                <p>Tổng quan tình hình xử lý nợ trong phòng của bạn.</p>
            </div>

            <section className={styles.statsGrid}>
                <StatCard icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>} title="Tổng hồ sơ (Phòng)" value="152" type="primary" />
                <StatCard icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c2.07-.4 3.5-1.65 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>} title="Tổng dư nợ (Phòng)" value="1,250 Tỷ" type="secondary" />
                <StatCard icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.02 2.64c.26.15.48.33.68.54l5.95 5.95c.21.2.39.42.54.68l.02.03c.52.88.79 1.89.79 2.94s-.27 2.06-.79 2.94l-.02.03c-.15.26-.33.48-.54.68l-5.95 5.95c-.2.21-.42.39-.68.54l-.03.02c-.88.52-1.89.79-2.94.79s-2.06-.27-2.94-.79l-.03-.02c-.26-.15-.48-.33-.68-.54l-5.95-5.95c-.21-.2-.39-.42-.54-.68l-.02-.03c-.52-.88-.79-1.89-.79-2.94s.27-2.06.79-2.94l.02-.03c.15-.26.33-.48.54-.68l5.95-5.95c.2-.21.42-.39.68-.54l.03-.02c.88-.52 1.89-.79 2.94-.79s2.06.27 2.94.79l.03.02zM12 17c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1zm0-8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/></svg>} title="Hồ sơ quá hạn > 90 ngày" value="18" type="primary" />
                <StatCard icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>} title="Hoàn tất (Tháng này)" value="8" type="secondary" />
            </section>

            <section className={styles.contentGrid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>Số lượng hồ sơ theo nhân viên</div>
                    <div className={styles.chartContainer}>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>Hồ sơ giá trị cao cần chú ý</div>
                    <ul className={styles.taskList}>
                        <li className={styles.taskListItem}>
                            <div className={styles.caseInfo}>
                                <div className={styles.name}>Công ty TNHH BĐS Thịnh Phát</div>
                                <div className={styles.assignee}>Phụ trách: Nguyễn Văn An</div>
                            </div>
                            <div className={styles.caseValue}>12.5 Tỷ</div>
                        </li>
                        <li className={styles.taskListItem}>
                            <div className={styles.caseInfo}>
                                <div className={styles.name}>Tập đoàn Xây dựng An Bình</div>
                                <div className={styles.assignee}>Phụ trách: Trần Minh Long</div>
                            </div>
                            <div className={styles.caseValue}>9.8 Tỷ</div>
                        </li>
                    </ul>
                </div>
            </section>
        </>
    );
}

export default Dashboard;