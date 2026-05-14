// src/api-base.js

import axios from "axios";
import { io } from "socket.io-client";

const baseURL = import.meta.env.MODE === "development"
    ? import.meta.env.VITE_API_DEV_URL
    : import.meta.env.VITE_API_PROD_URL;

const api = axios.create({
    baseURL: `${baseURL}/api`, 
    withCredentials: true,
});

// 🎯 సాకెట్ కనెక్షన్ అప్‌డేట్
export const socket = io(baseURL, {
    withCredentials: true,
    // 💡 ఇక్కడ కేవలం "websocket" నే ఫోర్స్ చేయాలి రాజు
    transports: ["websocket","polling"], 
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;