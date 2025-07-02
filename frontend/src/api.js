import axios from 'axios';


const api = axios.create({
    //baseURL: "http://localhost:8080/",
    baseURL: "https://spanish-pronunciation-pro-894004914288.us-east1.run.app/",
    headers: {
    'Content-Type': 'application/json',
  },
});

export default api
