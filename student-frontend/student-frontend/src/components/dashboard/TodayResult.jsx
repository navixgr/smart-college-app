export default function TodayResult({ today }) {
  if (!today) return null;

  return (
    <div className="result-pro-card shadow-lg">
      <div className="card-body p-4 text-center position-relative" style={{ zIndex: 1 }}>
        {/* Subtle Label */}
        <div className="mb-3">
          <span className="badge rounded-pill bg-primary px-3 py-2 fw-bold small shadow-sm">
            <i className="bi bi-stars me-2"></i>
            TODAY'S PICK
          </span>
        </div>

        {/* Student Name with Pro Styling */}
        <h2 className="winner-name fw-800 mb-2">
          {today.studentName}
        </h2>

        {/* Topic Box */}
        <div className="topic-badge mt-2">
          <p className="mb-0 text-white-50 small fw-bold text-uppercase mb-1" style={{ fontSize: '10px' }}>
            Presentation Topic
          </p>
          <p className="mb-0 text-white fw-medium italic">
            "{today.topic}"
          </p>
        </div>

        {/* Dynamic Detail */}
        <div className="mt-4 opacity-50">
          <small className="text-white extra-small">
            Selected for {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </small>
        </div>
      </div>
    </div>
  );
}