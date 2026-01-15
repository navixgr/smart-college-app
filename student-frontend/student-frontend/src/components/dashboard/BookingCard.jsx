import { useState } from "react";
import API from "../../services/api";

export default function BookingCard({ bookingStatus }) {
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

  const canBook = bookingStatus?.canBook;

  return (
    <div className="booking-pro-card shadow-lg border-0 h-100">
      <div className="card-body p-4">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.5px' }}>
            Book Your Session
          </h5>
          <span className="badge-glass">
            <span className={`status-indicator ${canBook ? 'text-success bg-success' : 'text-danger bg-danger'}`}></span>
            {canBook ? 'Available' : 'Closed'}
          </span>
        </div>

        {!canBook ? (
          /* "Pro" Error State for Disabled Booking */
          <div className="p-4 text-center bg-danger-subtle rounded-4 border border-danger-subtle">
            <i className="bi bi-lock-fill text-danger fs-3 d-block mb-2"></i>
            <p className="text-danger small fw-bold mb-0">
              {bookingStatus?.reason || "Booking is currently disabled"}
            </p>
          </div>
        ) : (
          /* Modern Input Area */
          <div className="d-grid gap-3">
            <div className="position-relative">
              <input
                className="form-control input-minimal"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What will you teach today?"
              />
            </div>
            
            <button 
              className="btn btn-pro py-3 shadow-sm" 
              onClick={handleBooking}
            >
              Confirm Booking
              <i className="bi bi-arrow-right-short ms-2 fs-5"></i>
            </button>
          </div>
        )}

        {/* Dynamic Feedback Message */}
        {message && (
          <div className={`mt-3 p-2 rounded-3 small text-center fw-bold animate-pulse ${
            message.toLowerCase().includes('success') ? 'text-success bg-success-subtle' : 'text-info bg-info-subtle'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}