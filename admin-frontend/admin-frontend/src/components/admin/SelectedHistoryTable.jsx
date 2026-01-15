import { useState } from "react";

export default function SelectedHistoryTable({ data, onExport }) {
  // 1. Setup the state for showing more
  const [showAll, setShowAll] = useState(false);
  const limit = 5;
  const hasMore = data.length > limit;
  
  // 2. Slice the data for the initial view
  const displayedData = showAll ? data : data.slice(0, limit);

  return (
    <div className="card border-0 shadow-sm mb-4 overflow-hidden" style={{ borderRadius: '24px' }}>
      {/* Fantastic Header */}
      <div className="card-header bg-white py-4 px-4 d-flex justify-content-between align-items-center border-0">
        <div>
          <h5 className="mb-0 fw-900 text-dark" style={{ letterSpacing: '-0.5px' }}>
            Selection History
          </h5>
          <small className="text-muted fw-bold uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>
            Recent Records ({data.length})
          </small>
        </div>
        <button 
          className="btn-logout-pro border-0" 
          onClick={onExport} 
          disabled={data.length === 0}
          style={{ background: 'rgba(66, 133, 244, 0.1)', color: '#4285F4', padding: '8px 16px' }}
        >
          <i className="bi bi-download me-2"></i>Export
        </button>
      </div>

      <div className="card-body p-0">
        {data.length === 0 ? (
          <div className="p-5 text-center">
             <i className="bi bi-stack text-light fs-1 d-block mb-2"></i>
             <p className="text-muted small fw-bold">No records available yet</p>
          </div>
        ) : (
          <>
            <div className="history-feed">
              {displayedData.map((row, idx) => {
                const initial = row.studentName?.charAt(0) || "?";
                
                return (
                  <div key={idx} className="history-row-pro p-3 px-4 d-flex align-items-center border-bottom">
                    <div className="student-initial-avatar me-3 d-none d-sm-flex">
                      {initial}
                    </div>
                    
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-900 text-dark" style={{ fontSize: '1.05rem' }}>
                          {row.studentName}
                        </span>
                        <span style={{ color: '#0d6efd', fontSize: '0.75rem', fontWeight: '900' }}>
                          {row.date}
                        </span>
                      </div>
                      
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <span className="badge bg-light text-primary border fw-bold" style={{ fontSize: '10px' }}>
                          {row.className}
                        </span>
                        <span className="topic-pill text-truncate" style={{ maxWidth: '250px' }}>
                           {row.topic || "No Topic Set"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3. The Fantastic See More Button */}
            {hasMore && (
              <div className="p-3 text-center border-top bg-light-subtle">
                <button 
                  className="btn btn-link text-primary fw-900 text-decoration-none small w-100"
                  onClick={() => setShowAll(!showAll)}
                  style={{ letterSpacing: '1px', fontSize: '0.8rem' }}
                >
                  {showAll ? (
                    <><i className="bi bi-chevron-up me-2"></i>COLLAPSE LOG</>
                  ) : (
                    <>VIEW ALL ({data.length - limit} MORE) <i className="bi bi-chevron-down ms-2"></i></>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}