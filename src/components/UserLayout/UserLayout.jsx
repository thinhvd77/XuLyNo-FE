import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './UserLayout.module.css';

const SvgIcon = ({ path }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
    </svg>
);

function UserLayout({ children }) {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Dữ liệu người dùng (giả lập)
    const user = { name: 'Lê Công Bách', role: 'Cán bộ Tín dụng' };

    const handleLogout = () => {
        // Trong ứng dụng thực tế, bạn sẽ xóa token tại đây
        // localStorage.removeItem('token');
        alert('Bạn đã đăng xuất thành công!');
        navigate('/login'); // Chuyển về trang đăng nhập
    };

    return (
        <div className={styles.appContainer}>
            <aside className={styles.appSidebar}>
                <div className={styles.logo}>AGRIBANK - XỬ LÝ NỢ</div>
                <ul className={styles.navList}>
                    <li>
                        <NavLink to="/my-cases" className={({ isActive }) => isActive ? styles.active : ''}>
                            <SvgIcon path="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V6h5.17l2 2H20v10z" />
                            <span>Hồ sơ của tôi</span>
                        </NavLink>
                    </li>
                </ul>
            </aside>

            <div className={styles.mainWrapper}>
                <header className={styles.appHeader}>
                    <div className={styles.userMenu} onClick={() => setMenuOpen(!isMenuOpen)}>
                        <span>Chào, <strong>{user.name}</strong> ({user.role}) ▾</span>
                        {isMenuOpen && (
                            <div className={styles.dropdownContent}>
                                <a href="#" onClick={handleLogout}>Đăng xuất</a>
                            </div>
                        )}
                    </div>
                </header>

                <main className={styles.mainContent}>
                    {children}
                </main>
            </div>
        </div>
    );
}

export default UserLayout;