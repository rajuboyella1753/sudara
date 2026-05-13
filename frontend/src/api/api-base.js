// src/api-base.js
import axios from "axios";
import { io } from "socket.io-client"; // 🎯 1. సాకెట్ ని ఇంపోర్ట్ చెయ్

// Vite ఆటోమేటిక్ గా మోడ్ ని డిటెక్ట్ చేస్తుంది
const baseURL = import.meta.env.MODE === "development"
    ? import.meta.env.VITE_API_DEV_URL
    : import.meta.env.VITE_API_PROD_URL;

const api = axios.create({
    baseURL: `${baseURL}/api`, 
    withCredentials: true,
});

// 🎯 2. సాకెట్ కనెక్షన్ ఇక్కడ పెట్టు రాజు
// baseURL లో చివర /api ఉంటుంది కాబట్టి, సాకెట్ కి మాత్రం కేవలం baseURL ఇస్తే చాలు
export const socket = io(baseURL, {
    withCredentials: true,
    transports: ["polling", "websocket"]
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;