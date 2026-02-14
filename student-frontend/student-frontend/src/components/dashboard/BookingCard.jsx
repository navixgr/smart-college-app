import { useState } from "react";
import API from "../../services/api";

export default function BookingCard({ bookingStatus, isRedZone }) {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");

  const handleBooking = async () => {
    if (!topic.trim()) {
      setMessage("Please enter a topic first");
      return;
    }
    try {
      const res = await API.post("/bookings/book", { topic });
      setMessage(res.data.message);
      setTopic("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Booking failed");
    }
  };

  // Logic: In Red Zone, the 45-minute window is ignored by the backend
  const canBook = isRedZone || bookingStatus?.canBook;

  return (
    <div className={`booking-pro-card shadow-lg border-0 h-100 ${isRedZone ? 'border-danger' : ''}`}>
      <div className="card-body p-4">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold text-dark mb-0">
            {isRedZone ? 'Final Phase: Topic Entry' : 'Book Your Session'}
          </h5>
          <span className="badge-glass">
            <span className={`status-indicator ${canBook ? 'text-success bg-success' : 'text-danger bg-danger'}`}></span>
            {canBook ? 'Available' : 'Closed'}
          </span>
        </div>

        {/* Red Zone Instruction */}
        {isRedZone && canBook && (
          <div className="alert alert-danger p-2 small mb-3 border-0 rounded-3">
            <i className="bi bi-info-circle-fill me-2"></i>
            You are in the final 10. Enter your topic anytime!
          </div>
        )}

        {!canBook ? (
          <div className="p-4 text-center bg-danger-subtle rounded-4 border border-danger-subtle">
            <i className="bi bi-lock-fill text-danger fs-3 d-block mb-2"></i>
            <p className="text-danger small fw-bold mb-0">
              {bookingStatus?.reason || "Booking is currently disabled"}
            </p>
          </div>
        ) : (
          <div className="d-grid gap-3">
            <div className="position-relative">
              <input
                className="form-control input-minimal"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={isRedZone ? "Update your presentation topic" : "What will you teach?"}
              />
            </div>
            
            <button 
              className={`btn ${isRedZone ? 'btn-danger' : 'btn-pro'} py-3 shadow-sm`} 
              onClick={handleBooking}
            >
              {isRedZone ? 'Update Topic' : 'Confirm Booking'}
              <i className="bi bi-check-circle-fill ms-2"></i>
            </button>
          </div>
        )}

        {message && (
          <div className={`mt-3 p-2 rounded-3 small text-center fw-bold ${
            message.toLowerCase().includes('success') ? 'text-success bg-success-subtle' : 'text-info bg-info-subtle'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}