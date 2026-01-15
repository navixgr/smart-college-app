export default function AdminHeader({ user, onLogout }) {
  // Get first letter for the avatar
  const initial = user?.name?.charAt(0).toUpperCase() || "A";

  return (
    <nav className="navbar nav-admin-pro py-2 mb-4">
      <div className="container-fluid px-3 px-md-4">
        
        {/* Left Side: Profile & Role Info */}
        <div className="d-flex align-items-center">
          <div className="admin-avatar-glow me-3">
            {initial}
          </div>
          <div>
            <h6 className="mb-0 fw-900 text-dark" style={{ letterSpacing: '-0.5px', fontSize: '1rem' }}>
              {user?.name || "Admin"}
            </h6>
            <div className="d-flex align-items-center mt-1">
              <span className="badge bg-primary role-badge-pro me-2">
                {user?.role || "STAFF"}
              </span>
              {user?.role === "CC" && (
                <small className="text-muted fw-bold" style={{ fontSize: '10px' }}>
                   {user?.className}
                </small>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Action Button */}
        <button 
          className="btn-logout-fantastic border-0 d-flex align-items-center" 
          onClick={onLogout}
          style={{ padding: '8px 16px' }}
        >
          <span className="d-none d-sm-inline me-2 fw-800" style={{ fontSize: '0.85rem' }}>EXIT PORTAL</span>
          <i className="bi bi-power fs-5"></i>
        </button>

      </div>
    </nav>
  );
}