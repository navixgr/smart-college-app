export default function Loader({ text = "Please wait..." }) {
  return (
    <div className="container-fluid d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      {/* Mobile-optimized Column */}
      <div className="col-10 col-sm-6 col-md-4 text-center">
        
        <div className="loader-card p-5 shadow-lg">
          {/* Top Notch Icon Animation */}
          <div className="mb-4 d-inline-block position-relative">
             <div className="spinner-grow text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
             </div>
             {/* Secondary accent pulse */}
             <div className="spinner-grow text-success position-absolute top-0 start-0" 
                  style={{ width: '3rem', height: '3rem', animationDelay: '0.2s', opacity: 0.5 }}>
             </div>
          </div>

          <h5 className="fw-bold text-dark mb-3 pulse-text">{text}</h5>

          {/* Custom "Snake" Progress Bar */}
          <div className="d-flex justify-content-center">
            <div className="pro-progress-container">
              <div className="pro-progress-bar"></div>
            </div>
          </div>

          <p className="mt-4 text-muted small fw-medium">
            Optimizing for your device...
          </p>
        </div>
        
      </div>
    </div>
  );
}