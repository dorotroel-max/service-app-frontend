import React, { useEffect, useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ManageInfo from "./pages/ManageInfo";
import Volunteers from "./pages/Volunteers";
import Hours from "./pages/Hours";
import Analytics from "./pages/Analytics";
import Leaderboard from "./pages/Leaderboard";
import { setAuthToken } from "./api";
import AdminPanel from "./pages/AdminPanel";

export default function App(){
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [currentPage, setCurrentPage] = useState<"dashboard" | "info" | "volunteers" | "hours" | "analytics" | "leaderboard" | "admin">("dashboard");

  useEffect(() => {
    setAuthToken(token || undefined);
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  return (
    <div className="container">
      <div className="header">
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <img src="/logo192.png" alt="logo" style={{width:36, height:36, borderRadius:8}}/>
          <h2>Community Service Hub</h2>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          {token && (
            <>
              <button className="btn secondary" onClick={() => setCurrentPage("dashboard")}>Opportunities</button>
              <button className="btn secondary" onClick={() => setCurrentPage("volunteers")}>Volunteers</button>
              <button className="btn secondary" onClick={() => setCurrentPage("hours")}>Hours Log</button>
              <button className="btn secondary" onClick={() => setCurrentPage("analytics")}>Analytics</button>
              <button className="btn secondary" onClick={() => setCurrentPage("leaderboard")}>Leaderboard</button>
              <button className="btn secondary" onClick={() => setCurrentPage("info")}>My Profile</button>
              <button className="btn secondary" onClick={() => setCurrentPage("admin")}>Admin</button>
            </>
          )}
          {token ? <button className="btn ghost" onClick={() => setToken(null)}>Logout</button> : null}
        </div>
      </div>
      {token ? (
        <>
          {currentPage === "dashboard" && <Dashboard />}
          {currentPage === "volunteers" && <Volunteers />}
          {currentPage === "hours" && <Hours />}
          {currentPage === "analytics" && <Analytics />}
          {currentPage === "leaderboard" && <Leaderboard />}
          {currentPage === "info" && <ManageInfo />}
          {currentPage === "admin" && <AdminPanel />}
        </>
      ) : (
        <Login onLogin={(t)=> setToken(t)} />
      )}
    </div>
  );
}
