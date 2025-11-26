import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Leaderboard() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [filter, setFilter] = useState("hours");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVolunteers();
  }, []);

  const loadVolunteers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/v1/volunteers");
      setVolunteers(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSortedVolunteers = () => {
    let sorted = [...volunteers];
    
    if (filter === "hours") {
      sorted.sort((a, b) => (b.total_hours || 0) - (a.total_hours || 0));
    } else if (filter === "opportunities") {
      // Would need to fetch registration count
      sorted.sort((a, b) => b.id - a.id);
    }
    
    return sorted;
  };

  const getBadges = (volunteer: any) => {
    const badges = [];
    if ((volunteer.total_hours || 0) >= 100) badges.push({ label: "🏆 Century", color: "#fbbf24" });
    if ((volunteer.total_hours || 0) >= 50) badges.push({ label: "⭐ Golden", color: "#f59e0b" });
    if ((volunteer.total_hours || 0) >= 25) badges.push({ label: "🎖️ Silver", color: "#9ca3af" });
    if ((volunteer.total_hours || 0) >= 10) badges.push({ label: "🥉 Bronze", color: "#d97706" });
    return badges;
  };

  const sorted = getSortedVolunteers();

  if (loading) return <p>Loading leaderboard...</p>;

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Volunteer Leaderboard</h3>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          className={`btn ${filter === "hours" ? "" : "secondary"}`}
          onClick={() => setFilter("hours")}
        >
          By Hours
        </button>
        <button
          className={`btn ${filter === "opportunities" ? "" : "secondary"}`}
          onClick={() => setFilter("opportunities")}
        >
          By Opportunities
        </button>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {sorted.map((v, idx) => (
          <div
            key={v.id}
            style={{
              padding: 16,
              background: idx === 0 ? "#fef3c7" : idx === 1 ? "#f3f4f6" : idx === 2 ? "#fed7aa" : "#fbfdff",
              borderRadius: 8,
              border: idx < 3 ? `2px solid ${idx === 0 ? "#fbbf24" : idx === 1 ? "#d1d5db" : "#fb923c"}` : "1px solid #e6e9ef",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                background: idx === 0 ? "#fbbf24" : idx === 1 ? "#d1d5db" : idx === 2 ? "#fb923c" : "#dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: "#fff",
                fontSize: 18
              }}>
                #{idx + 1}
              </div>

              <div>
                <div style={{ fontWeight: "bold", fontSize: 16 }}>{v.full_name || "Unknown"}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                  {v.phone && <span>{v.phone}</span>}
                </div>
                {getBadges(v).length > 0 && (
                  <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                    {getBadges(v).map((badge, i) => (
                      <div
                        key={i}
                        title={badge.label}
                        style={{
                          padding: "4px 8px",
                          background: badge.color,
                          borderRadius: 4,
                          fontSize: 12,
                          color: "#fff",
                          fontWeight: "bold"
                        }}
                      >
                        {badge.label.split(" ")[0]}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: "bold", color: "#0284c7" }}>
                {v.total_hours || 0}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>hours volunteered</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
