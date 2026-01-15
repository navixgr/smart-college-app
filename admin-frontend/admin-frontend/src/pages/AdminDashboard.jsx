import { useEffect, useState } from "react";
import API from "../services/api";

import Loader from "../components/common/Loader";
import AdminHeader from "../components/admin/AdminHeader";
import SelectedHistoryTable from "../components/admin/SelectedHistoryTable";
import FineReportTable from "../components/admin/FineReportTable";
import HolidayControl from "../components/admin/HolidayControl";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [fineData, setFineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* --- NEW HOLIDAY STATES --- */
  // Initialize with today's date in YYYY-MM-DD format to fix the "--" month issue
  const [holidayDate, setHolidayDate] = useState(new Date().toISOString().split('T')[0]);
  const [holidayMessage, setHolidayMessage] = useState("");

  useEffect(() => {
    Promise.all([
      API.get("/admin/profile"),
      API.get("/admin/reports/selected-history?json=true"),
      API.get("/admin/reports/fine-report?json=true")
    ])
      .then(([p, h, f]) => {
        setUser(p.data.user);
        setHistory(h.data.data || []);
        setFineData(f.data.data || null);
      })
      .catch(() => setError("Session expired or server error"))
      .finally(() => setLoading(false));
  }, []);

  /* --- HOLIDAY HANDLER --- */
  const handleAddHoliday = async () => {
    try {
      await API.post("/holidays", {
        date: holidayDate,
        classId: user.role === "CC" ? user.classId : null
      });
      setHolidayMessage("Holiday added successfully!");
      // Reset message after 3 seconds
      setTimeout(() => setHolidayMessage(""), 3000);
    } catch (err) {
      setHolidayMessage(err.response?.data?.error || "Failed to add holiday");
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    window.location.replace("/");
  };

const exportFine = () => {
  const token = localStorage.getItem("adminToken");
  const url = `http://localhost:5000/api/admin/reports/fine-report?token=${token}`;
  
  // Create a hidden anchor element
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "Fine_Report.xlsx"); // Set filename
  document.body.appendChild(link);
  link.click(); // Trigger download
  document.body.removeChild(link); // Clean up
};

const exportSelected = () => {
  const token = localStorage.getItem("adminToken");
  const url = `http://localhost:5000/api/admin/reports/selected-history?token=${token}`;
  
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "Selection_History.xlsx");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

if (loading) return <Loader text="Synchronizing Admin Data..." />;
  if (error) return <div className="p-5 text-center text-danger fw-bold">{error}</div>;
  if (!user) return <div className="p-5 text-center fw-bold">Unauthorized</div>;

  return (
    <div className="bg-light min-vh-100">
      <AdminHeader user={user} onLogout={logout} />
      
      <div className="container py-4">
        <div className="row g-4">
          {/* Main Content: History */}
          <div className="col-lg-8">
            <SelectedHistoryTable data={history} onExport={exportSelected} />
          </div>

          {/* Sidebar: Holiday Control */}
          <div className="col-lg-4">
            <HolidayControl 
              user={user} 
              holidayDate={holidayDate} 
              setHolidayDate={setHolidayDate}
              handleAddHoliday={handleAddHoliday}
              message={holidayMessage}
            />
            
            <div className="card border-0 shadow-sm bg-primary text-white mt-4" style={{ borderRadius: '15px' }}>
              <div className="card-body p-4 text-center">
                <i className="bi bi-info-circle-fill fs-2 mb-2 d-block"></i>
                <h6 className="fw-bold">Admin Tip</h6>
                <small className="opacity-75">Fines are calculated automatically based on missed deadlines. Mark holidays to skip those dates.</small>
              </div>
            </div>
          </div>

          {/* Full Width Bottom: Fine Report */}
          <div className="col-12">
            <FineReportTable data={fineData} role={user.role} onExport={exportFine} />
          </div>
        </div>
      </div>
    </div>
  );
}