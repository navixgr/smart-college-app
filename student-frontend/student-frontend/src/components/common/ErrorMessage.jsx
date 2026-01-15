export default function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className="error-pro py-2 px-3 d-inline-flex align-items-center gap-2" role="alert">
      <i className="bi bi-exclamation-octagon-fill"></i>
      <small className="fw-bold" style={{ fontSize: '0.85rem' }}>{message}</small>
    </div>
  );
}