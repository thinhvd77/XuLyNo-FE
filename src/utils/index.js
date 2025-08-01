/**
 * Centralized utility functions for the application
 * Eliminates code duplication across components
 */

// Status management utilities
export const STATUS_MAPPINGS = {
    'beingFollowedUp': 'Đang đôn đốc',
    'beingSued': 'Đang khởi kiện',
    'awaitingJudgmentEffect': 'Chờ hiệu lực án',
    'beingExecuted': 'Đang thi hành án',
    'proactivelySettled': 'Chủ động XLTS',
    'debtSold': 'Bán nợ',
    'amcHired': 'Thuê AMC XLN'
};

export const CASE_TYPE_MAPPINGS = {
    'internal': 'Nội bảng',
    'external': 'Ngoại bảng'
};

/**
 * Convert status code to display name
 * @param {string} status - Status code
 * @returns {string} Display name
 */
export const getStatusDisplayName = (status) => {
    return STATUS_MAPPINGS[status] || status;
};

/**
 * Convert case type to display name
 * @param {string} caseType - Case type code
 * @returns {string} Display name
 */
export const getCaseTypeDisplayName = (caseType) => {
    return CASE_TYPE_MAPPINGS[caseType] || caseType;
};

/**
 * Format currency amount for Vietnamese locale
 * @param {number|string} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
    const numValue = parseFloat(amount);
    if (isNaN(numValue)) return '0';
    return numValue.toLocaleString('vi-VN');
};

/**
 * Generate status update message for timeline
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 * @param {string} userFullname - User's full name
 * @returns {string} Status update message
 */
export const getStatusUpdateMessage = (oldStatus, newStatus, userFullname) => {
    const oldStatusName = getStatusDisplayName(oldStatus);
    const newStatusName = getStatusDisplayName(newStatus);
    return `${userFullname} đã cập nhật trạng thái từ "${oldStatusName}" thành "${newStatusName}"`;
};

/**
 * Format date for Vietnamese locale
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
};

/**
 * Format datetime for Vietnamese locale
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('vi-VN');
};

/**
 * Validate if user has permission for action
 * @param {string} userRole - User's role
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {boolean} Permission status
 */
export const hasPermission = (userRole, allowedRoles) => {
    return allowedRoles.includes(userRole);
};

/**
 * Generate safe filename from string
 * @param {string} filename - Original filename
 * @returns {string} Safe filename
 */
export const sanitizeFilename = (filename) => {
    if (!filename) return 'untitled';
    return filename.replace(/[<>:"/\\|?*\0]/g, '_').trim();
};

/**
 * Debounce function for search inputs
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

/**
 * Get file extension from filename or mimetype
 * @param {string} filename - Filename
 * @param {string} mimetype - MIME type
 * @returns {string} File extension
 */
export const getFileExtension = (filename, mimetype) => {
    if (filename && filename.includes('.')) {
        return filename.split('.').pop().toLowerCase();
    }

    const mimeExtensions = {
        'application/pdf': 'pdf',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
    };

    return mimeExtensions[mimetype] || 'file';
};
