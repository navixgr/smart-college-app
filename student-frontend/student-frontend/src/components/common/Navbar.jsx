export default function Navbar({ user }) {
  // Function to get a unique color based on user name
  const getAvatarColor = (name) => {
    const colors = ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#9C27B0', '#00BCD4'];
    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    window.location.replace("/");
  };

  // Improved initial logic
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '';
  const avatarBg = getAvatarColor(user?.name);

  return (
    <nav className="navbar navbar-expand-lg navbar-light nav-pro sticky-top py-2">
      <div className="container-fluid px-3 px-sm-4">
        <a className="navbar-brand fw-bold d-flex align-items-center text-dark" href="/dashboard">
          <i className="bi bi-lightning-charge-fill text-primary me-2"></i>
          <span style={{ letterSpacing: '-0.5px' }}>COTD</span>
        </a>

        <div className="d-flex align-items-center">
          {/* Only show profile bubble if initial exists */}
          {userInitial && (
            <div 
              className="nav-profile-img me-2 shadow-sm" 
              style={{ backgroundColor: avatarBg, transition: 'background 0.5s ease' }}
            >
              {userInitial}
            </div>
          )}
          
          <div className="d-none d-sm-block me-3">
             <small className="text-muted d-block" style={{ fontSize: '10px', lineHeight: '1' }}>Logged in as</small>
             <span className="fw-bold text-dark small">{user?.name || 'Loading...'}</span>
          </div>

          {/* Fantastic Logout Button */}
          <button 
            className="btn-logout-fantastic" 
            onClick={handleLogout}
          >
            <span>Logout</span>
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </nav>
  );
}