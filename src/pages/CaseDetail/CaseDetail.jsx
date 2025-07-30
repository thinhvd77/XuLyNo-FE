import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import styles from './CaseDetail.module.css';
import { jwtDecode } from 'jwt-decode';
import { API_ENDPOINTS } from '../../config/api';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';

// Helper function để chuyển đổi status code thành tên hiển thị
const getStatusDisplayName = (status) => {
    const statusMap = {
        'beingFollowedUp': 'Đang đôn đốc',
        'beingSued': 'Đang khởi kiện', 
        'awaitingJudgmentEffect': 'Chờ hiệu lực án',
        'beingExecuted': 'Đang thi hành án',
        'proactivelySettled': 'Chủ động XLTS',
        'debtSold': 'Bán nợ',
        'amcHired': 'Thuê AMC XLN'
    };
    return statusMap[status] || status;
};

// Helper function để tạo message cập nhật trạng thái cho timeline
const getStatusUpdateMessage = (oldStatus, newStatus, userFullname) => {
    const oldStatusName = getStatusDisplayName(oldStatus);
    const newStatusName = getStatusDisplayName(newStatus);
    return `${userFullname} đã cập nhật trạng thái từ "${oldStatusName}" thành "${newStatusName}"`;
};

// Component Icon tái sử dụng
const SvgIcon = ({ path, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>
);

// Component Modal để xem trước file
const PreviewModal = ({ isOpen, onClose, file }) => {
    const [previewUrl, setPreviewUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pdfViewMethod, setPdfViewMethod] = useState('iframe'); // 'iframe', 'google', 'object', 'embed'

    useEffect(() => {
        if (!isOpen || !file) return;

        const loadPreview = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(API_ENDPOINTS.CASES.DOCUMENT_PREVIEW(file.document_id), {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Không thể tải file để xem trước');
                }

                const blob = await response.blob();
                
                // Debug: Kiểm tra thông tin blob
                console.log('Blob info:', {
                    size: blob.size,
                    type: blob.type,
                    fileName: file.original_filename
                });
                
                // Kiểm tra nếu blob rỗng
                if (blob.size === 0) {
                    throw new Error('File rỗng hoặc không hợp lệ');
                }
                
                // Kiểm tra MIME type
                // if (!blob.type.includes('pdf') && !blob.type.includes('application/octet-stream')) {
                //     console.warn('Unexpected MIME type:', blob.type);
                // }
                
                const url = window.URL.createObjectURL(blob);
                console.log('Created blob URL:', url);
                setPreviewUrl(url);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        loadPreview();

        return () => {
            if (previewUrl) {
                window.URL.revokeObjectURL(previewUrl);
            }
        };
    }, [isOpen, file]);

    if (!isOpen || !file) return null;

    const renderPreview = () => {
        if (isLoading) {
            return (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid #f3f3f3',
                        borderTop: '3px solid #007bff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p>Đang tải file...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem',
                    color: '#dc3545'
                }}>
                    <p style={{ fontSize: '18px', marginBottom: '10px' }}>❌ Không thể tải file để xem trước</p>
                    <p style={{ fontSize: '14px', color: '#6c757d' }}>{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '15px',
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Thử lại
                    </button>
                </div>
            );
        }

        if (!previewUrl) return null;

        const mimeType = file.mime_type;
        
        if (mimeType.startsWith('image/')) {
            return (
                <img 
                    src={previewUrl}
                    alt={file.original_filename}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '70vh',
                        objectFit: 'contain'
                    }}
                />
            );
        } else if (mimeType.includes('pdf')) {
            return (
                <div style={{ width: '100%', height: '70vh', display: 'flex', flexDirection: 'column' }}>
                    {/* PDF Viewer Options */}
                    <div style={{ 
                        padding: '10px', 
                        backgroundColor: '#f8f9fa', 
                        borderBottom: '1px solid #dee2e6',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        fontSize: '12px'
                    }}>
                        <span>📄 Chế độ xem:</span>
                        <button 
                            onClick={() => {
                                setPdfViewMethod('iframe');
                                setError(null); // Clear any previous errors
                            }}
                            style={{ 
                                padding: '4px 8px',
                                border: pdfViewMethod === 'iframe' ? '2px solid #007bff' : '1px solid #dee2e6',
                                backgroundColor: pdfViewMethod === 'iframe' ? '#e3f2fd' : 'white',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            Trình duyệt
                        </button>
                        <button 
                            onClick={() => {
                                setPdfViewMethod('google');
                                setError(null); // Clear any previous errors
                            }}
                            style={{ 
                                padding: '4px 8px',
                                border: pdfViewMethod === 'google' ? '2px solid #007bff' : '1px solid #dee2e6',
                                backgroundColor: pdfViewMethod === 'google' ? '#e3f2fd' : 'white',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            Google Viewer
                        </button>
                        <button 
                            onClick={() => {
                                setPdfViewMethod('object');
                                setError(null);
                            }}
                            style={{ 
                                padding: '4px 8px',
                                border: pdfViewMethod === 'object' ? '2px solid #007bff' : '1px solid #dee2e6',
                                backgroundColor: pdfViewMethod === 'object' ? '#e3f2fd' : 'white',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            Object Tag
                        </button>
                        <button 
                            onClick={async () => {
                                try {
                                    // Hiển thị loading
                                    const loadingToast = toast.loading('Đang tải file...');
                                    
                                    // Tải file và tạo blob URL mới cho tab mới
                                    const token = localStorage.getItem('token');
                                    const response = await fetch(API_ENDPOINTS.CASES.DOCUMENT_PREVIEW(file.document_id), {
                                        headers: {
                                            'Authorization': `Bearer ${token}`
                                        }
                                    });
                                    
                                    if (!response.ok) {
                                        throw new Error('Không thể tải file');
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
                                                    <iframe src="${url}" title="${file.original_filename}"></iframe>
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
                                        toast.success('Đã mở file trong tab mới');
                                    } else {
                                        // Cleanup nếu không thể mở tab mới
                                        window.URL.revokeObjectURL(url);
                                        toast.error('Trình duyệt chặn việc mở tab mới. Vui lòng cho phép popup.');
                                    }
                                } catch (error) {
                                    toast.error('Không thể mở file trong tab mới');
                                    console.error('Error opening file in new tab:', error);
                                }
                            }}
                            style={{ 
                                padding: '4px 8px',
                                border: '1px solid #28a745',
                                backgroundColor: 'white',
                                color: '#28a745',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                marginLeft: 'auto'
                            }}
                        >
                            🔗 Mở tab mới
                        </button>
                    </div>
                    
                    {/* PDF Content */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        {pdfViewMethod === 'iframe' && (
                            <>
                                <iframe
                                    src={`${previewUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 'none' }}
                                    title={file.original_filename}
                                    onLoad={() => {
                                        console.log('PDF loaded successfully');
                                    }}
                                    onError={() => {
                                        console.error('PDF iframe failed to load');
                                        setError('Không thể hiển thị PDF trong trình duyệt. Hãy thử Google Viewer hoặc tải xuống file.');
                                    }}
                                />
                                {/* Fallback: Nếu PDF không hiển thị, cung cấp link trực tiếp */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    left: '10px',
                                    background: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                    fontSize: '11px'
                                }}>
                                    <a 
                                        href={previewUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ color: 'white', textDecoration: 'none' }}
                                    >
                                        📄 Mở PDF trong tab mới nếu không thấy
                                    </a>
                                </div>
                            </>
                        )}
                        
                        {pdfViewMethod === 'google' && (
                            <iframe
                                src={`https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + '/api/cases/documents/' + file.document_id + '/preview')}&embedded=true`}
                                width="100%"
                                height="100%"
                                style={{ border: 'none' }}
                                title={file.original_filename}
                                onLoad={() => {
                                    console.log('Google Viewer loaded');
                                }}
                                onError={() => {
                                    console.error('Google Viewer failed to load');
                                    setError('Google Viewer không thể tải file. Vui lòng thử phương thức khác.');
                                }}
                            />
                        )}
                        
                        {pdfViewMethod === 'object' && (
                            <object
                                data={previewUrl}
                                type="application/pdf"
                                width="100%"
                                height="100%"
                                style={{ border: 'none' }}
                            >
                                <p style={{ 
                                    textAlign: 'center', 
                                    padding: '20px',
                                    color: '#666'
                                }}>
                                    Trình duyệt không hỗ trợ hiển thị PDF. 
                                    <br/>
                                    <a 
                                        href={previewUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ 
                                            color: '#007bff',
                                            textDecoration: 'none',
                                            padding: '8px 16px',
                                            border: '1px solid #007bff',
                                            borderRadius: '4px',
                                            display: 'inline-block',
                                            marginTop: '10px'
                                        }}
                                    >
                                        Mở PDF trong tab mới
                                    </a>
                                </p>
                            </object>
                        )}
                        
                        {/* Fallback message khi có lỗi với phương thức hiện tại */}
                        {error && (
                            <div style={{ 
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center', 
                                padding: '20px',
                                backgroundColor: '#f8d7da',
                                color: '#721c24',
                                border: '1px solid #f5c6cb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                zIndex: 10
                            }}>
                                <p style={{ margin: '0 0 15px 0', fontWeight: 'bold' }}>⚠️ {error}</p>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    {pdfViewMethod !== 'iframe' && (
                                        <button 
                                            onClick={() => {
                                                setPdfViewMethod('iframe');
                                                setError(null);
                                            }}
                                            style={{ 
                                                padding: '6px 12px',
                                                backgroundColor: '#007bff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            Thử Trình duyệt
                                        </button>
                                    )}
                                    {pdfViewMethod !== 'google' && (
                                        <button 
                                            onClick={() => {
                                                setPdfViewMethod('google');
                                                setError(null);
                                            }}
                                            style={{ 
                                                padding: '6px 12px',
                                                backgroundColor: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            Thử Google Viewer
                                        </button>
                                    )}
                                    {pdfViewMethod !== 'object' && (
                                        <button 
                                            onClick={() => {
                                                setPdfViewMethod('object');
                                                setError(null);
                                            }}
                                            style={{ 
                                                padding: '6px 12px',
                                                backgroundColor: '#17a2b8',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            Thử Object Tag
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        } else if (mimeType.startsWith('video/')) {
            return (
                <video
                    controls
                    style={{ maxWidth: '100%', maxHeight: '70vh' }}
                    src={previewUrl}
                >
                    Trình duyệt không hỗ trợ video.
                </video>
            );
        } else if (mimeType.startsWith('audio/')) {
            return (
                <audio
                    controls
                    style={{ width: '100%' }}
                    src={previewUrl}
                >
                    Trình duyệt không hỗ trợ audio.
                </audio>
            );
        } else if (mimeType.startsWith('text/')) {
            return (
                <iframe
                    src={previewUrl}
                    width="100%"
                    height="70vh"
                    style={{ border: 'none', backgroundColor: 'white' }}
                    title={file.original_filename}
                />
            );
        } else if (mimeType.includes('application/msword') || 
                   mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
                   mimeType.includes('application/vnd.ms-excel') ||
                   mimeType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
                   mimeType.includes('application/vnd.ms-powerpoint') ||
                   mimeType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')) {
            return (
                <div style={{ width: '100%', height: '70vh', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ 
                        padding: '10px', 
                        backgroundColor: '#f8f9fa', 
                        borderBottom: '1px solid #dee2e6',
                        fontSize: '12px',
                        textAlign: 'center'
                    }}>
                        <span>📄 Xem trước tài liệu Office qua Google Docs Viewer</span>
                    </div>
                    
                    <iframe
                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + '/api/cases/documents/' + file.document_id + '/preview')}&embedded=true`}
                        width="100%"
                        height="100%"
                        style={{ border: 'none', flex: 1 }}
                        title={file.original_filename}
                        onError={() => {
                            setError('Không thể tải file này trong Google Viewer. Vui lòng tải xuống để xem.');
                        }}
                    />
                    
                    {error && (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '10px',
                            backgroundColor: '#f8d7da',
                            color: '#721c24',
                            border: '1px solid #f5c6cb',
                            fontSize: '12px'
                        }}>
                            <p>{error}</p>
                        </div>
                    )}
                </div>
            );
        } else {
            return (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>Không thể xem trước loại file này</p>
                    <p>Vui lòng tải xuống để xem</p>
                </div>
            );
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>{file.original_filename}</h3>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>
                <div className={styles.modalBody}>
                    {renderPreview()}
                </div>
                <div className={styles.modalFooter}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div>
                            <p>Kích thước: {Math.round(file.file_size / 1024)} KB</p>
                            <p style={{ fontSize: '11px', color: '#6c757d', margin: 0 }}>
                                MIME: {file.mime_type || 'N/A'}
                            </p>
                        </div>
                        <button 
                            className={styles.downloadBtn}
                            onClick={() => {
                                const token = localStorage.getItem('token');
                                const downloadUrl = API_ENDPOINTS.CASES.DOCUMENT_DOWNLOAD(file.document_id);
                                fetch(downloadUrl, {
                                    headers: {
                                        'Authorization': `Bearer ${token}`
                                    }
                                })
                                .then(response => response.blob())
                                .then(blob => {
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    // Đảm bảo tên file được decode đúng
                                    a.download = decodeURIComponent(file.original_filename || 'download');
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                });
                            }}
                        >
                            Tải xuống
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DocumentUploader = ({ caseId, onUploadSuccess, onTimelineRefresh }) => {
    const [files, setFiles] = useState([]);
    const [currentDocType, setCurrentDocType] = useState('court'); // Loại tài liệu đang được chọn
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        // Handle rejected files
        if (rejectedFiles.length > 0) {
            rejectedFiles.forEach(({ file, errors }) => {
                errors.forEach((error) => {
                    if (error.code === 'file-too-large') {
                        toast.error(`File "${file.name}" quá lớn. Kích thước tối đa là 50MB.`);
                    } else if (error.code === 'file-invalid-type') {
                        toast.error(`File "${file.name}" không được hỗ trợ.`);
                    } else {
                        toast.error(`Lỗi với file "${file.name}": ${error.message}`);
                    }
                });
            });
        }

        // Handle accepted files
        if (acceptedFiles.length > 0) {
            const newFiles = acceptedFiles.map(file => ({
                id: uuidv4(),
                fileObject: file,
                docType: currentDocType, // Gán loại tài liệu đang được chọn cho file
                status: 'waiting',
                message: 'Sẵn sàng'
            }));
            setFiles(prev => [...prev, ...newFiles]);
            toast.success(`${newFiles.length} file đã được thêm vào danh sách!`);
        }
    }, [currentDocType]); // Phụ thuộc vào currentDocType

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        maxSize: 50 * 1024 * 1024, // 50MB
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-powerpoint': ['.ppt'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
            'text/plain': ['.txt'],
            'text/csv': ['.csv'],
            'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.webm'],
            'audio/*': ['.mp3', '.wav', '.ogg'],
            'application/zip': ['.zip'],
            'application/x-rar-compressed': ['.rar'],
            'application/x-7z-compressed': ['.7z']
        }
    });

    const getTypeName = (type) => {
        switch (type) {
            case 'enforcement': return 'Thi hành án';
            case 'court': return 'Tòa án';
            case 'notification': return 'Bán nợ';
            case 'proactive': return 'Chủ động XLTS';
            case 'collateral': return 'Tài sản đảm bảo';
            case 'processed_collateral': return 'TS đã xử lý';
            case 'other': return 'Tài liệu khác';
            default: return 'Không xác định';
        }
    };

    const handleUploadAll = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Không tìm thấy token. Vui lòng đăng nhập lại.');
            return;
        }
        setIsUploading(true);
        toast.loading('Đang tải lên các file...', { id: 'upload-all' });
        
        const filesToUpload = files.filter(f => f.status === 'waiting' || f.status === 'error');
        
        const uploadPromises = filesToUpload.map(file => {
            const formData = new FormData();
            
            // Đảm bảo file được append với tên đúng encoding
            const fileBlob = new File([file.fileObject], file.fileObject.name, {
                type: file.fileObject.type,
                lastModified: file.fileObject.lastModified
            });
            
            formData.append('documentFile', fileBlob);
            formData.append('document_type', file.docType);
            console.log('Uploading file with type:', file.docType);
            console.log('File name:', file.fileObject.name);
            

            return fetch(API_ENDPOINTS.CASES.DOCUMENTS(caseId), { // API endpoint chung
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            })
            .then(async res => {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Upload thất bại');
                }
                setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'success', message: 'Thành công' } : f));
                return data;
            })
            .catch(err => {
                console.error('Upload error:', err);
                let errorMessage = 'Upload thất bại';
                
                if (err.message.includes('File quá lớn')) {
                    errorMessage = 'File quá lớn (tối đa 50MB)';
                } else if (err.message.includes('Loại file không được hỗ trợ')) {
                    errorMessage = 'Loại file không được hỗ trợ';
                } else if (err.message) {
                    errorMessage = err.message;
                }
                
                setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'error', message: errorMessage } : f));
                throw err;
            });
        });

        await Promise.all(uploadPromises);
        setIsUploading(false);
        toast.dismiss('upload-all');
        
        // Refresh uploaded files list
        if (onUploadSuccess) {
            onUploadSuccess();
        }
        
        // Refresh timeline to show upload logs
        if (onTimelineRefresh) {
            onTimelineRefresh();
        }
        
        // Clear uploaded files from queue
        setFiles(prev => prev.filter(f => f.status !== 'success'));
        
        toast.success('Hoàn tất quá trình upload!');
    };

    const removeFile = (fileId) => setFiles(files.filter(f => f.id !== fileId));
    const hasFilesToUpload = files.some(f => f.status === 'waiting' || f.status === 'error');

    return (
        <div className={styles.uploaderContainer}>
            <div className={styles.formGroup}>
                <label htmlFor="doc-type">1. Chọn loại tài liệu</label>
                <select id="doc-type" className={styles.formControl} value={currentDocType} onChange={(e) => setCurrentDocType(e.target.value)}>
                    <option value="court">Tài liệu Tòa án</option>
                    <option value="enforcement">Tài liệu Thi hành án</option>
                    <option value="notification">Tài liệu Bán nợ</option>
                    <option value="proactive">Tài liệu Chủ động xử lý tài sản</option>
                    <option value="collateral">Tài sản đảm bảo (Ảnh QR)</option>
                    <option value="processed_collateral">Tài liệu tài sản đã xử lý</option>
                    <option value="other">Tài liệu khác</option>
                </select>
            </div>

            <div className={styles.formGroup}>
                <label>2. Tải lên file cho loại tài liệu trên</label>
                <div {...getRootProps({ className: `${styles.dropzone} ${isDragActive ? styles.dragActive : ''}` })}>
                    <input {...getInputProps()} />
                    <p>Kéo thả hoặc nhấn để chọn file</p>
                </div>
            </div>
            
            {files.length > 0 && (
                <div className={styles.fileList}>
                    <h4>Danh sách file chờ upload ({files.length})</h4>
                    <ul>
                        {files.map(file => (
                            <li key={file.id} className={`${styles.fileQueueItem} ${styles[file.status]}`}>
                                <div className={styles.fileInfo}>
                                    <span className={styles.fileTypeBadge}>{getTypeName(file.docType)}</span>
                                    <span className={styles.fileName}>{file.fileObject.name}</span>
                                    <span className={styles.fileSize}>({Math.round(file.fileObject.size / 1024)} KB)</span>
                                </div>
                                <div className={styles.fileStatus}>
                                    <span className={styles.statusText}>{file.message}</span>
                                    <button onClick={() => removeFile(file.id)} className={styles.removeDoc}>🗙</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleUploadAll} disabled={isUploading || !hasFilesToUpload} className={styles.uploadBTN}>
                        {isUploading ? 'Đang xử lý...' : 'Tải lên tất cả'}
                    </button>
                </div>
            )}
        </div>
    );
};


function CaseDetail() {
    const { caseId } = useParams(); // Lấy ID từ URL
    const [caseData, setCaseData] = useState(null);
    const [caseNote, setCaseNote] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('timeline');
    const [activeFileTab, setActiveFileTab] = useState('court'); // Tab con cho uploaded files
    const [newNote, setNewNote] = useState('');
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);
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
                // console.log(caseId);

                const response = await fetch(API_ENDPOINTS.CASES.CASE_DETAIL(caseId), {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Không thể tải dữ liệu hồ sơ.');
                }

                const {data} = await response.json();
                // console.log(data);
                
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
        console.log(newNote);

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

        // Lấy thông tin user từ token để ghi log
        const userInfo = jwtDecode(token);
        const oldStatus = caseData.state;
        
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
            
            // // Tạo một log entry mới cho timeline với thông tin chi tiết về việc thay đổi trạng thái
            // const statusUpdateMessage = getStatusUpdateMessage(oldStatus, selectedStatus, userInfo.fullname);
            
            // // Thêm log vào case timeline bằng cách gọi API thêm note
            // const noteResponse = await fetch(API_ENDPOINTS.CASES.CASE_UPDATES(caseId), {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`
            //     },
            //     body: JSON.stringify({
            //         content: statusUpdateMessage
            //     })
            // });

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

    const getFileIcon = (mimeType, fileName) => {
        if (mimeType.startsWith('image/')) {
            return '🖼️';
        } else if (mimeType.includes('pdf')) {
            return '📄';
        } else if (mimeType.includes('application/msword') || 
                   mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
                   fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
            return '📝';
        } else if (mimeType.includes('application/vnd.ms-excel') ||
                   mimeType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
                   fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
            return '📊';
        } else if (mimeType.includes('application/vnd.ms-powerpoint') ||
                   mimeType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation') ||
                   fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) {
            return '📈';
        } else if (mimeType.startsWith('video/')) {
            return '🎥';
        } else if (mimeType.startsWith('audio/')) {
            return '🎵';
        } else if (mimeType.startsWith('text/')) {
            return '📄';  
        } else {
            return '📎';
        }
    };

    const canPreview = (mimeType) => {
        if (!mimeType) {
            return false;
        }
        return mimeType.startsWith('image/') || 
               mimeType.includes('pdf') || 
               mimeType.startsWith('text/') ||
               mimeType.startsWith('video/') ||
               mimeType.startsWith('audio/') ||
               // Microsoft Office documents
               mimeType.includes('application/msword') ||
               mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
               mimeType.includes('application/vnd.ms-excel') ||
               mimeType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
               mimeType.includes('application/vnd.ms-powerpoint') ||
               mimeType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation');
    };

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

    const organizeFilesByType = () => {
        const fileTypes = ['court', 'enforcement', 'notification', 'proactive', 'collateral', 'processed_collateral', 'other'];
        const organizedFiles = {};
        
        fileTypes.forEach(type => {
            organizedFiles[type] = uploadedFiles.filter(file => file.document_type === type || 
                (type === 'other' && (!file.document_type || file.document_type === 'Khác')));
        });
        
        return organizedFiles;
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
                                    Tòa án ({organizeFilesByType()['court'].length})
                                </button>
                                <button 
                                    onClick={() => setActiveFileTab('enforcement')} 
                                    className={`${styles.subTabButton} ${activeFileTab === 'enforcement' ? styles.active : ''}`}
                                >
                                    Thi hành án ({organizeFilesByType()['enforcement'].length})
                                </button>
                                <button 
                                    onClick={() => setActiveFileTab('notification')} 
                                    className={`${styles.subTabButton} ${activeFileTab === 'notification' ? styles.active : ''}`}
                                >
                                    Bán nợ ({organizeFilesByType()['notification'].length})
                                </button>
                                <button 
                                    onClick={() => setActiveFileTab('proactive')} 
                                    className={`${styles.subTabButton} ${activeFileTab === 'proactive' ? styles.active : ''}`}
                                >
                                    Chủ động xử lý tài sản ({organizeFilesByType()['proactive'].length})
                                </button>
                                <button 
                                    onClick={() => setActiveFileTab('collateral')} 
                                    className={`${styles.subTabButton} ${activeFileTab === 'collateral' ? styles.active : ''}`}
                                >
                                    Tài sản đảm bảo ({organizeFilesByType()['collateral'].length})
                                </button>
                                <button 
                                    onClick={() => setActiveFileTab('processed_collateral')} 
                                    className={`${styles.subTabButton} ${activeFileTab === 'processed_collateral' ? styles.active : ''}`}
                                >
                                    Tài sản đã xử lý ({organizeFilesByType()['processed_collateral'].length})
                                </button>
                                <button 
                                    onClick={() => setActiveFileTab('other')} 
                                    className={`${styles.subTabButton} ${activeFileTab === 'other' ? styles.active : ''}`}
                                >
                                    Khác ({organizeFilesByType()['other'].length})
                                </button>
                            </nav>

                            {/* Hiển thị files của tab được chọn */}
                            <div className={styles.activeFileContent}>
                                {(() => {
                                    const organizedFiles = organizeFilesByType();
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