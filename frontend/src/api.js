import axios from 'axios';

const api = axios.create({
    // Dynamically use the Render URL from your build args,
    // with a fallback to the Render backend just in case.
    baseURL: import.meta.env.VITE_API_URL || "https://pronunciemos-latest.onrender.com/pronunciemos/",
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
  