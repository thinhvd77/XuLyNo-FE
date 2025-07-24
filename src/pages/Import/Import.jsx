// import { useState, useCallback } from 'react';
// import { useDropzone } from 'react-dropzone';
// import { v4 as uuidv4 } from 'uuid';
// import styles from './Import.module.css';

// // Component con cho các icon
// const SvgIcon = ({ path, className = '' }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
//         <path d={path} />
//     </svg>
// );

// // Component con để hiển thị kết quả import chi tiết
// const ImportResult = ({ result }) => {
//     if (!result) return null;
//     return (
//         <div className={styles.resultSummary}>
//             <div className={styles.resultItem}><span>Tổng số dòng:</span><strong>{result.totalRowsInFile}</strong></div>
//             <div className={styles.resultItem}><span>Đã xử lý:</span><strong>{result.processedCustomers}</strong></div>
//             <div className={styles.resultItem}><span className={styles.created}>Tạo mới:</span><strong className={styles.created}>{result.created}</strong></div>
//             <div className={styles.resultItem}><span className={styles.updated}>Cập nhật:</span><strong className={styles.updated}>{result.updated}</strong></div>
//         </div>
//     );
// };

// function ImportPage() {
//     const [files, setFiles] = useState([]);
//     const [isUploading, setIsUploading] = useState(false);

//     const onDrop = useCallback(acceptedFiles => {
//         const newFiles = acceptedFiles.map(file => Object.assign(file, {
//             id: uuidv4(),
//             status: 'waiting',
//             message: 'Sẵn sàng',
//             result: null,
//         }));
//         setFiles(prevFiles => [...prevFiles, ...newFiles]);
//     }, []);

//     const { getRootProps, getInputProps, isDragActive } = useDropzone({
//         onDrop,
//         accept: {
//             'application/vnd.ms-excel': ['.xls'],
//             'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
//         }
//     });

//     const handleUpload = async () => {
//         setIsUploading(true);
//         // Sửa lại key cho nhất quán với file Login.jsx
//         const token = localStorage.getItem('token');

//         if (!token) {
//             alert('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
//             setIsUploading(false);
//             return;
//         }

//         // --- FIX: Logic xử lý upload ---

//         // 1. Lọc ra danh sách các file cần upload (trạng thái 'waiting' hoặc 'error')
//         const filesToUpload = files.filter(
//             (file) => file.status === 'waiting' || file.status === 'error'
//         );

//         // 2. Cập nhật giao diện cho TẤT CẢ các file này sang trạng thái 'uploading' CÙNG LÚC
//         setFiles((prevFiles) =>
//             prevFiles.map((file) =>
//                 filesToUpload.some((f) => f.id === file.id)
//                     ? { ...file, status: 'uploading', message: 'Đang tải lên...' }
//                     : file
//             )
//         );

//         // 3. Thực hiện gọi API cho danh sách file đã được lọc ở bước 1
//         const uploadPromises = filesToUpload.map((file) => {
//             const formData = new FormData();
//             formData.append('casesFile', file);

//             return fetch('http://localhost:3000/api/cases/import', {
//                 method: 'POST',
//                 headers: { Authorization: `Bearer ${token}` },
//                 body: formData,
//             })
//             .then(async (response) => {
//                 const data = await response.json();
//                 if (!response.ok) {
//                     throw new Error(data.message || `Lỗi máy chủ: ${response.status}`);
//                 }
//                 return data;
//             })
//             .then((data) => {
//                 // Cập nhật trạng thái từng file khi có kết quả
//                 setFiles((prev) =>
//                     prev.map((f) =>
//                         f.id === file.id ? { ...f, status: 'success', message: data.message, result: data.data } : f
//                     )
//                 );
//             })
//             .catch((err) => {
//                 setFiles((prev) =>
//                     prev.map((f) =>
//                         f.id === file.id ? { ...f, status: 'error', message: err.message || 'Upload thất bại' } : f
//                     )
//                 );
//             });
//         });

//         // Đợi tất cả các promise hoàn thành
//         await Promise.all(uploadPromises);
//         setIsUploading(false);
//     };

//     const removeFile = (fileId) => {
//         setFiles(files.filter(file => file.id !== fileId));
//     };

//     const hasFilesToUpload = files.some(f => f.status === 'waiting' || f.status === 'error');

//     return (
//         <>
//             <div className={styles.pageHeader}>
//                 <h1>Import Dữ liệu Hồ sơ</h1>
//                 <p>Tải lên các file Excel (.xls, .xlsx) để thêm mới hoặc cập nhật hồ sơ hàng loạt.</p>
//             </div>

//             <div className={styles.card}>
//                 <div {...getRootProps({ className: `${styles.dropzone} ${isDragActive ? styles.dragActive : ''}` })}>
//                     <input {...getInputProps()} />
//                     <SvgIcon path="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" className={styles.uploadIcon} />
//                     <p>{isDragActive ? "Thả file vào đây..." : "Kéo và thả file vào đây, hoặc nhấn để chọn file"}</p>
//                     <em className={styles.fileTypeHint}>(Chỉ chấp nhận file .xls và .xlsx)</em>
//                 </div>

//                 {files.length > 0 && (
//                     <div className={styles.fileList}>
//                         <h3>File chờ xử lý ({files.length})</h3>
//                         <ul>
//                             {files.map((file) => (
//                                 <li key={file.id} className={`${styles.fileListItem} ${styles[file.status]}`}>
//                                     <div className={styles.fileDetails}>
//                                         <div className={styles.fileInfo}>
//                                             <SvgIcon path="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" className={styles.fileIcon} />
//                                             <div>
//                                                 <span className={styles.fileName}>{file.name}</span>
//                                                 <span className={styles.fileSize}>({(file.size / 1024).toFixed(2)} KB)</span>
//                                             </div>
//                                         </div>
//                                         <div className={styles.fileStatus}>
//                                             <span className={styles.statusMessage}>{file.message}</span>
//                                             <button onClick={() => removeFile(file.id)} className={styles.removeBtn} disabled={file.status === 'uploading'}>&times;</button>
//                                         </div>
//                                     </div>
//                                     {file.status === 'success' && <ImportResult result={file.result} />}
//                                 </li>
//                             ))}
//                         </ul>
//                         <div className={styles.actions}>
//                             <button onClick={handleUpload} disabled={isUploading || !hasFilesToUpload}>
//                                 {isUploading ? 'Đang xử lý...' : 'Bắt đầu Import'}
//                             </button>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </>
//     );
// }

// export default ImportPage;

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import styles from './Import.module.css';

// Component con cho các icon
const SvgIcon = ({ path, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
    </svg>
);

// Component con để hiển thị kết quả import chi tiết
const ImportResult = ({ result }) => {
    if (!result) return null;
    return (
        <div className={styles.resultSummary}>
            <div className={styles.resultItem}><span>Tổng số dòng:</span><strong>{result.totalRowsInFile}</strong></div>
            <div className={styles.resultItem}><span>Đã xử lý:</span><strong>{result.processedCustomers}</strong></div>
            <div className={styles.resultItem}><span className={styles.created}>Tạo mới:</span><strong className={styles.created}>{result.created}</strong></div>
            <div className={styles.resultItem}><span className={styles.updated}>Cập nhật:</span><strong className={styles.updated}>{result.updated}</strong></div>
        </div>
    );
};

// Component con cho khu vực upload, có thể tái sử dụng
const UploadArea = ({ importType }) => {
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback(acceptedFiles => {
        const newFiles = acceptedFiles.map(file => Object.assign(file, {
            id: uuidv4(),
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

    const handleUpload = async () => {
        setIsUploading(true);
        const token = localStorage.getItem('token');

        if (!token) {
            toast.error('Lỗi: Không tìm thấy token xác thực.');
            setIsUploading(false);
            return;
        }

        const apiEndpoint = importType === 'internal'
            ? 'http://localhost:3000/api/cases/import-internal'
            : 'http://localhost:3000/api/cases/import-external';

        toast.loading(`Đang import file cho ${importType === 'internal' ? 'Nội bảng' : 'Ngoại bảng'}...`, { id: 'uploading' });

        const filesToUpload = files.filter(f => f.status === 'waiting' || f.status === 'error');
        setFiles(prev => prev.map(f => filesToUpload.some(fu => fu.id === f.id) ? { ...f, status: 'uploading', message: 'Đang tải lên...' } : f));

        const uploadPromises = filesToUpload.map(file => {
            const formData = new FormData();
            formData.append('casesFile', file);

            return fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            })
                .then(async res => {
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || `Lỗi: ${res.status}`);
                    return data;
                })
                .then(data => setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'success', message: data.message, result: data.data } : f)))
                .catch(err => setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'error', message: err.message } : f)));
        });

        await Promise.all(uploadPromises);
        setIsUploading(false);
        toast.dismiss('uploading');
        toast.success('Quá trình import đã hoàn tất!');
    };

    const removeFile = (fileId) => {
        setFiles(files.filter(file => file.id !== fileId));
    };

    const hasFilesToUpload = files.some(f => f.status === 'waiting' || f.status === 'error');

    return (
        <div>
            <div {...getRootProps({ className: `${styles.dropzone} ${isDragActive ? styles.dragActive : ''}` })}>
                <input {...getInputProps()} />
                <SvgIcon path="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" className={styles.uploadIcon} />
                <p>{isDragActive ? "Thả file vào đây..." : "Kéo và thả file vào đây, hoặc nhấn để chọn file"}</p>
                <em className={styles.fileTypeHint}>(Chỉ chấp nhận file .xls và .xlsx)</em>
            </div>
            {files.length > 0 && (
                <div className={styles.fileList}>
                    <ul>
                        {files.map((file) => (
                            <li key={file.id} className={`${styles.fileListItem} ${styles[file.status]}`}>
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
                                        <button onClick={() => removeFile(file.id)} className={styles.removeBtn} disabled={file.status === 'uploading'}>&times;</button>
                                    </div>
                                </div>
                                {file.status === 'success' && <ImportResult result={file.result} />}
                            </li>
                        ))}
                    </ul>
                    <div className={styles.actions}>
                        <button onClick={handleUpload} disabled={isUploading || !hasFilesToUpload}>
                            {isUploading ? 'Đang xử lý...' : 'Bắt đầu Import'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

function ImportPage() {
    const [activeTab, setActiveTab] = useState('internal');

    if (localStorage.getItem('token') === null) {
        toast.error('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
    }

    return (
        <>
            <div className={styles.pageHeader}>
                <h1>Import Dữ liệu Hồ sơ</h1>
                <p>Chọn loại hồ sơ và tải lên file Excel (.xls, .xlsx) tương ứng.</p>
            </div>

            <div className={styles.card}>
                <div className={styles.tabNav}>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'internal' ? styles.active : ''}`}
                        onClick={() => setActiveTab('internal')}
                    >
                        Nội bảng
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'external' ? styles.active : ''}`}
                        onClick={() => setActiveTab('external')}
                    >
                        Ngoại bảng
                    </button>
                </div>

                <div className={styles.tabContent}>
                    {activeTab === 'internal' && (
                        <UploadArea importType="internal" key="internal" />
                    )}
                    {activeTab === 'external' && (
                        <UploadArea importType="external" key="external" />
                    )}
                </div>
            </div>
        </>
    );
}

export default ImportPage;