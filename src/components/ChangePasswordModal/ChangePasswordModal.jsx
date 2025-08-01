import { useState } from "react";
import toast from "react-hot-toast";
import styles from "./ChangePasswordModal.module.css";

const ChangePasswordModal = ({ isOpen, onClose, onSubmit, user }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetForm = () => {
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    onSubmit(user.employee_code, { newPassword });
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Đổi mật khẩu</h2>
          <button onClick={handleClose} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.userInfo}>
              <p><strong>Người dùng:</strong> {user?.fullname} ({user?.username})</p>
              <p><strong>Mã nhân viên:</strong> {user?.employee_code}</p>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleClose}
            >
              Hủy
            </button>
            <button type="submit" className={styles.saveButton}>
              Đổi mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
