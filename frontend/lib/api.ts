import axios from 'axios';

// L'adresse de ton backend Django
const API_URL = 'http://127.0.0.1:8000/api/';

const api = axios.create({
  baseURL: API_URL,
});

export default api;