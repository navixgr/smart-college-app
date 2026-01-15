export default function Loader({ text = "Authorizing Session..." }) {
  return (
    <div className="loader-wrapper">
      <div className="loader-card-pro shadow-lg">
        {/* Pro Icon Animation */}
        <div className="mb-4 d-inline-block position-relative">
          <div className="spinner-grow text-primary" style={{ width: '3.5rem', height: '3.5rem', opacity: 0.7 }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          {/* Layered secondary pulse for "Fantastic" look */}
          <div className="spinner-grow text-success position-absolute top-0 start-0" 
               style={{ width: '3.5rem', height: '3.5rem', animationDelay: '0.2s', opacity: 0.3 }}>
          </div>
        </div>

        {/* High-Boldness Label */}
        <div className="loader-text-pro mt-2">
          {text}
        </div>

        {/* The Multi-color Snake Bar */}
        <div className="pro-bar-container mt-4">
          <div className="pro-bar-shimmer"></div>
        </div>

        <p className="text-muted extra-small mt-3 fw-bold" style={{ fontSize: '10px', opacity: 0.5 }}>
          SECURE ADMIN ACCESS
        </p>
      </div>
    </div>
  );
}