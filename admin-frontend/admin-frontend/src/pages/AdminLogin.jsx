import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please fill all fields");
      return;
    }
    try {
      // Replace with your actual API URL
      const res = await axios.post("https://smart-college-app.onrender.com/api/admin/auth/login", { username, password });
      localStorage.setItem("adminToken", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center bg-light min-vh-100">
      <div className="col-11 col-sm-8 col-md-6 col-lg-4">
        <div className="pro-login-container">
          <div className="pro-card-inner p-4 p-sm-5">
            <div className="text-center mb-4">
              <div className="d-inline-block p-3 rounded-circle mb-3 shadow-sm" style={{ background: 'rgba(66, 133, 244, 0.1)' }}>
                <i className="bi bi-shield-lock-fill text-primary fs-2"></i>
              </div>
              <h2 style={{ fontWeight: '900', letterSpacing: '-1.5px' }}>ADMIN</h2>
              <p className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '2px' }}>Secure Portal</p>
            </div>

            <div className="mb-3">
              <label style={{ color: '#0d6efd', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Username</label>
              <input
                type="text"
                className="form-control form-control-lg bg-light border-0"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ borderRadius: '12px', fontWeight: '600' }}
              />
            </div>

            <div className="mb-4">
              <label style={{ color: '#0d6efd', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control form-control-lg bg-light border-0"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', fontWeight: '600' }}
                />
                <span className="input-group-text bg-light border-0" onClick={() => setShowPassword(!showPassword)} style={{ borderTopRightRadius: '12px', borderBottomRightRadius: '12px', cursor: 'pointer' }}>
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </span>
              </div>
            </div>

            <button className="btn btn-pro w-100 py-3 mb-3 shadow" onClick={handleLogin}>
              AUTHORIZE & ENTER
            </button>

            {error && (
              <div className="error-pro p-2 text-center small fw-bold">
                <i className="bi bi-exclamation-octagon-fill me-2"></i> {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}