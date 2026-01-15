export default function FineReportTable({ data, role, onExport }) {
  if (!data) return null;

  // Formatting currency for a Pro look
  const formatFine = (amount) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <div className="report-card-pro border-0 shadow-sm mb-4">
      {/* Glass Header */}
      <div className="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center border-bottom">
        <div>
          <h5 className="mb-0 fw-900 text-dark" style={{ letterSpacing: '-0.5px' }}>
            Fine Report 
          </h5>
          <small className="text-primary fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '1px' }}>
            {role === "CC" ? "Class Overview" : "Department-wise Summary"}
          </small>
        </div>
        {/* <button className="btn-logout-pro border-0" onClick={onExport} style={{ background: 'rgba(52, 168, 83, 0.1)', color: '#34A853' }}>
          <i className="bi bi-file-earmark-excel-fill me-2"></i> Export
        </button> */}
      </div>
      
      <div className="card-body p-0">
        {role === "CC" ? (
          /* CC TABLE VIEW - CLEAN & BOLD */
          <div className="table-responsive">
            <table className="table table-pro table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th className="ps-4">Student Name</th>
                  <th>Missed</th>
                  <th className="text-end pe-4">Total Fine</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx}>
                    <td className="ps-4">
                      <div className="student-name-pro">{row.studentName}</div>
                      <small className="text-muted fw-bold">{row.className}</small>
                    </td>
                    <td>
                        <span className="badge bg-light text-dark fw-800 rounded-pill px-3">
                            {row.daysMissed} Days
                        </span>
                    </td>
                    <td className="text-end pe-4">
                      <span className="fine-text-pro">{formatFine(row.totalFine)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* SUPER/HOD ACCORDION VIEW */
          <div className="accordion accordion-flush" id="fineAccordion">
            {Object.entries(data).map(([className, rows], index) => (
              <div className="accordion-item border-bottom" key={className}>
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed py-4 px-4" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${index}`}>
                    <div className="d-flex justify-content-between w-100 align-items-center me-3">
                        <span className="fw-900 text-dark">{className}</span>
                        <span className="badge-glass fw-bold text-primary" style={{fontSize: '11px'}}>
                            {rows.length} STUDENTS
                        </span>
                    </div>
                  </button>
                </h2>
                <div id={`collapse${index}`} className="accordion-collapse collapse" data-bs-parent="#fineAccordion">
                  <div className="accordion-body p-0 bg-light">
                    <table className="table table-pro table-sm table-hover mb-0">
                      <thead>
                        <tr>
                          <th className="ps-4">Student</th>
                          <th className="text-center">Days</th>
                          <th className="text-end pe-4">Fine</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, idx) => (
                          <tr key={idx} className="bg-white">
                            <td className="ps-4 pe-0 py-3 fw-800 text-dark">{row.studentName}</td>
                            <td className="text-center py-3 fw-bold">{row.daysMissed}</td>
                            <td className="text-end pe-4 py-3">
                                <span className="fw-900 text-danger">{formatFine(row.totalFine)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}