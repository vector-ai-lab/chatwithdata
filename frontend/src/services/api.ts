import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/login', { email, password }),

    signup: (name: string, email: string, password: string) =>
        api.post('/signup', { name, email, password }),

    resetPassword: (email: string) =>
        api.post('/reset-password', { email }),
};

export const chatAPI = {
    getHistory: () =>
        api.get('/get_history'),

    getChat: (id: string) =>
        api.get(`/get_chat?id=${id}`),

    uploadFile: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    deleteAllChats: () =>
        api.post('/delete_all_chats'),

    deleteAccount: () =>
        api.post('/delete_account'),

    archiveChats: () =>
        api.post('/archive_chats'),
};

export default api; 