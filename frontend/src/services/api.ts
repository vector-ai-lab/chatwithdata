import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),

    signup: (email: string, password: string) =>
        api.post('/auth/signup', { email, password }),

    resetPassword: (email: string) =>
        api.post('/auth/reset-password', { email }),

    verifyResetToken: (token: string) =>
        api.post('/auth/verify-reset-token', { token }),

    updatePassword: (token: string, newPassword: string) =>
        api.post('/auth/update-password', { token, newPassword }),
};

export const chatAPI = {
    getHistory: () =>
        api.get('/chat/history'),

    getChat: (id: string) =>
        api.get(`/chat/${id}`),

    uploadFile: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/chat/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    deleteAllChats: () =>
        api.post('/chat/delete-all'),

    deleteAccount: () =>
        api.post('/auth/delete-account'),

    archiveChats: () =>
        api.post('/chat/archive-all'),

    updateChatTitle: (chatId: string, title: string) =>
        api.put(`/chat/${chatId}/title`, { title }),

    deleteChat: (chatId: string) =>
        api.delete(`/chat/${chatId}`),

    archiveChat: (chatId: string) =>
        api.post(`/chat/${chatId}/archive`),
};

export default api; 