export default function PipelineMonitor({ data }) {
  const { pipeline, isRedZone, remainingCount } = data;

  return (
    <div className={`card border-0 shadow-sm ${isRedZone ? 'border-start border-danger border-4' : ''}`} style={{ borderRadius: '20px' }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-900 text-dark mb-0">Live Pipeline</h5>
          <span className={`badge ${isRedZone ? 'bg-danger' : 'bg-primary'}`}>
             {remainingCount} Students Left
          </span>
        </div>

        <div className="row text-center">
          <div className="col-4 border-end">
            <small className="text-muted fw-bold d-block mb-1">PRIMARY</small>
            <div className="fw-800 text-primary text-truncate">{pipeline.primary?.name || "None"}</div>
          </div>
          <div className="col-4 border-end">
            <small className="text-muted fw-bold d-block mb-1">BACKUP 1</small>
            <div className="fw-800 text-dark text-truncate">{pipeline.backup1?.name || "None"}</div>
          </div>
          <div className="col-4">
            <small className="text-muted fw-bold d-block mb-1">BACKUP 2</small>
            <div className="fw-800 text-dark text-truncate">{pipeline.backup2?.name || "None"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}