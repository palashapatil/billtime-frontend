// src/components/LogoutButton.jsx
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <button onClick={handleLogout} className="text-red-600 underline">
      Logout
    </button>
  );
}
