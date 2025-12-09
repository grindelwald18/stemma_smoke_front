export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://192.168.79.62/api/cv',
    TIMEOUT: 30000,
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
    }
};

