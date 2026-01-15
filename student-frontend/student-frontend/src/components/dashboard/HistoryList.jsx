import { useState } from "react";

export default function HistoryList({ history }) {
  const [showAll, setShowAll] = useState(false);

  const limit = 3;
  const hasMore = history.length > limit;
  const displayedHistory = showAll ? history : history.slice(0, limit);

  return (
    <div className="history-container shadow-sm border-0">
      <div className="p-4 border-bottom bg-white sticky-top z-3">
        <h5 className="card-title fw-bold mb-0 text-dark d-flex align-items-center">
          <i className="bi bi-clock-history me-2 text-primary"></i>
          Recent Selections
        </h5>
      </div>

      <div className="p-3">
        {history.length === 0 ? (
          <div className="p-5 text-center">
            <i className="bi bi-calendar2-x text-muted fs-1 d-block mb-2"></i>
            <p className="text-muted small fw-medium">No history recorded yet</p>
          </div>
        ) : (
          <div className="timeline-wrapper">
            {displayedHistory.map((h, i) => (
              <div key={i} className="timeline-item pb-4">
                <div className="timeline-node"></div>
                
                <div className="d-flex flex-column">
                  <div className="mb-1">
                    {/* Date changed to Blue via inline style */}
                    <span 
                      className="history-date-badge" 
                      style={{ color: '#0d6efd', backgroundColor: 'rgba(13, 110, 253, 0.1)', fontWeight: '800' }}
                    >
                      {h.date}
                    </span>
                  </div>
                  
                  {/* Name made more visible with extra bold weight and larger size */}
                  <div 
                    style={{ 
                      letterSpacing: '-0.3px', 
                      fontWeight: '600', 
                      fontSize: '1.1rem', 
                      color: '#1a1c1e' 
                    }}
                  >
                    {h.studentName}
                  </div>
                  
                  <div className="text-muted small mt-1 italic">
                    <i className="bi bi-chat-left-quote me-1 opacity-30"></i>
                    {h.topic}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-2 pb-2">
            <button 
              className="btn btn-link text-primary fw-bold text-decoration-none small"
              onClick={() => setShowAll(!showAll)}
              style={{ fontSize: '0.85rem' }}
            >
              {showAll ? (
                <>SHOW LESS <i className="bi bi-chevron-up ms-1"></i></>
              ) : (
                <>SEE MORE ({history.length - limit} MORE) <i className="bi bi-chevron-down ms-1"></i></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}