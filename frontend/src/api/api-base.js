// src/api-base.js
import axios from "axios";

// Vite ఆటోమేటిక్ గా మోడ్ ని డిటెక్ట్ చేస్తుంది
const baseURL = import.meta.env.MODE === "development"
    ? import.meta.env.VITE_API_DEV_URL
    : import.meta.env.VITE_API_PROD_URL;

const api = axios.create({
    baseURL: `${baseURL}/api`, // బ్యాకెండ్ లోని /api రూట్ కి కనెక్ట్ అవుతుంది
    withCredentials: true,
});

// ఒకవేళ ఓనర్ లాగిన్ అయితే టోకెన్ ని ఆటోమేటిక్ గా పంపుతుంది
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;