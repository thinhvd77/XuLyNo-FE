import { useState, useEffect } from 'react';
import styles from './CaseDetailModal.module.css';
import { API_ENDPOINTS } from '../../config/api';

const CaseDetailModal = ({ caseId, isOpen, onClose }) => {
    const [caseDetail, setCaseDetail] = useState(null);
    const [caseUpdates, setCaseUpdates] = useState([]);
    const [caseDocuments, setCaseDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && caseId) {
            fetchCaseDetail();
        }
    }, [isOpen, caseId]);

    const fetchCaseDetail = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            setIsLoading(true);
            setError(null);

            // Lấy thông tin chi tiết case
            console.log('Fetching case detail for ID:', caseId);
            const detailResponse = await fetch(API_ENDPOINTS.CASES.CASE_DETAIL(caseId), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Detail response status:', detailResponse.status);
            if (!detailResponse.ok) {
                throw new Error('Không thể tải thông tin chi tiết hồ sơ.');
            }

            const detailResult = await detailResponse.json();
            console.log('Detail result:', detailResult);
            setCaseDetail(detailResult.data);

            // Lấy danh sách updates
            console.log('Fetching case updates for ID:', caseId);
            const updatesResponse = await fetch(API_ENDPOINTS.CASES.CASE_UPDATES(caseId), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Updates response status:', updatesResponse.status);
            if (updatesResponse.ok) {
                const updatesResult = await updatesResponse.json();
                console.log('Updates result:', updatesResult);
                setCaseUpdates(updatesResult.data || []);
            }

            // Lấy danh sách documents
            console.log('Fetching case documents for ID:', caseId);
            console.log('Documents API URL:', API_ENDPOINTS.CASES.DOCUMENTS(caseId));
            const documentsResponse = await fetch(API_ENDPOINTS.CASES.DOCUMENTS(caseId), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Documents response status:', documentsResponse.status);
            if (documentsResponse.ok) {
                const documentsResult = await documentsResponse.json();
                console.log('Documents result:', documentsResult);
                setCaseDocuments(documentsResult.data || []);
            } else {
                console.error('Documents fetch failed:', await documentsResponse.text());
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const mapCaseStatus = {
        'beingFollowedUp': 'Đang đôn đốc',
        'beingSued': 'Đang khởi kiện',
        'awaitingJudgmentEffect': 'Chờ hiệu lực án',
        'beingExecuted': 'Đang thi hành án',
        'proactivelySettled': 'Chủ động XLTS',
        'debtSold': 'Bán nợ',
        'amcHired': 'Thuê AMC XLN'
    }

    const getStatusClass = (status) => {
        const statusClassMap = {
            'beingFollowedUp': 'beingFollowedUp',
            'beingSued': 'beingSued',
            'awaitingJudgmentEffect': 'awaitingJudgmentEffect',
            'beingExecuted': 'beingExecuted',
            'proactivelySettled': 'proactivelySettled',
            'debtSold': 'debtSold',
            'amcHired': 'amcHired',
            // Thêm classes cho các status mới
            'settled': 'settled',
            'closed': 'closed',
            'pending': 'pending',
            'active': 'active',
            'inactive': 'inactive',
            'reviewing': 'reviewing',
            'approved': 'approved',
            'rejected': 'rejected'
        };
        return statusClassMap[status] || 'statusDefault';
    };

    const handlePreviewDocument = async (documentId, fileName) => {
        const token = localStorage.getItem('token');
        try {
            // Tạo URL với token trong Authorization header
            const response = await fetch(API_ENDPOINTS.CASES.DOCUMENT_PREVIEW(documentId), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
                // Clean up the URL after a delay
                setTimeout(() => window.URL.revokeObjectURL(url), 1000);
            } else {
                console.error('Preview failed:', response.status, response.statusText);
                alert('Không thể xem trước tài liệu này.');
            }
        } catch (error) {
            console.error('Error previewing document:', error);
            alert('Lỗi khi xem trước tài liệu.');
        }
    };

    const handleDownloadDocument = async (documentId, fileName) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(API_ENDPOINTS.CASES.DOCUMENT_DOWNLOAD(documentId), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Error downloading document:', error);
        }
    };

    const getFileIcon = (fileName) => {
        if (!fileName) return null;
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#d32f2f">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                );
            case 'doc':
            case 'docx':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1976d2">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                );
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#4caf50">
                        <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
                    </svg>
                );
            default:
                return (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#757575">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                );
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Chi tiết hồ sơ</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className={styles.modalBody}>
                    {isLoading ? (
                        <div className={styles.loading}>Đang tải thông tin...</div>
                    ) : error ? (
                        <div className={styles.error}>Lỗi: {error}</div>
                    ) : caseDetail ? (
                        <>
                            {/* Cập nhật gần nhất */}
                            {caseUpdates.length > 0 && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Cập nhật gần nhất</h3>
                                    <div className={styles.recentUpdate}>
                                        <div className={styles.recentUpdateContent}>
                                            <div className={styles.updateMeta}>
                                                <span className={styles.updateDate}>
                                                    {formatDate(caseUpdates[0].created_date)}
                                                </span>
                                                <span className={styles.updateAuthor}>
                                                    {caseUpdates[0].officer?.fullname || 'Không xác định'}
                                                </span>
                                            </div>
                                            <div className={styles.updateContent}>
                                                {caseUpdates[0].update_content}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Thông tin khách hàng */}
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>Thông tin khách hàng</h3>
                                <div className={styles.customerInfo}>
                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoItem}>
                                            <span className={styles.label}>Tên khách hàng:</span>
                                            <span className={styles.value}>{caseDetail.customer_name}</span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span className={styles.label}>Mã khách hàng:</span>
                                            <span className={styles.value}>{caseDetail.customer_code}</span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span className={styles.label}>Dư nợ:</span>
                                            <span className={`${styles.value} ${styles.amount}`}>
                                                {formatCurrency(caseDetail.outstanding_debt)}
                                            </span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span className={styles.label}>Loại hồ sơ:</span>
                                            <span className={`${styles.value} ${styles.caseType} ${caseDetail.case_type === 'internal' ? styles.internal : styles.external}`}>
                                                {caseDetail.case_type === 'internal' ? 'Nội bảng' : 'Ngoại bảng'}
                                            </span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span className={styles.label}>Trạng thái:</span>
                                            <span className={`${styles.status} ${getStatusClass(caseDetail.state)}`}>
                                                {mapCaseStatus[caseDetail.state]}
                                            </span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span className={styles.label}>Người phụ trách:</span>
                                            <span className={styles.value}>
                                                {caseDetail.officer?.fullname || 'Chưa phân công'}
                                            </span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span className={styles.label}>Ngày tạo:</span>
                                            <span className={styles.value}>
                                                {formatDate(caseDetail.created_date)}
                                            </span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span className={styles.label}>Cập nhật cuối:</span>
                                            <span className={styles.value}>
                                                {formatDate(caseDetail.last_modified_date)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tài liệu đính kèm */}
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>Tài liệu đính kèm</h3>
                                <div className={styles.documentsContainer}>
                                    {caseDocuments.length === 0 ? (
                                        <div className={styles.noDocuments}>
                                            Chưa có tài liệu nào được tải lên.
                                        </div>
                                    ) : (
                                        <div className={styles.documentsList}>
                                            {caseDocuments.map((document) => (
                                                <div key={document.document_id} className={styles.documentItem}>
                                                    <div className={styles.documentInfo}>
                                                        <div className={styles.documentIcon}>
                                                            {getFileIcon(document.original_filename)}
                                                        </div>
                                                        <div className={styles.documentDetails}>
                                                            <div className={styles.documentName}>
                                                                {document.original_filename}
                                                            </div>
                                                            <div className={styles.documentMeta}>
                                                                <span className={styles.documentDate}>
                                                                    {formatDate(document.upload_date)}
                                                                </span>
                                                                <span className={styles.documentUploader}>
                                                                    {document.uploader?.fullname || 'Không xác định'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={styles.documentActions}>
                                                        <button
                                                            onClick={() => handlePreviewDocument(document.document_id, document.original_filename)}
                                                            className={styles.previewBtn}
                                                            title="Xem trước"
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownloadDocument(document.document_id, document.original_filename)}
                                                            className={styles.downloadBtn}
                                                            title="Tải xuống"
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Lịch sử cập nhật */}
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>Lịch sử cập nhật gần nhất</h3>
                                <div className={styles.updatesContainer}>
                                    {caseUpdates.length === 0 ? (
                                        <div className={styles.noUpdates}>
                                            Chưa có cập nhật nào cho hồ sơ này.
                                        </div>
                                    ) : (
                                        <div className={styles.timeline}>
                                            {caseUpdates.slice(0, 10).map((update, index) => (
                                                <div key={update.update_id} className={styles.timelineItem}>
                                                    <div className={styles.timelineIcon}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                                        </svg>
                                                    </div>
                                                    <div className={styles.timelineContent}>
                                                        <div className={styles.updateMeta}>
                                                            <span className={styles.updateDate}>
                                                                {formatDate(update.created_date)}
                                                            </span>
                                                            <span className={styles.updateAuthor}>
                                                                {update.officer?.fullname || 'Không xác định'}
                                                            </span>
                                                        </div>
                                                        <div className={styles.updateContent}>
                                                            {update.update_content}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.closeBtn} onClick={onClose}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CaseDetailModal;
