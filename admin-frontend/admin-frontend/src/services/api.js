import axios from "axios";

const API = axios.create({
  baseURL: "https://smart-college-app.onrender.com/api"
});

/*
Attach admin token automatically.
Used for:
- /admin/profile
- /admin/reports/*
- /holidays
- /students/status/:studentId (New status toggle)
*/
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;