import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { API_ENDPOINTS } from '../../config/api';
import styles from './ManagerLayout.module.css';
import toast from 'react-hot-toast';
import btpLogo from '../../assets/BTP.svg';

// Component SVG Icon để tái sử dụng
const SvgIcon = ({ path }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
    </svg>
);

const ChangePasswordModal = ({ isOpen, onClose, onSave, user }) => {
        const [oldPassword, setOldPassword] = useState('');
        const [newPassword1, setNewPassword1] = useState('');
        const [newPassword2, setNewPassword2] = useState('');

        if (!isOpen) {
            return null;
        }
    
        const handleSubmit = (e) => {
            e.preventDefault();
            if (newPassword1 !== newPassword2) {
                toast.error('Xác nhận mật khẩu không đúng!');
                return;
            }
            onSave(user.employee_code, {oldPassword, newPassword1});
        };
    
        return (
            <div className={styles.modalBackdrop}>
                <div className={styles.modalContent}>
                    <div className={styles.modalHeader}>
                        <h2>Đổi mật khẩu</h2>
                        <button onClick={onClose} className={styles.closeButton}>&times;</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>Nhập mật khẩu cũ</label>
                                <input id="oldPassword" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Nhập mật khẩu mới</label>
                                <input id="newPassword1" type="password" value={newPassword1} onChange={e => setNewPassword1(e.target.value)} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Xác nhận mật khẩu mới</label>
                                <input id="newPassword2" type="password" value={newPassword2} onChange={e => setNewPassword2(e.target.value)} required />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.cancelButton} onClick={onClose}>Hủy</button>
                            <button type="submit" className={styles.saveButton}>Lưu thay đổi</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

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
                rawRole: decodedUser.role, // Lưu role gốc để check điều kiện
                employee_code: decodedUser.sub
            });
        }
    }, []);

    const handleLogout = (event) => {
        event.preventDefault();
        localStorage.removeItem('token'); // Xóa token
        navigate('/login', { replace: true }); // Chuyển về trang đăng nhập và thay thế lịch sử
        toast.success('Bạn đã đăng xuất thành công!');
    };

    const [currentUser, setCurrentUser] = useState(null);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

    const handleChangePassword = async (userID, data) => {
        try {
            const response = await fetch(API_ENDPOINTS.USERS.CHANGEPASSWORD(userID), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                // console.error();
                throw new Error(result.message || 'Không thể đổi mật khẩu người dùng.');
            }

            setIsChangePasswordModalOpen(false)
            toast.success('Cập nhật mật khẩu thành công!');

        } catch (error) {
            toast.error(`Đã xảy ra lỗi: ${error.message}`);
        }

    };

    const openChangePasswordModal = (user) => {
        setCurrentUser(user);
        setIsChangePasswordModalOpen(true);
    };

    return (
        <>

            <ChangePasswordModal 
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
                onSave={handleChangePassword}
                user={currentUser}
            />

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
                                    <a onClick={() => openChangePasswordModal(user)}>Đổi mật khẩu</a>
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
        </>
    );
}

export default ManagerLayout;
