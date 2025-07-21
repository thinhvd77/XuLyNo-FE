import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Layout.module.css';

// Component SVG Icon để tái sử dụng
const SvgIcon = ({ path }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
    </svg>
);

function Layout({ children }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    // Dữ liệu người dùng, trong ứng dụng thực tế sẽ lấy từ context hoặc redux
    const user = { name: 'Lê Thị Bích', role: 'Trưởng phòng' };

    return (
        <div className={styles.appContainer}>
            <aside className={`${styles.appSidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.sidebarHeader}>AGRIBANK - XỬ LÝ NỢ</div>
                <nav>
                    <ul className={styles.navList}>
                        <li>
                            <NavLink to="/dashboard" className={({ isActive }) => isActive ? styles.active : ''}>
                                <SvgIcon path="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                                <span>Bảng điều khiển</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/profiles" className={({ isActive }) => isActive ? styles.active : ''}>
                                <SvgIcon path="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V6h5.17l2 2H20v10z" />
                                <span>Danh sách Hồ sơ</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/report" className={({ isActive }) => isActive ? styles.active : ''}>
                                <SvgIcon path="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                                <span>Báo cáo</span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </aside>

            <div className={styles.mainWrapper}>
                <header className={styles.appHeader}>
                    <button className={styles.sidebarToggleBtn} onClick={() => setSidebarOpen(!isSidebarOpen)}>
                        <SvgIcon path="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                    </button>
                    <button className={styles.userProfile}>
                        Chào, <strong>{user.name} ({user.role})</strong>
                        <span style={{ display: 'inline-block', transform: 'translateY(-2px)' }}>▾</span>
                    </button>
                </header>
                <main className={styles.mainContent}>
                    {children}
                </main>
            </div>
        </div>
    );
}

export default Layout;