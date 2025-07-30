import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './UserManagement.module.css';
import Pagination from '../../components/Pagination/Pagination';
import { API_ENDPOINTS } from '../../config/api';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';

const ITEMS_PER_PAGE = 8;

// --- COMPONENT MỚI: MODAL THÊM NGƯỜI DÙNG ---
const AddUserModal = ({ isOpen, onClose, onSave }) => {
    const [fullname, setFullname] = useState('');
    const [employee_code, setEmployeeCode] = useState('');
    const [dept, setDept] = useState('');
    const [branch_code, setBranchCode] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!fullname || !username || !password) {
            toast.error('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        onSave({
            fullname,
            employee_code,
            dept,
            branch_code,
            username,
            password,
            role
        });
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Thêm Người dùng mới</h2>
                    <button onClick={onClose} className={styles.closeButton}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.modalBody}>
                        <div className={styles.formGroup}>
                            <label htmlFor="fullname">Mã cán bộ</label>
                            <input id="employee_code" type="text" value={employee_code} onChange={e => setEmployeeCode(e.target.value)} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="fullname">Họ và Tên</label>
                            <input id="fullname" type="text" value={fullname} onChange={e => setFullname(e.target.value)} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="fullname">Mã chi nhánh</label>
                            <select id="branch_code" value={branch_code} onChange={e => setBranchCode(e.target.value)}>
                                <option value="">Chọn mã chi nhánh</option>
                                <option value="6421">Hội sở - 6421</option>
                                <option value="6221">Chi nhánh Nam Hoa - 6221</option>
                                <option value="1605">Chi nhánh 6 - 1605</option>
                            </select>   
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="fullname">Phòng ban</label>
                            <select id="dept" className={branch_code === ''? styles.disabled_div : ""} value={dept} onChange={e => setDept(e.target.value)}>
                                <option value="">Chọn phòng ban</option>
                                <option className={branch_code === '6421'? "" : styles.display_option} value="KHCN">Khách hàng cá nhân</option>
                                <option className={branch_code === '6421'? "" : styles.display_option} value="KHDN">Khách hàng doanh nghiệp</option>
                                <option className={branch_code !== '6421'? "" : styles.display_option} value="KH">Khách hàng</option>
                                <option className={branch_code === '6421'? "" : styles.display_option} value="PGD">PGD Bình Tây</option>
                                <option className={branch_code === '6421'? "" : styles.display_option} value="KH&QLRR">Kế hoạch & quản lý rủi ro</option>
                                <option value="BGĐ">Ban Giám đốc</option>
                                <option className={branch_code === '6421'? "" : styles.display_option} value="IT">IT</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="role">Chức vụ</label>
                            <select id="role" value={role} onChange={e => setRole(e.target.value)}>
                                <option value="">Chọn chức vụ</option>
                                <option value="employee">Cán bộ tín dụng</option>
                                <option value="manager">Trưởng phòng</option>
                                <option value="deputy_manager">Phó phòng</option>
                                <option value="director">Giám đốc</option>
                                <option value="deputy_director">Phó giám đốc</option>
                                <option value="administrator">Administrator</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="username">Tên đăng nhập</label>
                            <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="password">Mật khẩu</label>
                            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                    </div>
                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>Hủy</button>
                        <button type="submit" className={styles.saveButton}>Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- COMPONENT MỚI: MODAL SỬA NGƯỜI DÙNG ---
const EditUserModal = ({ isOpen, onClose, onSave, user }) => {
    const [fullname, setFullname] = useState('');
    const [role, setRole] = useState('employee');
    const [dept, setDept] = useState('');
    const [branch_code, setBranchCode] = useState('');

    useEffect(() => {
        if (user) {
            setFullname(user.fullname);
            setRole(user.role);
            setDept(user.dept);
            setBranchCode(user.branch_code);
        }
    }, [user]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(user.employee_code, { fullname, role, dept, branch_code });
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Chỉnh sửa Người dùng</h2>
                    <button onClick={onClose} className={styles.closeButton}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.modalBody}>
                        <div className={styles.formGroup}>
                            <label>Mã Nhân viên</label>
                            <input type="text" value={user.employee_code} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Tên đăng nhập</label>
                            <input type="text" value={user.username} disabled />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="edit-fullname">Họ và Tên</label>
                            <input id="edit-fullname" type="text" value={fullname} onChange={e => setFullname(e.target.value)} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="edit-branch">Chi nhánh</label>
                            <select id="edit-branch" value={branch_code} onChange={e => setBranchCode(e.target.value)}>
                                <option value="6421">Hội sở</option>
                                <option value="6221">Chi nhánh Nam Hoa</option>
                                <option value="1605">Chi nhánh 6</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="edit-dept">Phòng ban</label>
                            <select id="edit-dept" className={branch_code === ''? styles.disabled_div : ""} value={dept}  onChange={e => setDept(e.target.value)}>
                                <option className={branch_code === '6421'? "" : styles.display_option} value="KHCN">Khách hàng cá nhân</option>
                                <option className={branch_code === '6421'? "" : styles.display_option} value="KHDN">Khách hàng doanh nghiệp</option>
                                <option className={branch_code !== '6421'? "" : styles.display_option} value="KH">Khách hàng</option>
                                <option className={branch_code === '6421'? "" : styles.display_option} value="PGD">PGD Bình Tây</option>
                                <option className={branch_code === '6421'? "" : styles.display_option} value="KH&QLRR">Kế hoạch & quản lý rủi ro</option>
                                <option value="BGĐ">Ban Giám đốc</option>
                                <option className={branch_code === '6421'? "" : styles.display_option} value="IT">IT</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="edit-role">Chức vụ</label>
                            <select id="edit-role" value={role} onChange={e => setRole(e.target.value)}>
                                <option value="employee">Cán bộ tín dụng</option>
                                <option value="deputy_manager">Phó phòng</option>
                                <option value="manager">Trưởng phòng</option>
                                <option value="deputy_director">Phó giám đốc</option>
                                <option value="director">Giám đốc</option>
                                <option value="administrator">Administrator</option>
                            </select>
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

// Component SortableHeader
const SortableHeader = ({ field, currentSortField, sortDirection, onSort, children }) => {
    const getSortIcon = () => {
        if (currentSortField !== field) {
            // Icon mặc định khi chưa sort - Both arrows (outlined)
            return (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 10L12 6L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 14L12 18L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
        }
        
        if (sortDirection === 'asc') {
            // Icon sort tăng dần - Up arrow (outlined)
            return (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 14L12 10L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
        } else {
            // Icon sort giảm dần - Down arrow (outlined)
            return (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 10L12 14L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
        }
    };

    return (
        <th 
            className={`${styles.sortableHeader} ${currentSortField === field ? styles.sorted : ''}`}
            onClick={() => onSort(field)}
        >
            <div className={styles.headerContent}>
                <span>{children}</span>
                <span className={styles.sortIcon}>{getSortIcon()}</span>
            </div>
        </th>
    );
};
 // MODAL CẬP NHẬT MẬT KHẨU NGƯỜI DÙNG
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
                        <h2>Đổi mật khẩu cho <sapn className={styles.title}>{user.fullname}</sapn></h2>
                        <button onClick={onClose} className={styles.closeButton}>&times;</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.modalBody}>
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

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        type: 'warning'
    });
    const navigate = useNavigate();

       // --- THÊM MỚI: State cho modal sửa ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Giả lập việc fetch dữ liệu từ API
    useEffect(() => {
        const fetchCases = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                // Nếu không có token, người dùng chưa đăng nhập, chuyển về trang login
                navigate('/login');
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch(API_ENDPOINTS.USERS.LIST, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Không thể tải dữ liệu người dùng.');
                }

                const data = await response.json();
                setUsers(data.users);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCases();
    }, [navigate]);

    // Hàm xử lý sort
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Hàm sort dữ liệu
    const sortUsers = (users) => {
        if (!sortField) return users;
        
        return [...users].sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];
            
            // Xử lý các trường hợp đặc biệt
            if (sortField === 'dept') {
                const deptMap = {
                    'KHCN': 'Khách hàng cá nhân',
                    'KHDN': 'Khách hàng doanh nghiệp',
                    'KH': 'Khách hàng',
                    'KH&QLRR': 'Kế hoạch & quản lý rủi ro',
                    'BGĐ': 'Ban Giám đốc',
                    'IT': 'IT',
                    'PGD': 'Phòng Giao dịch Bình Tây'
                };
                aVal = deptMap[aVal] || 'Chưa xác định';
                bVal = deptMap[bVal] || 'Chưa xác định';
            }
            
            if (sortField === 'role') {
                const roleMap = {
                    'employee': 'Cán bộ tín dụng',
                    'manager': 'Trưởng phòng',
                    'deputy_manager': 'Phó phòng',
                    'director': 'Giám đốc',
                    'deputy_director': 'Phó giám đốc',
                    'administrator': 'Administrator'
                };
                aVal = roleMap[aVal] || 'Chưa xác định';
                bVal = roleMap[bVal] || 'Chưa xác định';
            }
            
            if (sortField === 'branch_code') {
                const branchMap = {
                    '6421': 'Hội sở',
                    '6221': 'Chi nhánh Nam Hoa',
                    '1605': 'Chi nhánh 6'
                };
                aVal = branchMap[aVal] || 'Chưa xác định';
                bVal = branchMap[bVal] || 'Chưa xác định';
            }
            
            if (sortField === 'status') {
                aVal = aVal === 'active' ? 'Hoạt động' : 'Vô hiệu hóa';
                bVal = bVal === 'active' ? 'Hoạt động' : 'Vô hiệu hóa';
            }
            
            // Chuyển về string để so sánh
            aVal = String(aVal).toLowerCase();
            bVal = String(bVal).toLowerCase();
            
            if (sortDirection === 'asc') {
                return aVal.localeCompare(bVal);
            } else {
                return bVal.localeCompare(aVal);
            }
        });
    };

    const filteredUsers = useMemo(() => {
        setCurrentPage(1);
        let filtered = users;
        
        if (searchTerm) {
            filtered = users.filter(user =>
                user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.employee_code.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return sortUsers(filtered);
    }, [users, searchTerm, sortField, sortDirection]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

    const handleAddUser = async (newUserData) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Không tìm thấy token. Vui lòng đăng nhập lại.');
            return;
        }
        // console.log('Adding new user with data:', newUserData);

        try {
            const response = await fetch(API_ENDPOINTS.USERS.CREATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newUserData)
            });

            const result = await response.json();

            if (!response.ok) {
                // console.error();
                throw new Error(result.message || 'Không thể tạo người dùng.');
            }

            // gọi lại api để cập nhật danh sách người dùng
            const updatedResponse = await fetch(API_ENDPOINTS.USERS.LIST, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const updatedData = await updatedResponse.json();
            setUsers(updatedData.users);

            setIsAddModalOpen(false); // Đóng modal sau khi lưu thành công
            toast.success('Thêm người dùng mới thành công!');

        } catch (error) {
            // console.error('Lỗi khi thêm người dùng:', error);
            toast.error(`Đã xảy ra lỗi: ${error.message}`);
        }
    };

    // --- THÊM MỚI: Logic mở modal sửa ---
    const openEditModal = (user) => {
        setCurrentUser(user);
        setIsEditModalOpen(true);
    };

    const handleEditUser = async (userId, updatedData) => {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(API_ENDPOINTS.USERS.UPDATE(userId), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Cập nhật user trong state
                setUsers(users.map(u => 
                    u.employee_code === userId ? { ...u, ...result.user } : u
                ));
                setIsEditModalOpen(false);
                toast.success('Cập nhật người dùng thành công!');
            } else {
                toast.error(result.message || 'Cập nhật thất bại!');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Đã có lỗi xảy ra khi cập nhật!');
        }
    };

    const handleDisableUser = async (userId) => {
        const currentUser = users.find(user => user.employee_code === userId);
        const action = currentUser?.status === 'active' ? 'vô hiệu hóa' : 'kích hoạt';
        const actionText = currentUser?.status === 'active' ? 'vô hiệu hóa' : 'kích hoạt';
        
        setConfirmModal({
            isOpen: true,
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} người dùng`,
            message: `Bạn có chắc chắn muốn ${action} người dùng "${currentUser?.fullname || userId}"?`,
            type: currentUser?.status === 'active' ? 'warning' : 'info',
            onConfirm: async () => {
                const token = localStorage.getItem('token');
                
                try {
                    const response = await fetch(API_ENDPOINTS.USERS.TOGGLE_STATUS(userId), {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    const result = await response.json();

                    if (response.ok && result.success) {
                        // Cập nhật user trong state
                        setUsers(users.map(user =>
                            user.employee_code === userId ? { ...user, ...result.user } : user
                        ));
                        toast.success(result.message);
                    } else {
                        toast.error(result.message || `Không thể ${actionText} người dùng!`);
                    }
                } catch (error) {
                    console.error('Error toggling user status:', error);
                    toast.error(`Đã có lỗi xảy ra khi ${actionText} người dùng!`);
                }
                
                setConfirmModal({ isOpen: false });
            },
            onCancel: () => setConfirmModal({ isOpen: false })
        });
    };

    const handleDeleteUser = async (userId) => {
        const userToDelete = users.find(user => user.employee_code === userId);
        
        setConfirmModal({
            isOpen: true,
            title: 'Xóa người dùng',
            message: `Bạn có chắc chắn muốn xóa người dùng "${userToDelete?.fullname || userId}"? Hành động này không thể hoàn tác.`,
            type: 'danger',
            onConfirm: async () => {
                // gọi API để xóa người dùng
                fetch(API_ENDPOINTS.USERS.DELETE(userId), {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Không thể xóa người dùng.');
                        }
                        return response.json();
                    })
                    .then(async () => {
                        // gọi lại api để cập nhật danh sách người dùng
                        const updatedResponse = await fetch(API_ENDPOINTS.USERS.LIST, {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        });
                        const updatedData = await updatedResponse.json();
                        setUsers(updatedData.users);
                        toast.success('Xóa người dùng thành công!');
                    })
                    .catch(error => {
                        // console.error('Lỗi khi xóa người dùng:', error);
                        toast.error(`Đã xảy ra lỗi: ${error.message}`);
                    })
            }
        });
    };

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

    if (isLoading) {
        return <div className={styles.message}>Đang tải danh sách người dùng...</div>;
    }

    if (error) {
        return <div className={`${styles.message} ${styles.error}`}>Lỗi: {error}</div>;
    }

    return (
        <>
            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddUser}
            />
            <EditUserModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditUser}
                user={currentUser}
            />
            <ChangePasswordModal 
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
                onSave={handleChangePassword}
                user={currentUser}
            />

            <div className={styles.pageHeader}>
                <div>
                    <h1>Quản lý Người dùng</h1>
                </div>
                <button className={styles.addButton} onClick={() => setIsAddModalOpen(true)}>
                    + Thêm Người dùng
                </button>
            </div>

            <div className={styles.filterBar}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Tìm theo Mã NV, Tên, Tên đăng nhập..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className={styles.tableWrapper}>  
                <div className={styles.tableContainer}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <SortableHeader 
                                    field="employee_code" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Mã Nhân viên
                                </SortableHeader>
                                <SortableHeader 
                                    field="fullname" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Họ và Tên
                                </SortableHeader>
                                <SortableHeader 
                                    field="username" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Tên đăng nhập
                                </SortableHeader>
                                <SortableHeader 
                                    field="dept" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Phòng ban
                                </SortableHeader>
                                <SortableHeader 
                                    field="role" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Chức vụ
                                </SortableHeader>
                                <SortableHeader 
                                    field="branch_code" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Chi nhánh
                                </SortableHeader>
                                <SortableHeader 
                                    field="status" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Trạng thái
                                </SortableHeader>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map(user => (
                                <tr key={user.employee_code}>
                                    <td>{user.employee_code}</td>
                                    <td>{user.fullname}</td>
                                    <td>{user.username}</td>
                                    <td>{
                                        user.dept === 'KHCN' ? "Khách hàng cá nhân"
                                            : user.dept === "KHDN" ? "Khách hàng doanh nghiệp"
                                                : user.dept === "KH" ? "Khách hàng"
                                                    : user.dept === "PGD" ? "PGD Bình Tây"
                                                        : user.dept === "KH&QLRR" ? "Kế hoạch & quản lý rủi ro"
                                                            : user.dept === "BGĐ" ? "Ban Giám đốc"
                                                                : user.dept === "IT" ? "IT" : "Chưa xác định"

                                    }</td>
                                    <td>{
                                        user.role === 'employee' ? "Cán bộ tín dụng"
                                            : user.role === "manager" ? "Trưởng phòng"
                                                : user.role === "deputy_manager" ? "Phó phòng"
                                                    : user.role === "director" ? "Giám đốc"
                                                        : user.role === "deputy_director" ? "Phó giám đốc"
                                                            : user.role === "administrator" ? "Administrator" : "Chưa xác định"
                                    }</td>
                                    <td>{
                                        user.branch_code === '6421' ? "Hội sở"
                                            : user.branch_code === "6221" ? "Chi nhánh Nam Hoa"
                                                : user.branch_code === "1605" ? "Chi nhánh 6"
                                                    : "Chưa xác định"
                                    }</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[user.status]}`}>
                                            {user.status === 'active' ? 'Hoạt động' : 'Vô hiệu hóa'}
                                        </span>
                                    </td>
                                    <td className={styles.actionCell}>
                                        <button className={styles.actionButton} onClick={() => openEditModal(user)}>Sửa</button>
                                        <button className={`${styles.actionButton} ${styles.disable}`} onClick={() => handleDisableUser(user.employee_code)}>
                                            {user.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                        </button>
                                        <button className={`${styles.actionButton} ${styles.changepassword}`} onClick={() => openChangePasswordModal(user)}>Đổi MK</button>
                                        <button className={`${styles.actionButton} ${styles.delete}`} onClick={() => handleDeleteUser(user.employee_code)}>Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                    
                <div className={styles.paginationContainer}>
                    <div className={styles.rowsPerPageSelector}>
                        <span>Hiển thị:</span>
                        <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                            <option value={5}>5 dòng</option>
                            <option value={10}>10 dòng</option>
                            <option value={15}>15 dòng</option>
                        </select>
                    </div>
                    <div className={styles.pageInfo}>
                        Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} trên tổng số {filteredUsers.length} người dùng
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
            
            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
            />
        </>
    );
}export default UserManagement;