import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import TimeTracker from "../components/TimeTracker";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const expiry = decoded.exp * 1000;
      if (Date.now() > expiry) {
        localStorage.clear();
        navigate("/login");
      } else {
        setUser(JSON.parse(storedUser));

        // 📦 fetch dashboard stats
        axios
          .get("http://localhost:8080/api/dashboard/summary", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => setSummary(res.data))
          .catch((err) => {
            console.error("Error fetching summary", err);
            navigate("/login");
          });
      }
    } catch (err) {
      console.error("Invalid token");
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  if (!user || !summary)
    return <p className="text-center mt-10">Loading dashboard...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
            <p className="text-sm text-gray-600">Email: {user.email}</p>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatBox
            label="Hours Tracked"
            value={`${summary.hoursTracked}h`}
            color="blue"
          />
          <StatBox
            label="Invoices Sent"
            value={summary.invoicesSent}
            color="green"
          />
          <StatBox
            label="Total Earnings"
            value={`₹${summary.totalEarnings}`}
            color="yellow"
          />
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
          <ul className="space-y-2">
            {Array.isArray(summary.recentActivity) &&
            summary.recentActivity.length > 0 ? (
              summary.recentActivity.map((item, i) => (
                <li
                  key={i}
                  className="bg-gray-50 p-3 rounded shadow text-sm text-gray-700"
                >
                  {item}
                </li>
              ))
            ) : (
              <li className="text-gray-500 text-sm">No recent activity.</li>
            )}
          </ul>
        </div>
      </div>
      <TimeTracker />
    </div>
  );
}

function StatBox({ label, value, color }) {
  const bg = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
  }[color];

  return (
    <div className={`p-4 rounded-lg text-center shadow ${bg}`}>
      <h2 className="text-lg font-semibold">{label}</h2>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-600 mt-1">This Month</p>
    </div>
  );
}
