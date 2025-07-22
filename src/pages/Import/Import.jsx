import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './Import.module.css';

// Component con cho các icon
const SvgIcon = ({ path, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
    </svg>
);

const ImportResult = ({ result }) => {
    if (!result) return null;

    return (
        <div className={styles.resultSummary}>
            <div className={styles.resultItem}>
                <span>Tổng số dòng:</span>
                <strong>{result.totalRowsInFile}</strong>
            </div>
            <div className={styles.resultItem}>
                <span>Đã xử lý:</span>
                <strong>{result.processedCustomers}</strong>
            </div>
            <div className={styles.resultItem}>
                <span className={styles.created}>Tạo mới:</span>
                <strong className={styles.created}>{result.created}</strong>
            </div>
            <div className={styles.resultItem}>
                <span className={styles.updated}>Cập nhật:</span>
                <strong className={styles.updated}>{result.updated}</strong>
            </div>
        </div>
    );
};

function ImportPage() {
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback(acceptedFiles => {
        const newFiles = acceptedFiles.map(file => Object.assign(file, {
            status: 'waiting',
            message: 'Sẵn sàng',
            result: null,
        }));
        setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        }
    });

    const updateFileState = (fileName, newState) => {
        setFiles(prevFiles =>
            prevFiles.map(f =>
                f.name === fileName ? { ...f, ...newState } : f
            )
        );
    };

    const handleUpload = async () => {
        setIsUploading(true);
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            setIsUploading(false);
            return;
        }

        const uploadPromises = files.map(file => {
            if (file.status === 'waiting' || file.status === 'error') {
                updateFileState(file.name, { status: 'uploading', message: 'Đang tải lên...' });

                const formData = new FormData();
                // --- THIS IS THE FIX ---
                // Change the field name from 'file' to 'casesFile' to match the backend
                formData.append('casesFile', file);
                // --- END OF FIX ---

                return fetch('http://localhost:3000/api/cases/import', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                })
                    .then(async response => {
                        const data = await response.json();
                        if (!response.ok) {
                            throw new Error(data.message || `Lỗi máy chủ: ${response.status}`);
                        }
                        return data;
                    })
                    .then(data => {
                        updateFileState(file.name, { status: 'success', message: data.message, result: data.data });
                    })
                    .catch(err => {
                        updateFileState(file.name, { status: 'error', message: err.message || 'Upload thất bại' });
                    });
            }
            return Promise.resolve();
        });

        await Promise.all(uploadPromises);
        setIsUploading(false);
    };

    const removeFile = (fileName) => {
        setFiles(files.filter(file => file.name !== fileName));
    };

    return (
        <>
            <div className={styles.pageHeader}>
                <h1>Import Dữ liệu Hồ sơ</h1>
                <p>Tải lên các file Excel (.xls, .xlsx) để thêm mới hoặc cập nhật hồ sơ hàng loạt.</p>
            </div>

            <div className={styles.card}>
                <div {...getRootProps({ className: `${styles.dropzone} ${isDragActive ? styles.dragActive : ''}` })}>
                    <input {...getInputProps()} />
                    <SvgIcon path="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" className={styles.uploadIcon} />
                    {isDragActive ?
                        <p>Thả file vào đây...</p> :
                        <p>Kéo và thả file vào đây, hoặc nhấn để chọn file</p>
                    }
                    <em className={styles.fileTypeHint}>(Chỉ chấp nhận file .xls và .xlsx)</em>
                </div>

                {files.length > 0 && (
                    <div className={styles.fileList}>
                        <h3>File chờ xử lý ({files.length})</h3>
                        <ul>
                            {files.map((file, index) => (
                                <li key={index} className={`${styles.fileListItem} ${styles[file.status]}`}>
                                    <div className={styles.fileDetails}>
                                        <div className={styles.fileInfo}>
                                            <SvgIcon path="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" className={styles.fileIcon} />
                                            <div>
                                                <span className={styles.fileName}>{file.name}</span>
                                                <span className={styles.fileSize}>({(file.size / 1024).toFixed(2)} KB)</span>
                                            </div>
                                        </div>
                                        <div className={styles.fileStatus}>
                                            <span className={styles.statusMessage}>{file.message}</span>
                                            <button onClick={() => removeFile(file.name)} className={styles.removeBtn} disabled={file.status === 'uploading'}>&times;</button>
                                        </div>
                                    </div>
                                    {file.status === 'success' && <ImportResult result={file.result} />}
                                </li>
                            ))}
                        </ul>
                        <div className={styles.actions}>
                            <button onClick={handleUpload} disabled={isUploading || files.every(f => f.status === 'success')}>
                                {isUploading ? 'Đang xử lý...' : 'Bắt đầu Import'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default ImportPage;