export default function HolidayControl({ user, handleAddHoliday, holidayDate, setHolidayDate, message }) {
  const isError = message && message.toLowerCase().includes("failed");

  return (
    <div className="holiday-pro-card border-0 shadow-sm mb-4">
      <div className="card-body p-4">
        {/* Header with High-Boldness Typography */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0 fw-900 text-dark d-flex align-items-center" style={{ letterSpacing: '-0.5px' }}>
            <i className="bi bi-calendar-check-fill me-2 text-warning"></i>
            Manage Holidays
          </h5>
          <span className="badge-glass text-warning fw-bold" style={{ fontSize: '10px' }}>
             SYSTEM
          </span>
        </div>

        <div className="d-flex flex-column gap-3">
          {/* Pro Date Picker */}
          <div className="form-floating">
            <input
              type="date"
              className="form-control date-input-pro"
              id="holidayDateInput"
              value={holidayDate}
              onChange={(e) => setHolidayDate(e.target.value)}
              style={{ height: '65px' }}
            />
            <label htmlFor="holidayDateInput" className="fw-bold text-muted small uppercase">
                Effective Date
            </label>
          </div>

          <button 
            className="btn-mark-pro py-3 w-100 shadow-sm d-flex align-items-center justify-content-center" 
            onClick={handleAddHoliday}
          >
            <i className="bi bi-plus-circle-fill me-2"></i>
            Mark Holiday
          </button>
        </div>

        {/* Pro Status Message */}
        {message && (
          <div className={`mt-3 p-3 rounded-4 animate-pulse d-flex align-items-center justify-content-center gap-2 ${
            isError ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'
          }`} style={{ border: '1px solid currentColor', opacity: 0.9 }}>
            <i className={`bi ${isError ? 'bi-x-circle-fill' : 'bi-check-circle-fill'} fs-6`}></i>
            <small className="fw-900 text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                {message}
            </small>
          </div>
        )}

        <div className="mt-4 pt-3 border-top">
            <p className="extra-small text-muted fw-bold mb-0" style={{ fontSize: '10px' }}>
                <i className="bi bi-info-circle me-1"></i>
                This will skip fine generation for 
                <span className="text-dark ms-1">
                    {user?.role === 'CC' ? `Class ${user?.className}` : 'All Classes'}
                </span>
            </p>
        </div>
      </div>
    </div>
  );
}