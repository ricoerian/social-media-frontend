import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_GOLANG_API_BASE_URL, // ganti sesuai backend URL
});

// Tambahkan interceptor untuk menyertakan token, jika diperlukan
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
