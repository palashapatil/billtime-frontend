import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
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
      }
    } catch (err) {
      console.error("Invalid token");
      localStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
      {/* Add logout button here */}
      <button
        onClick={() => {
          localStorage.clear();
          navigate("/login");
        }}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
