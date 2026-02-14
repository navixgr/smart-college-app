import { useEffect, useState } from "react";
import API from "../services/api";

import Loader from "../components/common/Loader";
import ProfileCard from "../components/dashboard/ProfileCard";
import BookingCard from "../components/dashboard/BookingCard";
import TodayResult from "../components/dashboard/TodayResult";
import HistoryList from "../components/dashboard/HistoryList";
import Navbar from "../components/common/Navbar";
import PipelineCard from "../components/dashboard/PipelineCard"; // ✅ Added

export default function StudentDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/student/dashboard")
      .then(res => setData(res.data))
      .catch(() => setData(null));
  }, []);

  if (!data) return <Loader />;

  // Dynamic background style for Red Zone
  const redZoneStyle = data.isRedZone 
    ? { backgroundColor: '#474141', minHeight: '100vh', transition: 'all 0.5s ease' } 
    : { minHeight: '100vh' };

    const subscribeToNotifications = async () => {
  try {
    // 1. Request permission from the browser
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert("Please allow notifications to get daily updates!");
      return;
    }

    // 2. Get the Service Worker registration
    const registration = await navigator.serviceWorker.ready;

    // 3. Create the subscription using the VITE environment variable
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY // ✅ Automatically pulls from .env
    });

    // 4. Send this to your backend route
    await API.post('/students/subscribe', subscription);
    alert("You're all set! You'll get alerts when it's your turn.");
    
  } catch (err) {
    console.error("Subscription error:", err);
    alert("Failed to subscribe. Make sure you are using a secure (HTTPS) connection.");
  }
};

  return (
    <div style={redZoneStyle}>
      <Navbar user={data.user} />
      <div className="container py-5" style={{ maxWidth: '1000px' }}>

                {/* Add this inside your return() block in StudentDashboard.jsx */}
{('serviceWorker' in navigator) && (
  <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
    <div className="card-body p-4 text-white">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="fw-bold mb-1">Stay Updated!</h5>
          <p className="small mb-0 opacity-75">Get alerts for your turn even when the app is closed.</p>
        </div>
        <button 
          onClick={subscribeToNotifications} 
          className="btn btn-light fw-bold rounded-pill px-4 shadow-sm"
        >
          Enable Alerts
        </button>
      </div>
    </div>
  </div>
)}
        
        {/* 1. Profile Header */}
        <div className="row mb-4">
          <div className="col-12">
            <ProfileCard user={data.user} />
          </div>
        </div>

        <div className="row g-4">
          {/* 2. Left Column: Selection Pipeline & Booking */}
          <div className="col-md-6 col-lg-7">
            <div className="d-grid gap-4">
              <PipelineCard pipeline={data.pipeline} isRedZone={data.isRedZone} />
              <BookingCard bookingStatus={data.bookingStatus} isRedZone={data.isRedZone} />
              <TodayResult today={data.today} />
            </div>
          </div>

          {/* 3. Right Column: History */}
          <div className="col-md-6 col-lg-5">
            <HistoryList history={data.history} />
          </div>
        </div>
      </div>
    </div>
  );
}