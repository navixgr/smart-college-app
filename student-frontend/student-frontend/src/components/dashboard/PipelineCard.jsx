export default function PipelineCard({ pipeline, isRedZone }) {
  const steps = [
    { label: "Primary (Tomorrow)", data: pipeline?.primary, icon: "bi-person-fill-check", color: "text-primary" },
    { label: "Backup 1", data: pipeline?.backup1, icon: "bi-person-plus", color: "text-success" },
    { label: "Backup 2", data: pipeline?.backup2, icon: "bi-person", color: "text-info" }
  ];

  return (
    <div className={`card border-0 shadow-sm ${isRedZone ? 'bg-danger-subtle' : 'bg-white'}`} style={{ borderRadius: '1.25rem' }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0 d-flex align-items-center">
            <i className={`bi bi-layers-half me-2 ${isRedZone ? 'text-danger' : 'text-primary'}`}></i>
            Selection Pipeline
          </h5>
          {isRedZone && (
            <span className="badge bg-danger animate-pulse">
              <i className="bi bi-exclamation-triangle-fill me-1"></i> FINAL PHASE
            </span>
          )}
        </div>

        <div className="pipeline-steps">
          {steps.map((step, index) => (
            <div key={index} className="d-flex align-items-start mb-4 position-relative">
              {index < 2 && <div className="pipeline-line"></div>}
              <div className={`pipeline-icon-circle ${step.color} shadow-sm bg-white`}>
                <i className={`bi ${step.icon}`}></i>
              </div>
              <div className="ms-3">
                <p className="text-muted extra-small fw-bold text-uppercase mb-1" style={{ fontSize: '10px' }}>
                  {step.label}
                </p>
                <h6 className="fw-bold mb-0 text-dark">{step.data?.name || "Assigning..."}</h6>
                <small className="text-muted italic">"{step.data?.topic || "Topic not entered yet"}"</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}