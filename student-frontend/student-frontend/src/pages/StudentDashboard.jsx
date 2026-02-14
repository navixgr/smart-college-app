import { useEffect, useState } from "react";
import API from "../services/api";

import Loader from "../components/common/Loader";
import ProfileCard from "../components/dashboard/ProfileCard";
import BookingCard from "../components/dashboard/BookingCard";
import TodayResult from "../components/dashboard/TodayResult";
import HistoryList from "../components/dashboard/HistoryList";
import Navbar from "../components/common/Navbar";
import PipelineCard from "../components/dashboard/PipelineCard";

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null); // ✅ Moved to top level

  // 1. Fetch Dashboard Data
  useEffect(() => {
    API.get("/student/dashboard")
      .then(res => setData(res.data))
      .catch(() => setData(null));
  }, []);

  // 2. Listen for Install Prompt (PWA)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  if (!data) return <Loader />;

  // logic for Red Zone
  const redZoneStyle = data.isRedZone 
    ? { backgroundColor: '#474141', minHeight: '100vh', transition: 'all 0.5s ease' } 
    : { minHeight: '100vh' };

  /* =========================
     HANDLERS
  ========================= */
  
  const subscribeToNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert("Please allow notifications to get daily updates!");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
      });

      await API.post('/students/subscribe', subscription);
      alert("You're all set! You'll get alerts when it's your turn.");
    } catch (err) {
      console.error("Subscription error:", err);
      alert("Failed to subscribe. Make sure you are using a secure (HTTPS) connection.");
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);
    setDeferredPrompt(null);
  };

  return (
    <div style={redZoneStyle}>
      <Navbar user={data.user} />
      <div className="container py-5" style={{ maxWidth: '1000px' }}>

        {/* Stay Updated Card */}
        {('serviceWorker' in navigator) && (
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body p-4 text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="fw-bold mb-1">Stay Updated!</h5>
                  <p className="small mb-0 opacity-75">Get alerts for your turn even when the app is closed.</p>
                </div>
                <div className="d-flex gap-2">
                  <button 
                    onClick={subscribeToNotifications} 
                    className="btn btn-light fw-bold rounded-pill px-4 shadow-sm"
                  >
                    Enable Alerts
                  </button>

                  {/* ✅ Shows "Download App" inside the colored card if available */}
                  {deferredPrompt && (
                    <button 
                      onClick={handleInstallClick} 
                      className="btn btn-outline-light fw-bold rounded-pill px-4 shadow-sm"
                    >
                      Download App
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="row mb-4">
          <div className="col-12">
            <ProfileCard user={data.user} />
          </div>
        </div>

        <div className="row g-4">
          <div className="col-md-6 col-lg-7">
            <div className="d-grid gap-4">
              <PipelineCard pipeline={data.pipeline} isRedZone={data.isRedZone} />
              <BookingCard bookingStatus={data.bookingStatus} isRedZone={data.isRedZone} />
              <TodayResult today={data.today} />
            </div>
          </div>
          <div className="col-md-6 col-lg-5">
            <HistoryList history={data.history} />
          </div>
        </div>
      </div>
    </div>
  );
}