import { useEffect, useState } from "react";
import API from "../services/api";

import Loader from "../components/common/Loader";
import AdminHeader from "../components/admin/AdminHeader";
import SelectedHistoryTable from "../components/admin/SelectedHistoryTable";
import FineReportTable from "../components/admin/FineReportTable";
import HolidayControl from "../components/admin/HolidayControl";
import PipelineMonitor from "../components/admin/PipelineMonitor"; // New Component
import StudentStatusTable from "../components/admin/StudentStatusTable"; // New Component

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [fineData, setFineData] = useState(null);
  const [pipeline, setPipeline] = useState(null); // Pipeline State
  const [students, setStudents] = useState([]); // Student List for Toggle
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [holidayDate, setHolidayDate] = useState(new Date().toISOString().split('T')[0]);
  const [holidayMessage, setHolidayMessage] = useState("");

const fetchData = async () => {
  try {
    setLoading(true);
    const profileRes = await API.get("/admin/profile");
    const adminUser = profileRes.data.user;
    setUser(adminUser);

    // ✅ FIX: Only fetch pipeline and students if classId exists (CC Role)
    const requests = [
      API.get("/admin/reports/selected-history?json=true"),
      API.get("/admin/reports/fine-report?json=true")
    ];

    if (adminUser.classId) {
      requests.push(API.get(`/admin/reports/pipeline/${adminUser.classId}`));
    }

    const responses = await Promise.all(requests);
    
    setHistory(responses[0].data.data || []);
    setFineData(responses[1].data.data || null);
    
    if (adminUser.classId) {
      setPipeline(responses[2].data);
      // Fetch student list for CC management
      const s = await API.get(`/students/${adminUser.classId}`);
      setStudents(s.data.students);
    }
  } catch (err) {
    console.error("Dashboard Load Error:", err);
    setError("Session expired or server error");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleAbsent = async (studentId, currentStatus) => {
    try {
      // Logic to toggle absent status in backend
      await API.patch(`/students/status/${studentId}`, { isLongAbsent: !currentStatus });
      fetchData(); // Refresh list
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleAddHoliday = async () => {
    try {
      await API.post("/holidays", {
        date: holidayDate,
        classId: user.role === "CC" ? user.classId : null
      });
      setHolidayMessage("Holiday added successfully!");
      setTimeout(() => setHolidayMessage(""), 3000);
    } catch (err) {
      setHolidayMessage(err.response?.data?.error || "Failed to add holiday");
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    window.location.replace("/");
  };

  if (loading) return <Loader text="Synchronizing Admin Data..." />;
  if (error) return <div className="p-5 text-center text-danger fw-bold">{error}</div>;

  return (
    <div className="bg-light min-vh-100">
      <AdminHeader user={user} onLogout={logout} />
      
      <div className="container py-4">
        <div className="row g-4">
          {/* Main Content */}
          <div className="col-lg-8">
            <div className="d-grid gap-4">
              {user.role === "CC" && pipeline && (
                <PipelineMonitor data={pipeline} />
              )}
              <SelectedHistoryTable data={history} onExport={() => {}} />
              {user.role === "CC" && (
                <StudentStatusTable students={students} onToggle={handleToggleAbsent} />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            <HolidayControl 
              user={user} 
              holidayDate={holidayDate} 
              setHolidayDate={setHolidayDate}
              handleAddHoliday={handleAddHoliday}
              message={holidayMessage}
            />
            
            <FineReportTable data={fineData} role={user.role} onExport={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
}