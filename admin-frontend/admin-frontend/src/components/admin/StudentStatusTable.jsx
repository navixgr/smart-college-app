import { useState } from "react";

export default function StudentStatusTable({ students, onToggle }) {
  // 1. Setup state to handle the toggle
  const [showAll, setShowAll] = useState(false);
  const limit = 5;
  const hasMore = students.length > limit;
  
  // 2. Filter students based on the "showAll" state
  const displayedStudents = showAll ? students : students.slice(0, limit);

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: '20px' }}>
      <div className="card-header bg-white border-0 py-4 px-4 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="fw-900 text-dark mb-0">Student Attendance</h5>
          <small className="text-muted fw-bold">Toggle 'Long Absent' to skip in selection</small>
        </div>
        <span className="badge bg-light text-dark fw-bold border">
          Total: {students.length}
        </span>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light">
            <tr>
              <th className="ps-4">Student</th>
              <th className="text-center">Status</th>
              <th className="text-end pe-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedStudents.map(s => (
              <tr key={s._id}>
                <td className="ps-4">
                  <div className="fw-bold">{s.name}</div>
                  <small className="text-muted">{s.regNo}</small>
                </td>
                <td className="text-center">
                  <span className={`badge ${s.isSelectedInCurrentCycle ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                    {s.isSelectedInCurrentCycle ? 'Completed' : 'Pending'}
                  </span>
                </td>
                <td className="text-end pe-4">
                  <div className="form-check form-switch d-inline-block">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      checked={s.isLongAbsent} 
                      onChange={() => onToggle(s._id, s.isLongAbsent)}
                    />
                    <label className="small fw-bold text-danger ms-2">Long Absent</label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. The View More / Collapse Button */}
      {hasMore && (
        <div className="p-3 text-center border-top bg-light-subtle">
          <button 
            className="btn btn-link text-primary fw-900 text-decoration-none small w-100"
            onClick={() => setShowAll(!showAll)}
            style={{ letterSpacing: '1px', fontSize: '0.8rem' }}
          >
            {showAll ? (
              <><i className="bi bi-chevron-up me-2"></i>COLLAPSE LIST</>
            ) : (
              <>VIEW ALL ({students.length - limit} MORE) <i className="bi bi-chevron-down ms-2"></i></>
            )}
          </button>
        </div>
      )}
    </div>
  );
}