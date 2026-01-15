// services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

/*
Attach admin token automatically.
Used for:
- /admin/profile
- /admin/reports/*
- /holidays
*/
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
