export default function ProfileCard({ user }) {
  // Helper to ensure data is never empty (prevents card shrinking)
  const displayValue = (val) => val !== undefined && val !== null ? val : "--";

  return (
    <div className="profile-pro-card shadow-sm border-0">
      <div className="card-body p-4">
        {/* Simplified Header */}
        <div className="mb-4">
          <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>
            Welcome Back,
          </span>
          <h2 className="text-dark fw-bold mb-0 mt-1" style={{ letterSpacing: '-0.5px' }}>
            {displayValue(user.name)}
          </h2>
        </div>

        {/* Symmetric 2x2 Grid */}
        <div className="row g-3">
          <div className="col-6">
            <div className="stat-box-fixed">
              <span className="stat-label mb-1">Class</span>
              <span className="stat-value-pro text-primary">
                {displayValue(user.className)}
              </span>
            </div>
          </div>
          
          <div className="col-6">
            <div className="stat-box-fixed">
              <span className="stat-label mb-1">Counter</span>
              <div className="d-flex align-items-center">
                <span className="status-dot bg-warning"></span>
                <span className="stat-value-pro">
                  {displayValue(user.counter)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="col-6">
            <div className="stat-box-fixed">
              <span className="stat-label mb-1">Missed</span>
              <span className="stat-value-pro text-danger">
                {displayValue(user.missedDays)} Days
              </span>
            </div>
          </div>
          
          <div className="col-6">
            <div className="stat-box-fixed">
              <span className="stat-label mb-1">Fine</span>
              <span className="stat-value-pro text-success">
                ₹{displayValue(user.totalFine)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}