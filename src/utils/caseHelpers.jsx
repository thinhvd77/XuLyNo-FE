// Helper function để chuyển đổi status code thành tên hiển thị
export const getStatusDisplayName = (status) => {
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
export const getStatusUpdateMessage = (oldStatus, newStatus, userFullname) => {
    const oldStatusName = getStatusDisplayName(oldStatus);
    const newStatusName = getStatusDisplayName(newStatus);
    return `${userFullname} đã cập nhật trạng thái từ "${oldStatusName}" thành "${newStatusName}"`;
};

// Helper function để lấy icon cho file
export const getFileIcon = (mimeType, fileName) => {
    if (mimeType.startsWith('image/')) {
        return (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14,2 14,8 20,8"/>
                <circle cx="10" cy="10" r="2" fill="#FFD700" stroke="#4A90E2"/>
                <path d="M18 16l-3-3-4 4-2-2-3 3" fill="#7FB069" stroke="#4A90E2" strokeWidth="1"/>
            </svg>
        );
    } else if (mimeType.includes('pdf')) {
        return (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14,2 14,8 20,8"/>
                <rect x="6" y="11" width="12" height="6" rx="1"/>
                <text x="12" y="15.5" textAnchor="middle" fontSize="4" fontWeight="bold" fill="currentColor" stroke="none">PDF</text>
            </svg>
        );
    } else if (mimeType.includes('application/msword') ||
        mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
        fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        return (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14,2 14,8 20,8"/>
                <rect x="6" y="11" width="12" height="6" rx="1"/>
                <text x="12" y="15.5" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="currentColor" stroke="none">DOCX</text>
            </svg>
        );
    } else if (mimeType.includes('application/vnd.ms-excel') ||
        mimeType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
        fileName.endsWith('.xls') || fileName.endsWith('.xlsx') || fileName.endsWith('.csv')) {
        return (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14,2 14,8 20,8"/>
                <rect x="6" y="11" width="12" height="6" rx="1"/>
                <text x="12" y="15.5" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="currentColor" stroke="none">XLSX</text>
            </svg>
        );
    } else if (mimeType.includes('application/vnd.ms-powerpoint') ||
        mimeType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation') ||
        fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) {
        return (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14,2 14,8 20,8"/>
                <path d="M8 14v4"/>
                <path d="M12 14v4"/>
                <path d="M16 14v4"/>
                <path d="M8 10h8"/>
            </svg>
        );
    } else if (mimeType.startsWith('video/')) {
        return (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
        );
    } else if (mimeType.startsWith('audio/')) {
        return (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
            </svg>
        );
    } else if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) {
        return (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 22h2a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v3"/>
                <polyline points="14,2 14,8 20,8"/>
                <circle cx="10" cy="20" r="2"/>
                <path d="M10 7v6"/>
                <path d="M10 22v-2"/>
            </svg>
        );
    } else {
        return (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14,2 14,8 20,8"/>
            </svg>
        );
    }
};

// Helper function để kiểm tra file có thể preview được không
export const canPreview = (mimeType) => {
    if (!mimeType) {
        return false;
    }
    return mimeType.startsWith('image/') ||
        mimeType.includes('pdf') ||
        mimeType.startsWith('text/') ||
        mimeType.startsWith('video/') ||
        mimeType.startsWith('audio/') ||
        mimeType.includes('application/msword') ||
        mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
        mimeType.includes('application/vnd.ms-excel') ||
        mimeType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
        mimeType.includes('application/vnd.ms-powerpoint') ||
        mimeType.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation');
};

// Helper function để lấy tên loại tài liệu
export const getTypeName = (type) => {
    const types = {
        'enforcement': 'Thi hành án',
        'court': 'Tòa án',
        'notification': 'Báo nợ',
        'proactive': 'Chủ động XLN',
        'collateral': 'Tài sản đảm bảo',
        'processed_collateral': 'TS đã xử lý',
        'other': 'Tài liệu khác'
    };
    return types[type] || 'Không xác định';
};

// Helper function để tổ chức files theo loại
export const organizeFilesByType = (uploadedFiles) => {
    const fileTypes = ['court', 'enforcement', 'notification', 'proactive', 'collateral', 'processed_collateral', 'other'];
    const organizedFiles = {};

    fileTypes.forEach(type => {
        organizedFiles[type] = uploadedFiles.filter(file =>
            file.document_type === type ||
            (type === 'other' && (!file.document_type || file.document_type === 'Khác'))
        );
    });

    return organizedFiles;
};
