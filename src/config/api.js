// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'http://your-production-server.com' 
    : 'http://localhost:3000';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/auth/login`,
    },
    USERS: {
        LIST: `${API_BASE_URL}/api/users`,
        CREATE: `${API_BASE_URL}/api/users/create`,
        UPDATE: (id) => `${API_BASE_URL}/api/users/${id}`,
        TOGGLE_STATUS: (id) => `${API_BASE_URL}/api/users/${id}/status`,
        DELETE: (id) => `${API_BASE_URL}/api/users/${id}`,
        CHANGE_PASSWORD: (id) => `${API_BASE_URL}/api/users/${id}/change-password`,
        EMPLOYEES_FOR_FILTER: `${API_BASE_URL}/api/users/employees-for-filter`,
    },
    CASES: {
        MY_CASES: `${API_BASE_URL}/api/cases/my-cases`,
        ALL_CASES: `${API_BASE_URL}/api/cases/all-cases`,
        DEPARTMENT_CASES: `${API_BASE_URL}/api/cases/department-cases`,
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
        DIRECTOR_STATS: `${API_BASE_URL}/api/dashboard/director-stats`,
    }
};

export default API_BASE_URL;
