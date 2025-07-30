import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import styles from './ManagerLayout.module.css';
import toast from 'react-hot-toast';
import btpLogo from '../../assets/BTP.svg';

// Component SVG Icon để tái sử dụng
const SvgIcon = ({ path }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
    </svg>
);

function ManagerLayout({ children }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isMenuOpen, setMenuOpen] = useState(false);

    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        // Thêm event listener khi menu mở
        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Dọn dẹp event listener khi component unmount hoặc menu đóng
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            window.location.replace('/login');
            navigate('/login');
        }
        const decodedUser = jwtDecode(token);
        console.log('Decoded user:', decodedUser);

        if (decodedUser) {
            setUser({
                name: decodedUser.fullname || 'Cán bộ',
                role: decodedUser.role === 'employee' ? 'Cán bộ Tín dụng'
                    : decodedUser.role === 'administrator' ? 'Quản trị viên'
                        : decodedUser.role === 'manager' ? 'Trưởng phòng'
                            : decodedUser.role === 'deputy_manager' ? 'Phó phòng'
                                : 'Người dùng',
                rawRole: decodedUser.role // Lưu role gốc để check điều kiện
            });
        }
    }, []);

    const handleLogout = (event) => {
        event.preventDefault();
        localStorage.removeItem('token'); // Xóa token
        navigate('/login', { replace: true }); // Chuyển về trang đăng nhập và thay thế lịch sử
        toast.success('Bạn đã đăng xuất thành công!');
    };

    return (
        <div className={styles.appContainer}>
            <aside className={`${styles.appSidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.logo}>
                    <img src={btpLogo} alt="BTP Logo" />
                </div>
                <nav>
                    <ul className={styles.navList}>
                        {/* Chỉ hiển thị "Hồ sơ của phòng" cho manager, deputy_manager và administrator */}
                        {user && user.rawRole !== 'employee' && (
                            <li>
                                <NavLink to="/manager-dashboard" className={({ isActive }) => isActive ? styles.active : ''}>
                                    <SvgIcon path="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                                    <span>Hồ sơ của phòng</span>
                                </NavLink>
                            </li>
                        )}
                        <li>
                            <NavLink to="/my-cases" className={({ isActive }) => isActive ? styles.active : ''}>
                                <SvgIcon path="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                                <span>Hồ sơ của tôi</span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </aside>

            <div className={styles.mainWrapper}>
                <header className={styles.appHeader}>
                    <div className={styles.userMenu} ref={menuRef}>
                        <span onClick={() => setMenuOpen(prev => !prev)}>
                            <strong>{user ? user.name : '...'}</strong> ▼
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

export default ManagerLayout;
