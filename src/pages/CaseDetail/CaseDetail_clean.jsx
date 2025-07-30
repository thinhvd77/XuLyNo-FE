import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './CaseDetail.module.css';
import { jwtDecode } from 'jwt-decode';
import { API_ENDPOINTS } from '../../config/api';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import DocumentUploader from '../../components/DocumentUploader/DocumentUploader';
import PreviewModal from '../../components/PreviewModal/PreviewModal';
import { 
    getStatusDisplayName, 
    getFileIcon, 
    canPreview, 
    getTypeName, 
    organizeFilesByType 
} from '../../utils/caseHelpers';

function CaseDetail() {
    const { caseId } = useParams(); // Lấy ID từ URL
    const [caseData, setCaseData] = useState(null);
    const [caseNote, setCaseNote] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('timeline');
    const [activeFileTab, setActiveFileTab] = useState('court'); // Tab con cho uploaded files
    const [newNote, setNewNote] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        type: 'warning'
    });
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

                const response = await fetch(API_ENDPOINTS.CASES.CASE_DETAIL(caseId), {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Không thể tải dữ liệu hồ sơ.');
                }

                const {data} = await response.json();
                
                setCaseData(data);
                // Set initial status for the case

                setSelectedStatus(data.state); // Set initial status

                const noteResponse = await fetch(API_ENDPOINTS.CASES.CASE_CONTENTS(caseId), {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!noteResponse.ok) {
                    throw new Error('Không thể tải dữ liệu hồ sơ.');
                }

                const notes = await noteResponse.json();
                setCaseNote(notes);

                // Fetch uploaded files
                const filesResponse = await fetch(API_ENDPOINTS.CASES.DOCUMENTS(caseId), {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (filesResponse.ok) {
                    const filesData = await filesResponse.json();
                    setUploadedFiles(filesData.data || []);
                }
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

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Không tìm thấy token. Vui lòng đăng nhập lại.");
            return;
        }

        setIsSubmittingNote(true);

        try {
            const response = await fetch(API_ENDPOINTS.CASES.CASE_UPDATES(caseId), {
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
            const noteResponse = await fetch(API_ENDPOINTS.CASES.CASE_CONTENTS(caseId), {
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

    const handleUpdateStatus = async () => {
        if (selectedStatus === caseData.state) {
            toast.error("Trạng thái mới giống với trạng thái hiện tại.");
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Không tìm thấy token. Vui lòng đăng nhập lại.");
            return;
        }
        
        setIsUpdatingStatus(true);

        try {
            const response = await fetch(API_ENDPOINTS.CASES.CASE_STATUS(caseId), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: selectedStatus
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Không thể cập nhật trạng thái.');
            }

            // Update local case data
            setCaseData(prev => ({ ...prev, state: selectedStatus }));

            // Refresh case notes để hiển thị log mới
            const refreshedNotesResponse = await fetch(API_ENDPOINTS.CASES.CASE_CONTENTS(caseId), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (refreshedNotesResponse.ok) {
                const notes = await refreshedNotesResponse.json();
                setCaseNote(notes);
            }

            toast.success(`Đã cập nhật trạng thái thành "${getStatusDisplayName(selectedStatus)}"!`);
        } catch (error) {
            toast.error(`Lỗi: ${error.message}`);
            // Reset selected status on error
            setSelectedStatus(caseData.state);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handlePreviewFile = async (file) => {
        // Nếu là file PDF, mở trong tab mới
        if (file.mime_type && file.mime_type.includes('pdf')) {
            try {
                // Hiển thị loading toast
                const loadingToast = toast.loading('Đang tải file PDF...');
                
                // Tải file và tạo blob URL cho tab mới
                const token = localStorage.getItem('token');
                const response = await fetch(API_ENDPOINTS.CASES.DOCUMENT_PREVIEW(file.document_id), {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Không thể tải file PDF');
                }
                
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                
                // Dismiss loading toast
                toast.dismiss(loadingToast);
                
                // Mở tab mới với blob URL
                const newWindow = window.open('', '_blank');
                if (newWindow) {
                    newWindow.document.write(`
                        <html>
                            <head>
                                <title>${file.original_filename}</title>
                                <meta charset="UTF-8">
                                <style>
                                    body { 
                                        margin: 0; 
                                        padding: 0; 
                                        font-family: Arial, sans-serif; 
                                    }
                                    .header {
                                        background: #f8f9fa;
                                        padding: 10px 20px;
                                        border-bottom: 1px solid #dee2e6;
                                        display: flex;
                                        justify-content: space-between;
                                        align-items: center;
                                    }
                                    .filename {
                                        font-weight: bold;
                                        font-size: 14px;
                                    }
                                    .download-btn {
                                        background: #007bff;
                                        color: white;
                                        border: none;
                                        padding: 6px 12px;
                                        border-radius: 4px;
                                        cursor: pointer;
                                        font-size: 12px;
                                    }
                                    .download-btn:hover {
                                        background: #0056b3;
                                    }
                                    iframe { 
                                        width: 100%; 
                                        height: calc(100vh - 60px); 
                                        border: none; 
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="header">
                                    <span class="filename">${file.original_filename}</span>
                                    <button class="download-btn" onclick="downloadFile()">Tải xuống</button>
                                </div>
                                <iframe src="${url}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH" title="${file.original_filename}"></iframe>
                                <script>
                                    function downloadFile() {
                                        const a = document.createElement('a');
                                        a.href = '${url}';
                                        a.download = '${file.original_filename}';
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                    }
                                    
                                    // Cleanup blob URL when window is closed
                                    window.addEventListener('beforeunload', function() {
                                        URL.revokeObjectURL('${url}');
                                    });
                                </script>
                            </body>
                        </html>
                    `);
                    newWindow.document.close();
                    toast.success('Đã mở file PDF trong tab mới');
                } else {
                    // Cleanup nếu không thể mở tab mới
                    window.URL.revokeObjectURL(url);
                    toast.error('Trình duyệt chặn việc mở tab mới. Vui lòng cho phép popup.');
                }
            } catch (error) {
                toast.error('Không thể mở file PDF');
                console.error('Error opening PDF file:', error);
            }
        } else {
            // Các file khác (ảnh, video, v.v.) hiển thị trong modal
            setPreviewFile(file);
            setIsPreviewOpen(true);
        }
    };

    const closePreview = () => {
        setIsPreviewOpen(false);
        setPreviewFile(null);
    };

    const handleDownloadFile = (fileId, fileName) => {
        const token = localStorage.getItem('token');
        const downloadUrl = API_ENDPOINTS.CASES.DOCUMENT_DOWNLOAD(fileId);
        
        fetch(downloadUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(async response => {
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể tải xuống file');
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Đảm bảo tên file được decode đúng
            a.download = decodeURIComponent(fileName || 'download');
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('Tải xuống thành công');
        })
        .catch(error => {
            toast.error(`Lỗi tải xuống: ${error.message}`);
        });
    };

    const refreshUploadedFiles = async () => {
        const token = localStorage.getItem('token');
        try {
            const filesResponse = await fetch(API_ENDPOINTS.CASES.DOCUMENTS(caseId), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (filesResponse.ok) {
                const filesData = await filesResponse.json();
                setUploadedFiles(filesData.data || []);
            }
        } catch (error) {
            console.error('Error refreshing uploaded files:', error);
        }
    };

    const refreshTimeline = async () => {
        const token = localStorage.getItem('token');
        try {
            const noteResponse = await fetch(API_ENDPOINTS.CASES.CASE_CONTENTS(caseId), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (noteResponse.ok) {
                const notes = await noteResponse.json();
                setCaseNote(notes);
            }
        } catch (error) {
            console.error('Error refreshing timeline:', error);
        }
    };

    const handleDeleteFile = async (fileId) => {
        const fileToDelete = uploadedFiles.find(file => file.document_id === fileId);
        
        setConfirmModal({
            isOpen: true,
            title: 'Xóa tài liệu',
            message: `Bạn có chắc chắn muốn xóa file "${fileToDelete?.original_filename || 'này'}"? Hành động này không thể hoàn tác.`,
            type: 'danger',
            onConfirm: async () => {
                const token = localStorage.getItem('token');
                
                try {
                    const response = await fetch(API_ENDPOINTS.CASES.DELETE_DOCUMENT(fileId), {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        setUploadedFiles(prev => prev.filter(file => file.document_id !== fileId));
                        // Refresh timeline to show delete log
                        refreshTimeline();
                        toast.success('Đã xóa file thành công');
                    } else {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Không thể xóa file');
                    }
                } catch (error) {
                    toast.error(`Lỗi khi xóa file: ${error.message}`);
                }
            }
        });
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
                            <dt>Trạng thái:</dt><dd><strong style={{color: 'var(--primary-color)'}}>{getStatusDisplayName(caseData.state)}</strong></dd>
                        </dl>
                    </div>
                    <div className={styles.card}>
                        <h3>Hành động</h3>
                        <div className={styles.formGroup}>
                            <label htmlFor="case-status">Cập nhật Trạng thái</label>
                            <select 
                                id="case-status" 
                                className={styles.formControl} 
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="beingFollowedUp">Đang đôn đốc</option>
                                <option value="beingSued">Đang khởi kiện</option>
                                <option value="awaitingJudgmentEffect">Chờ hiệu lực án</option>
                                <option value="beingExecuted">Đang thi hành án</option>
                                <option value="proactivelySettled">Chủ động XLTS</option>
                                <option value="debtSold">Bán nợ</option>
                                <option value="amcHired">Thuê AMC XLN</option>
                            </select>
                        </div>
                        <button 
                            className={styles.button} 
                            onClick={handleUpdateStatus}
                            disabled={isUpdatingStatus || selectedStatus === caseData.state}
                        >
                            {isUpdatingStatus ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </div>

                {/* Cột tab bên phải */}
                <div className={`${styles.card} ${styles.tabsColumn}`}>
                    <nav className={styles.tabNav}>
                        <button onClick={() => setActiveTab('timeline')} className={` ${styles.tabButton} ${activeTab === 'timeline' ? styles.active : ''}`}>Nhật ký Xử lý</button>
                        <button onClick={() => setActiveTab('documents')} className={` ${styles.tabButton} ${activeTab === 'documents' ? styles.active : ''}`}>Upload Tài liệu & Hồ sơ</button>
                        <button onClick={() => setActiveTab('uploaded-files')} className={` ${styles.tabButton} ${activeTab === 'uploaded-files' ? styles.active : ''}`}>Tài liệu đã tải lên</button>
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
                                {caseNote.data.map(entry => {
                                    // Lấy tên người dùng từ entry hoặc token hiện tại
                                    const getCurrentUserName = () => {
                                        try {
                                            const token = localStorage.getItem('token');
                                            if (token) {
                                                const decoded = jwtDecode(token);
                                                return decoded.fullname || 'Người dùng';
                                            }
                                        } catch (error) {
                                            console.error('Error decoding token:', error);
                                        }
                                        return 'Người dùng';
                                    };

                                    return (
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
                                                <div className={styles.meta}>
                                                    <strong>{entry.user_fullname || getCurrentUserName()}</strong> - 
                                                    <span> {new Date(entry.created_date).toLocaleTimeString('vi-VN')}, {new Date(entry.created_date).toLocaleDateString('vi-VN')}</span>
                                                </div>
                                                <p>{entry.update_content}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className={styles.tabContent}>
                            <DocumentUploader 
                                caseId={caseId} 
                                onUploadSuccess={refreshUploadedFiles}
                                onTimelineRefresh={refreshTimeline}
                            />
                        </div>
                    )}

                    {activeTab === 'uploaded-files' && (
                        <div className={styles.tabContent}>
                            {/* <h4>Tài liệu đã tải lên</h4> */}
                            
                            {/* Sub-tabs cho từng loại file */}
                            <nav className={styles.subTabNav}>
                                <button 
                                    onClick={() => setActiveFileTab('court')} 
                                    className={`${styles.subTabButton} ${activeFileTab === 'court' ? styles.active : ''}`}
                                >
                                    Tòa án ({organizeFilesByType(uploadedFiles)['court'].length})
                                </button>
                                <button 
                                    onClick={() => setActiveFileTab('enforcement')} 
                                    className={`${styles.subTabButton} ${activeFileTab === 'enforcement' ? styles.active : ''}`}
                                >
                                    Thi hành án ({organizeFilesByType(uploadedFiles)['enforcement'].length})
                                </button>
                                <button 
                                    onClick={() => setActiveFileTab('notification')} 
                                    className={`${styles.subTabButton} ${activeFileTab === 'notification' ? styles.active : ''}`}
                                >
                                    Bán nợ ({organizeFilesByType(uploadedFiles)['notification'].length})
                                </button>
                                <button 
                                    onClick={() => setActiveFileTab('proactive')} 
                                    className={`${styles.subTabButton} ${activeFileTab === 'proactive' ? styles.active : ''}`}
                                >
                                    Chủ động xử lý tài sản ({organizeFilesByType(uploadedFiles)['proactive'].length})
                                </button>
                                <button 
                                    onClick={() => setActiveFileTab('collateral')} 
                                    className={`${styles.subTabButton} ${activeFileTab === 'collateral' ? styles.active : ''}`}
                                >
                                    Tài sản đảm bảo ({organizeFilesByType(uploadedFiles)['collateral'].length})
                                </button>
                                <button 
                                    onClick={() => setActiveFileTab('processed_collateral')} 
                                    className={`${styles.subTabButton} ${activeFileTab === 'processed_collateral' ? styles.active : ''}`}
                                >
                                    Tài sản đã xử lý ({organizeFilesByType(uploadedFiles)['processed_collateral'].length})
                                </button>
                                <button 
                                    onClick={() => setActiveFileTab('other')} 
                                    className={`${styles.subTabButton} ${activeFileTab === 'other' ? styles.active : ''}`}
                                >
                                    Khác ({organizeFilesByType(uploadedFiles)['other'].length})
                                </button>
                            </nav>

                            {/* Hiển thị files của tab được chọn */}
                            <div className={styles.activeFileContent}>
                                {(() => {
                                    const organizedFiles = organizeFilesByType(uploadedFiles);
                                    const currentFiles = organizedFiles[activeFileTab];
                                    
                                    return currentFiles.length > 0 ? (
                                        <div className={styles.filesList}>
                                            {currentFiles.map(file => (
                                                <div key={file.document_id} className={styles.fileItem}>
                                                    <div className={styles.fileIcon}>
                                                        {getFileIcon(file.mime_type, file.original_filename)}
                                                    </div>
                                                    <div className={styles.fileDetails}>
                                                        <div className={styles.fileName}>{file.original_filename}</div>
                                                        <div className={styles.fileInfo}>
                                                            Tải lên: {new Date(file.upload_date).toLocaleDateString('vi-VN')} - {file.file_size ? Math.round(file.file_size / 1024) + ' KB' : 'N/A'}
                                                        </div>
                                                    </div>
                                                    <div className={styles.fileActions}>
                                                        {canPreview(file.mime_type) && (
                                                            <button 
                                                                className={styles.previewBtn}
                                                                onClick={() => handlePreviewFile(file)}
                                                            >
                                                                {file.mime_type && file.mime_type.includes('pdf') ? '🔗 Mở tab mới' : 'Xem trước'}
                                                            </button>
                                                        )}
                                                        <button 
                                                            className={styles.downloadBtn}
                                                            onClick={() => handleDownloadFile(file.document_id, file.original_filename)}
                                                        >
                                                            Tải xuống
                                                        </button>
                                                        <button 
                                                            className={styles.deleteBtn}
                                                            onClick={() => handleDeleteFile(file.document_id)}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className={styles.noFiles}>Chưa có tài liệu {getTypeName(activeFileTab).toLowerCase()} nào được tải lên</p>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Preview Modal cho các file không phải PDF */}
            <PreviewModal 
                isOpen={isPreviewOpen} 
                onClose={closePreview} 
                file={previewFile} 
            />

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
}

export default CaseDetail;
