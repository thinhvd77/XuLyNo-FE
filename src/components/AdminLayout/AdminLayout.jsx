import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './AdminLayout.module.css';
import { jwtDecode } from "jwt-decode";
import logo from '../../assets/logo_2.png';
import { toast } from 'react-hot-toast';

const SvgIcon = ({ path }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
    </svg>
);


function AdminLayout({ children }) {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token'); // Sử dụng key 'token' nhất quán
        if (token) {
            const decodedUser = jwtDecode(token);
            setUser({ name: decodedUser.fullname || 'Administrator' });
        } else {
            // Nếu không có token, quay về trang đăng nhập
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = (event) => {
        event.preventDefault();
        localStorage.removeItem('token');
        toast.success("Đăng xuất thành công!");
        navigate('/login');
    };

    return (
        // Cấu trúc layout chính đã được cập nhật
        <div className={styles.appContainer}>
            <header className={styles.appHeader}>
                <div className={styles.logoImage}>
                    <img src={logo} alt="Agribank Logo" />
                </div>
                <div className={styles.userMenu} onBlur={() => setMenuOpen(false)} tabIndex="0">
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
    );
}

export default AdminLayout;