import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

export default function TimeTracker() {
  const [isTracking, setIsTracking] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const fetchSessions = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/tracking/sessions",
        {
          headers,
        }
      );
      setSessions(res.data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    }
  };

  const startTimer = async () => {
    try {
      await axios.post(
        "http://localhost:8080/api/tracking/start",
        {},
        { headers }
      );
      setIsTracking(true);
      setStartTime(Date.now());
    } catch (err) {
      console.error("Failed to start timer", err);
    }
  };

  const stopTimer = async () => {
    try {
      await axios.post(
        "http://localhost:8080/api/tracking/stop",
        {},
        { headers }
      );
      setIsTracking(false);
      setStartTime(null);
      setElapsed(0);
      fetchSessions();
    } catch (err) {
      console.error("Failed to stop timer", err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Timer tick
  useEffect(() => {
    let interval;
    if (isTracking && startTime) {
      interval = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  const formatDuration = (ms) => {
    const sec = Math.floor(ms / 1000);
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">🕒 Time Tracker</h2>

      {isTracking ? (
        <>
          <p className="text-green-600 font-semibold">Tracking...</p>
          <p className="text-lg mb-4">{formatDuration(elapsed)}</p>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={stopTimer}
          >
            Stop Timer
          </button>
        </>
      ) : (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={startTimer}
        >
          Start Timer
        </button>
      )}

      <hr className="my-6" />

      <h3 className="text-lg font-semibold mb-2">Today's Sessions</h3>
      <ul className="text-sm space-y-2 max-h-48 overflow-auto">
        {Array.isArray(sessions) && sessions.length > 0 ? (
          sessions.map((session) => (
            <li key={session.id} className="border p-2 rounded">
              <strong>Start:</strong> {dayjs(session.start).format("hh:mm A")}{" "}
              <br />
              <strong>End:</strong>{" "}
              {session.end
                ? dayjs(session.end).format("hh:mm A")
                : "In Progress"}{" "}
              <br />
              <strong>Duration:</strong>{" "}
              {session.end
                ? formatDuration(
                    new Date(session.end) - new Date(session.start)
                  )
                : "--"}
            </li>
          ))
        ) : (
          <p className="text-gray-500">No sessions found today.</p>
        )}
      </ul>
    </div>
  );
}
