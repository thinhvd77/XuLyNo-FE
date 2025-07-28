// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'http://your-production-server.com' 
    : 'http://192.168.1.16:3000';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/auth/login`,
    },
    USERS: {
        LIST: `${API_BASE_URL}/api/users`,
        CREATE: `${API_BASE_URL}/api/users/create`,
        DELETE: (id) => `${API_BASE_URL}/api/users/${id}`,
    },
    CASES: {
        MY_CASES: `${API_BASE_URL}/api/cases/my-cases`,
        IMPORT_INTERNAL: `${API_BASE_URL}/api/cases/import-internal`,
        IMPORT_EXTERNAL: `${API_BASE_URL}/api/cases/import-external`,
        DOCUMENTS: (caseId) => `${API_BASE_URL}/api/cases/${caseId}/documents`,
        DOCUMENT_PREVIEW: (documentId) => `${API_BASE_URL}/api/cases/documents/${documentId}/preview`,
        DOCUMENT_DOWNLOAD: (documentId) => `${API_BASE_URL}/api/cases/documents/${documentId}/download`,
        CASE_DETAIL: (caseId) => `${API_BASE_URL}/api/cases/${caseId}`,
        CASE_CONTENTS: (caseId) => `${API_BASE_URL}/api/cases/contents/${caseId}`,
        CASE_UPDATES: (caseId) => `${API_BASE_URL}/api/cases/${caseId}/updates`,
        CASE_STATUS: (caseId) => `${API_BASE_URL}/api/cases/${caseId}/status`,
        DELETE_DOCUMENT: (documentId) => `${API_BASE_URL}/api/cases/documents/${documentId}`,
    },
    DASHBOARD: {
        STATS: `${API_BASE_URL}/api/dashboard/stats`,
    }
};

export default API_BASE_URL;
