import axios from 'axios';

// Get the API base URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

console.log('API Base URL:', API_BASE_URL); // Debug log

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: false,
    timeout: 30000,
    validateStatus: function (status) {
        return status >= 200 && status < 500;
    }
});

// Add request interceptor for logging
api.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.url); // Debug log
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log('Response received:', response.config.url, response.status); // Debug log
        return response;
    },
    (error) => {
        console.error('Response error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            code: error.code,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers
            }
        });

        if (error.code === 'ECONNABORTED') {
            return Promise.reject(new Error('Server is taking too long to respond. Please try again.'));
        }

        if (!error.response) {
            if (error.message.includes('Network Error')) {
                return Promise.reject(new Error('Cannot connect to server. Please check your internet connection.'));
            }
            return Promise.reject(new Error('Server is not responding. Please try again later.'));
        }

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api; 