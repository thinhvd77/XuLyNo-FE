import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './AdminLayout.module.css';
import { jwtDecode } from "jwt-decode";
import logo from '../../assets/logo_2.png'; // Import logo image

const SvgIcon = ({ path }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
    </svg>
);


function UserLayout({ children }) {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Dữ liệu người dùng (giả lập)
    // const user = { name: 'Lê Công Bách', role: 'Cán bộ Tín dụng' };
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const decodedUser = jwtDecode(token);
        // console.log('Decoded user:', decodedUser);

        if (decodedUser) {
            setUser({
                name: decodedUser.fullname || 'Cán bộ',
                role: decodedUser.role === 'employee' ? 'Cán bộ Tín dụng' : 'Người dùng'
            });
        }
    }, []);

    const handleLogout = () => {
        event.preventDefault();
        // alert('Bạn đã đăng xuất thành công!');
        localStorage.removeItem('token'); // Xóa token
        navigate('/login'); // Chuyển về trang đăng nhập
    };

    return (
        <div className={styles.appContainer}>
            {/* <aside className={styles.appSidebar}>
                <div className={styles.logo}>ADMINISTRATOR</div>
                <ul className={styles.navList}>
                    <li>
                        <NavLink to="/my-cases" className={({ isActive }) => isActive ? styles.active : ''}>
                            <SvgIcon path="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                            <span>Quản lý Người dùng</span>
                        </NavLink>
                    </li>
                </ul>
            </aside> */}

            <div className={styles.mainWrapper}>
                <header className={styles.appHeader}>
                    <div className={styles.logo}>
                        <img src={logo} alt="" />
                    </div>
                    <div className={styles.userMenu} onClick={() => setMenuOpen(!isMenuOpen)}>
                        <span onClick={() => setMenuOpen(!isMenuOpen)}>
                            <strong>{user ? user.name : '...'}</strong> ▾
                        </span>
                        {isMenuOpen && (
                            <div className={styles.dropdownContent}>
                                <a onClick={handleLogout}>Đăng xuất</a>
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