import { useState } from 'react';
import API from '../services/api';
import ErrorMessage from '../components/common/ErrorMessage';

export default function Login() {
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Enhanced numeric helper with length limit
  const handleNumericInput = (e, setter, limit) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (limit && value.length > limit) return; // Stops the user at the limit
    setter(value);
  };

  const handleLogin = async () => {
    if (regNo.length < 5 || password.length !== 4) {
      setError("Enter a valid Reg No and 4-digit PIN");
      return;
    }
    try {
      const res = await API.post('/auth/login', { regNo, password });
      localStorage.setItem('token', res.data.token);
      window.location.replace('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center bg-light" style={{ minHeight: '100vh' }}>
      <div className="col-11 col-sm-8 col-md-6 col-lg-4">
        
        <div className="pro-login-container shadow-lg">
          <div className="pro-card-inner p-4 p-sm-5">
            <div className="text-center mb-4">
              <h2 className="fw-bold text-dark mb-1">Student Portal</h2>
              <p className="text-muted small">Only numeric inputs allowed</p>
            </div>
            
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">Register Number</label>
              <input
                type="text"
                inputMode="numeric"
                className="form-control form-control-lg bg-light border-0"
                placeholder="EX: 620122104XXX"
                value={regNo}
                onChange={(e) => handleNumericInput(e, setRegNo, 12)} // Example limit of 12
                style={{ borderRadius: '12px', fontSize: '1rem' }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-secondary">Security PIN (4 Digits)</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  inputMode="numeric"
                  className="form-control form-control-lg bg-light border-0"
                  placeholder="XXXX"
                  value={password}
                  onChange={(e) => handleNumericInput(e, setPassword, 4)} // STOPS AT EXACTLY 4
                  style={{ borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', fontSize: '1rem' }}
                />
                <span 
                  className="input-group-text bg-light border-0" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ borderTopRightRadius: '12px', borderBottomRightRadius: '12px', cursor: 'pointer' }}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-secondary`}></i>
                </span>
              </div>
            </div>

            <div className="d-grid">
              <button 
                className="btn btn-pro btn-lg py-3 shadow" 
                onClick={handleLogin}
                style={{ borderRadius: '12px', fontWeight: '700', letterSpacing: '0.5px' }}
              >
                Sign In
              </button>
            </div>

            {error && (
              <div className="mt-4 text-center">
                <ErrorMessage message={error} />
              </div>
            )}
          </div>
        </div>
        <p className="text-center mt-4 text-muted small">© 2026 /navixgr</p>
      </div>
    </div>
  );
}