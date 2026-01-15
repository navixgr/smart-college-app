import { useEffect, useState } from "react";
import API from "../services/api";

import Loader from "../components/common/Loader";
import ProfileCard from "../components/dashboard/ProfileCard";
import BookingCard from "../components/dashboard/BookingCard";
import TodayResult from "../components/dashboard/TodayResult";
import HistoryList from "../components/dashboard/HistoryList";
import Navbar from "../components/common/Navbar";

export default function StudentDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/student/dashboard")
      .then(res => setData(res.data))
      .catch(() => setData(null));
  }, []);

  if (!data) return <Loader />;

  return (
    <div className="container py-5" style={{ maxWidth: '1000px' }}>
      <Navbar />
      {/* 1. Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <ProfileCard user={data.user} />
        </div>
      </div>

      <div className="row g-4">
        {/* 2. Left Column: Booking and Result */}
        <div className="col-md-6 col-lg-7">
          <div className="d-grid gap-4">
            <BookingCard bookingStatus={data.bookingStatus} />
            <TodayResult today={data.today} />
          </div>
        </div>

        {/* 3. Right Column: History */}
        <div className="col-md-6 col-lg-5">
          <HistoryList history={data.history} />
        </div>
      </div>
    </div>
  );
}