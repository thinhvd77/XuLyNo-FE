import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import styles from "./UserManagement.module.css";
import Pagination from "../../components/Pagination/Pagination";
import { API_ENDPOINTS } from "../../config/api";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import AddUserModal from "../../components/AddUserModal/AddUserModal";
import EditUserModal from "../../components/EditUserModal/EditUserModal";
import ChangePasswordModal from "../../components/ChangePasswordModal/ChangePasswordModal";
import SortableHeader from "../../components/SortableHeader/SortableHeader";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "warning",
  });
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [userForPasswordChange, setUserForPasswordChange] = useState(null);
  
  useEffect(() => {
    const fetchCases = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(API_ENDPOINTS.USERS.LIST, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu người dùng.");
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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortUsers = (users) => {
    if (!sortField) return users;

    return [...users].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "dept") {
        const deptMap = {
          KHCN: "Khách hàng cá nhân",
          KHDN: "Khách hàng doanh nghiệp",
          "KH&QLRR": "Kế hoạch & quản lý rủi ro",
          BGĐ: "Ban Giám đốc",
          IT: "IT",
          KH: "Khách hàng",
        };
        aVal = deptMap[aVal] || "Chưa xác định";
        bVal = deptMap[bVal] || "Chưa xác định";
      }

      if (sortField === "role") {
        const roleMap = {
          employee: "Cán bộ tín dụng",
          manager: "Trưởng phòng",
          deputy_manager: "Phó phòng",
          director: "Giám đốc",
          deputy_director: "Phó giám đốc",
          administrator: "Administrator",
        };
        aVal = roleMap[aVal] || "Chưa xác định";
        bVal = roleMap[bVal] || "Chưa xác định";
      }

      if (sortField === "branch_code") {
        const branchMap = {
          6421: "Hội sở",
          6221: "Chi nhánh Nam Hoa",
          1605: "Chi nhánh 6",
        };
        aVal = branchMap[aVal] || "Chưa xác định";
        bVal = branchMap[bVal] || "Chưa xác định";
      }

      if (sortField === "status") {
        aVal = aVal === "active" ? "Hoạt động" : "Vô hiệu hóa";
        bVal = bVal === "active" ? "Hoạt động" : "Vô hiệu hóa";
      }

      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();

      if (sortDirection === "asc") {
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
      filtered = users.filter(
        (user) =>
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
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Không tìm thấy token. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.USERS.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUserData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Không thể tạo người dùng.");
      }

      const updatedResponse = await fetch(API_ENDPOINTS.USERS.LIST, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const updatedData = await updatedResponse.json();
      setUsers(updatedData.users);

      toast.success("Thêm người dùng mới thành công!");
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error(`Đã xảy ra lỗi: ${error.message}`);
    }
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setIsEditModalOpen(true);
  };

  const handleEditUser = async (userId, updatedData) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(API_ENDPOINTS.USERS.UPDATE(userId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUsers(
          users.map((u) =>
            u.employee_code === userId ? { ...u, ...result.user } : u
          )
        );
        setIsEditModalOpen(false);
        toast.success("Cập nhật người dùng thành công!");
      } else {
        toast.error(result.message || "Cập nhật thất bại!");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Đã có lỗi xảy ra khi cập nhật!");
    }
  };

  const openChangePasswordModal = (user) => {
    setUserForPasswordChange(user);
    setIsChangePasswordModalOpen(true);
  };

  const handleChangePassword = async (userId, passwordData) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(API_ENDPOINTS.USERS.CHANGE_PASSWORD(userId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsChangePasswordModalOpen(false);
        toast.success("Đổi mật khẩu thành công!");
      } else {
        toast.error(result.message || "Đổi mật khẩu thất bại!");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Đã có lỗi xảy ra khi đổi mật khẩu!");
    }
  };

  const handleDisableUser = async (userId) => {
    const currentUser = users.find((user) => user.employee_code === userId);
    const action =
      currentUser?.status === "active" ? "vô hiệu hóa" : "kích hoạt";
    const actionText =
      currentUser?.status === "active" ? "vô hiệu hóa" : "kích hoạt";

    setConfirmModal({
      isOpen: true,
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} người dùng`,
      message: `Bạn có chắc chắn muốn ${action} người dùng "${
        currentUser?.fullname || userId
      }"?`,
      type: currentUser?.status === "active" ? "warning" : "info",
      onConfirm: async () => {
        const token = localStorage.getItem("token");

        try {
          const response = await fetch(
            API_ENDPOINTS.USERS.TOGGLE_STATUS(userId),
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const result = await response.json();

          if (response.ok && result.success) {
            setUsers(
              users.map((user) =>
                user.employee_code === userId
                  ? { ...user, ...result.user }
                  : user
              )
            );
            toast.success(result.message);
          } else {
            toast.error(
              result.message || `Không thể ${actionText} người dùng!`
            );
          }
        } catch (error) {
          console.error("Error toggling user status:", error);
          toast.error(`Đã có lỗi xảy ra khi ${actionText} người dùng!`);
        }

        setConfirmModal({ isOpen: false });
      },
      onCancel: () => setConfirmModal({ isOpen: false }),
    });
  };

  const handleDeleteUser = async (userId) => {
    const userToDelete = users.find((user) => user.employee_code === userId);

    setConfirmModal({
      isOpen: true,
      title: "Xóa người dùng",
      message: `Bạn có chắc chắn muốn xóa người dùng "${
        userToDelete?.fullname || userId
      }"? Hành động này không thể hoàn tác.`,
      type: "danger",
      onConfirm: async () => {
        fetch(API_ENDPOINTS.USERS.DELETE(userId), {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Không thể xóa người dùng.");
            }
            return response.json();
          })
          .then(async () => {
            const updatedResponse = await fetch(API_ENDPOINTS.USERS.LIST, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
            const updatedData = await updatedResponse.json();
            setUsers(updatedData.users);
            toast.success("Xóa người dùng thành công!");
          })
          .catch((error) => {
            toast.error(`Đã xảy ra lỗi: ${error.message}`);
          });
      },
    });
  };

  if (isLoading) {
    return (
      <div className={styles.message}>Đang tải danh sách người dùng...</div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.message} ${styles.error}`}>Lỗi: {error}</div>
    );
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
        user={userForPasswordChange}
      />

      <div className={styles.pageHeader}>
        <div>
          <h1>Quản lý Người dùng</h1>
        </div>
        <button
          className={styles.addButton}
          onClick={() => setIsAddModalOpen(true)}
        >
          + Thêm Người dùng
        </button>
      </div>

      <div className={styles.card}>
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
                {currentUsers.map((user) => (
                  <tr key={user.employee_code}>
                    <td>{user.employee_code}</td>
                    <td>{user.fullname}</td>
                    <td>{user.username}</td>
                    <td>
                      {user.dept === "KHCN"
                        ? "Khách hàng cá nhân"
                        : user.dept === "KHDN"
                        ? "Khách hàng doanh nghiệp"
                        : user.dept === "KH&QLRR"
                        ? "Kế hoạch & quản lý rủi ro"
                        : user.dept === "PGD"
                        ? "PGD Bình Tây"
                        : user.dept === "BGĐ"
                        ? "Ban Giám đốc"
                        : user.dept === "IT"
                        ? "IT"
                        : user.dept === "KH"
                        ? "Khách hàng"
                        : "Chưa xác định"}
                    </td>
                    <td>
                      {user.role === "employee" && user.dept === "KH&QLRR"
                        ? "Cán bộ"
                        : user.role === "employee"
                        ? "Cán bộ tín dụng"
                        : user.role === "manager"
                        ? "Trưởng phòng"
                        : user.role === "deputy_manager"
                        ? "Phó phòng"
                        : user.role === "director"
                        ? "Giám đốc"
                        : user.role === "deputy_director"
                        ? "Phó giám đốc"
                        : user.role === "administrator"
                        ? "Administrator"
                        : "Chưa xác định"}
                    </td>
                    <td>
                      {user.branch_code === "6421"
                        ? "Hội sở"
                        : user.branch_code === "6221"
                        ? "Chi nhánh Nam Hoa"
                        : user.branch_code === "1605"
                        ? "Chi nhánh 6"
                        : "Chưa xác định"}
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[user.status]
                        }`}
                      >
                        {user.status === "active" ? "Hoạt động" : "Vô hiệu hóa"}
                      </span>
                    </td>
                    <td className={styles.actionCell}>
                      <button
                        className={styles.actionButton}
                        onClick={() => openEditModal(user)}
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Sửa
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.disable}`}
                        onClick={() => handleDisableUser(user.employee_code)}
                      >
                        {user.status === "active" ? (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                            //   enable-background="new 0 0 24 24"
                              height="30px"
                              viewBox="0 0 24 24"
                              width="30px"
                              fill="#e3e3e3"
                            >
                              <g>
                                <rect fill="none" height="24" width="24" />
                              </g>
                              <g>
                                <g>
                                  <path d="M15.18,10.94c0.2-0.44,0.32-0.92,0.32-1.44C15.5,7.57,13.93,6,12,6c-0.52,0-1,0.12-1.44,0.32L15.18,10.94z" />
                                  <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M12,15c-2.32,0-4.45,0.8-6.14,2.12 C4.7,15.73,4,13.95,4,12c0-1.85,0.63-3.55,1.69-4.9l2.86,2.86c0.21,1.56,1.43,2.79,2.99,2.99l2.2,2.2C13.17,15.05,12.59,15,12,15z M18.31,16.9L7.1,5.69C8.45,4.63,10.15,4,12,4c4.42,0,8,3.58,8,8C20,13.85,19.37,15.54,18.31,16.9z" />
                                </g>
                              </g>
                            </svg>
                            Vô hiệu hóa
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                            //   enable-background="new 0 0 24 24"
                              height="24px"
                              viewBox="0 0 24 24"
                              width="24px"
                              fill="#e3e3e3"
                            >
                              <g>
                                <rect fill="none" height="24" width="24" />
                              </g>
                              <g>
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z" />
                              </g>
                            </svg>
                            Kích hoạt
                          </>
                        )}
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.changePassword}`}
                        onClick={() => openChangePasswordModal(user)}
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                        </svg>
                        Đổi mật khẩu
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.delete}`}
                        onClick={() => handleDeleteUser(user.employee_code)}
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.paginationContainer}>
            <div className={styles.rowsPerPageSelector}>
              <span>Hiển thị:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={5}>5 dòng</option>
                <option value={10}>10 dòng</option>
                <option value={15}>15 dòng</option>
              </select>
            </div>
            <div className={styles.pageInfo}>
              Hiển thị {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, filteredUsers.length)} trên tổng số{" "}
              {filteredUsers.length} người dùng
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </>
  );
}

export default UserManagement;
