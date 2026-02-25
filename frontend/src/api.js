import axios from 'axios';


const api = axios.create({
    //baseURL: "http://localhost:8080/",
    baseURL: "https://chdr.cs.ucf.edu/pronunciemos/",
    headers: {
    'Content-Type': 'application/json',
  },
});

export default api
  
