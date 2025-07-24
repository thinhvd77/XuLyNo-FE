import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import styles from './CaseDetail.module.css';
import { jwtDecode } from 'jwt-decode';

// Component Icon tái sử dụng
const SvgIcon = ({ path, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>
);

const DocumentUploader = () => {
    const [files, setFiles] = useState([]);
    const [docType, setDocType] = useState('court'); // Loại tài liệu mặc định

    const onDrop = useCallback((acceptedFiles) => {
        if (!docType) {
            toast.error("Vui lòng chọn loại tài liệu trước khi tải lên.");
            return;
        }
        const newFiles = acceptedFiles.map(file => Object.assign(file, {
            id: uuidv4(),
            type: docType // Gán loại tài liệu cho file
        }));
        setFiles(prev => [...prev, ...newFiles]);
    }, [docType]); // Phụ thuộc vào docType để gán đúng loại

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
    const removeFile = (fileId) => setFiles(files.filter(f => f.id !== fileId));

    const getTypeName = (type) => {
        switch (type) {
            case 'enforcement': return 'Thi hành án';
            case 'court': return 'Tòa án';
            case 'notification': return 'Báo nợ';
            case 'proactive': return 'Chủ động XLN';
            case 'collateral': return 'Tài sản đảm bảo';
            case 'processed_collateral': return 'TS đã xử lý';
            case 'other': return 'Tài liệu khác';
            default: return 'Không xác định';
        }
    };

    return (
        <div className={styles.uploaderContainer}>
            <div className={styles.formGroup}>
                <label htmlFor="doc-type">1. Chọn loại tài liệu</label>
                <select id="doc-type" className={styles.formControl} value={docType} onChange={(e) => setDocType(e.target.value)}>
                    <option value="court">Tài liệu Tòa án</option>
                    <option value="enforcement">Tài liệu Thi hành án</option>
                    <option value="notification">Tài liệu Bán nợ</option>
                    <option value="proactive">Tài liệu Chủ động xử lý tài sản</option>
                    <option value="collateral">Tài sản đảm bảo (Ảnh QR)</option>
                    <option value="processed_collateral">Tài liệu TS đã xử lý</option>
                    <option value="other">Tài liệu khác</option>
                </select>
            </div>

            <div className={styles.formGroup}>
                <label>2. Tải lên file</label>
                <div {...getRootProps({ className: `${styles.dropzone} ${isDragActive ? styles.dragActive : ''}` })}>
                    <input {...getInputProps()} />
                    <p>Kéo và thả hoặc nhấn để chọn file</p>
                </div>
            </div>

            {files.length > 0 && (
                <div className={styles.fileList}>
                    <h4>Danh sách file chờ upload ({files.length})</h4>
                    <ul>
                        {files.map(file => (
                            <li key={file.id}>
                                <div className={styles.fileInfo}>
                                    <span className={styles.fileTypeBadge}>{getTypeName(file.type)}</span>
                                    <span>{file.name}</span>
                                </div>
                                <button onClick={() => removeFile(file.id)}>&times;</button>
                            </li>
                        ))}
                    </ul>
                    <button className={styles.button} style={{ width: '100%', marginTop: '16px' }}>Tải lên tất cả</button>
                </div>
            )}
        </div>
    );
};


function CaseDetail() {
    const { caseId } = useParams(); // Lấy ID từ URL
    const [caseData, setCaseData] = useState(null);
    const [caseNote, setCaseNote] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('timeline');
    const [newNote, setNewNote] = useState('');
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);
    const navigate = useNavigate();

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
                console.log(caseId);

                const response = await fetch(`http://localhost:3000/api/cases/${caseId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Không thể tải dữ liệu hồ sơ.');
                }

                const data = await response.json();
                setCaseData(data);

                const noteResponse = await fetch(`http://localhost:3000/api/cases/contents/${caseId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!noteResponse.ok) {
                    throw new Error('Không thể tải dữ liệu hồ sơ.');
                }

                const notes = await noteResponse.json();
                setCaseNote(notes);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCases();
    }, [navigate]);

    const handleAddNote = async () => {
        if (!newNote.trim()) {
            toast.error("Vui lòng nhập nội dung ghi chú.");
            return;
        }
        console.log(newNote);

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Không tìm thấy token. Vui lòng đăng nhập lại.");
            return;
        }

        setIsSubmittingNote(true);

        try {
            const response = await fetch(`http://localhost:3000/api/cases/${caseId}/updates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: newNote
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Không thể gửi ghi chú.');
            }

            setNewNote('');
            toast.success("Đã thêm ghi chú mới!");
            const noteResponse = await fetch(`http://localhost:3000/api/cases/contents/${caseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!noteResponse.ok) {
                throw new Error('Không thể tải dữ liệu hồ sơ.');
            }

            const notes = await noteResponse.json();
            setCaseNote(notes);
        } catch (error) {
            toast.error(`Lỗi: ${error.message}`);
        } finally {
            setIsSubmittingNote(false); // Bật lại nút sau khi xử lý xong
        }
    };

    if (isLoading) return <div>Đang tải dữ liệu hồ sơ...</div>;
    if (!caseData) return <div>Không tìm thấy hồ sơ.</div>;

    return (
        <>
            <div className={styles.pageHeader}>
                <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
                    <ol>
                        <li><Link to="/my-cases">Hồ sơ của tôi</Link></li>
                        <li><span aria-current="page">{caseData.case_id}</span></li>
                    </ol>
                </nav>
                <h1>Hồ sơ: {caseData.customer_name}</h1>
            </div>

            <div className={styles.detailsGrid}>
                {/* Cột thông tin bên trái */}
                <div className={styles.infoColumn}>
                    <div className={styles.card}>
                        <h3>Thông tin Khách hàng</h3>
                        <dl className={styles.infoGrid}>
                            <dt>Mã KH:</dt><dd>{caseData.customer_code}</dd>
                            <dt>Tên KH:</dt><dd>{caseData.customer_name}</dd>
                        </dl>
                    </div>
                    <div className={styles.card}>
                        <h3>Thông tin Khoản nợ</h3>
                        <dl className={styles.infoGrid}>
                            <dt>Dư nợ hiện tại:</dt><dd><strong>{parseFloat(caseData.outstanding_debt).toLocaleString('vi-VN')} VND</strong></dd>
                        </dl>
                    </div>
                    <div className={styles.card}>
                        <h3>Hành động</h3>
                        <div className={styles.formGroup}>
                            <label htmlFor="case-status">Cập nhật Trạng thái</label>
                            <select id="case-status" className={styles.formControl} defaultValue={caseData.state}>
                                <option>Mới</option>
                                <option>Đang xử lý</option>
                                <option>Đã khởi kiện</option>
                            </select>
                        </div>
                        <button className={styles.button}>Lưu thay đổi</button>
                    </div>
                </div>

                {/* Cột tab bên phải */}
                <div className={`${styles.card} ${styles.tabsColumn}`}>
                    <nav className={styles.tabNav}>
                        <button onClick={() => setActiveTab('timeline')} className={` ${styles.tabButton} ${activeTab === 'timeline' ? styles.active : ''}`}>Nhật ký Xử lý</button>
                        <button onClick={() => setActiveTab('documents')} className={` ${styles.tabButton} ${activeTab === 'documents' ? styles.active : ''}`}>Tài liệu & Hồ sơ</button>
                    </nav>

                    {activeTab === 'timeline' && (
                        <div className={styles.tabContent}>
                            <div className={styles.formGroup}>
                                <label htmlFor="new-note">Thêm ghi chú/cập nhật mới:</label>
                                <textarea
                                    id="new-note"
                                    rows="4"
                                    className={styles.formControl}
                                    placeholder="Nhập nội dung công việc đã làm..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                ></textarea>
                                <button className={styles.button} style={{ alignSelf: 'flex-end', marginTop: '12px' }} onClick={handleAddNote}>Gửi ghi chú</button>
                            </div>
                            <hr className={styles.divider} />
                            <div className={styles.timeline}>
                                {caseNote.data.map(entry => (
                                    <div key={entry.update_id} className={styles.timelineItem}>
                                        <div className={styles.timelineIcon}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path
                                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                                                />
                                                <path
                                                    d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <div className={styles.meta}><strong>{jwtDecode(localStorage.getItem('token')).fullname}</strong> - <span>{new Date(entry.created_date).toLocaleTimeString('vi-VN')}, {new Date(entry.created_date).toLocaleDateString('vi-VN')}</span></div>
                                            <p>{entry.update_content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className={styles.tabContent}>
                            <DocumentUploader />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default CaseDetail;