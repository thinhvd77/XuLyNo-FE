import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { API_ENDPOINTS } from '../../config/api';
import styles from './UserLayout.module.css';
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

function UserLayout({ children }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isHidden, setIsHidden] = useState(false);

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
    // const [isHidden, setIsHidden] = useState(false);

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
                            : 'Người dùng',
                employee_code: decodedUser.sub
            });
            if(decodedUser.role === 'manager'){setIsHidden(true)}
        }
    }, []);

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


    const handleLogout = (event) => {
        event.preventDefault();
        localStorage.removeItem('token'); // Xóa token
        navigate('/login', { replace: true }); // Chuyển về trang đăng nhập và thay thế lịch sử
        toast.success('Bạn đã đăng xuất thành công!');
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
                            <li>
                                <NavLink to="/my-cases" className={({ isActive }) => isActive ? styles.active : ''}>
                                    <SvgIcon path="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V6h5.17l2 2H20v10z" />
                                    <span>Hồ sơ của tôi</span>
                                </NavLink>
                                <NavLink to="/manager" className={({ isActive }) => isActive ? styles.active : ''}  style={{display: isHidden ? 'block' : 'none'}}>
                                    <SvgIcon path="M3 14h4v-4H3zm0 5h4v-4H3zM3 9h4V5H3zm5 5h13v-4H8zm0 5h13v-4H8zM8 5v4h13V5z" />
                                    <span>Danh sách nhân viên</span>
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

export default UserLayout;