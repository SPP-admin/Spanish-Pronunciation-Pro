import axios from 'axios';


// The CHDR Backend (handles Gemini, Stats, Auth)
export const api = axios.create({
    //baseURL: "http://localhost:8080/",
    baseURL: "https://chdr.cs.ucf.edu/pronunciemos/",
    headers: { 'Content-Type': 'application/json' },
});

// The Render Bridge (handles Azure)
export const renderBridge = axios.create({
    //baseURL: "http://localhost:8000/",
    baseURL: "https://pronunciemos-azure-bridge.onrender.com",
    headers: { 'Content-Type': 'application/json' },
});

export default api;



  