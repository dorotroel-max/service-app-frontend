import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Analytics() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [hours, setHours] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [hRes, vRes, oRes] = await Promise.all([
        api.get("/api/v1/hours"),
        api.get("/api/v1/volunteers"),
        api.get("/api/v1/opportunities")
      ]);

      setHours(hRes.data);
      setVolunteers(vRes.data);
      setOpportunities(oRes.data);

      // Calculate statistics
      const totalHours = hRes.data.reduce((sum: number, h: any) => sum + h.hours, 0);
      const topVolunteers = [...vRes.data]
        .sort((a: any, b: any) => (b.total_hours || 0) - (a.total_hours || 0))
        .slice(0, 5);

      const opportunityPopularity = oRes.data.map((o: any) => ({
        id: o.id,
        title: o.title,
        registrations: o.volunteers_registered,
        needed: o.volunteers_needed,
        fillRate: o.volunteers_needed > 0 ? Math.round((o.volunteers_registered / o.volunteers_needed) * 100) : 0
      })).sort((a: any, b: any) => b.registrations - a.registrations).slice(0, 5);

      // Skill popularity
      const skillCount: { [key: string]: number } = {};
      vRes.data.forEach((v: any) => {
        const [skillRes] = [{ data: [] }]; // Placeholder - would need actual skill data
      });

      setStats({
        totalHours,
        totalVolunteers: vRes.data.length,
        totalOpportunities: oRes.data.length,
        completedOpportunities: oRes.data.filter((o: any) => o.status === "completed").length,
        activeOpportunities: oRes.data.filter((o: any) => o.status === "open").length,
        avgHoursPerVolunteer: vRes.data.length > 0 ? Math.round(totalHours / vRes.data.length) : 0,
        topVolunteers,
        opportunityPopularity
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading analytics...</p>;

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Analytics & Reports</h3>

      {/* Key Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ padding: 16, background: "#fbfdff", borderRadius: 8, border: "1px solid #e6e9ef" }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Total Hours Volunteered</div>
          <div style={{ fontSize: 32, fontWeight: "bold", color: "#0284c7" }}>{stats.totalHours || 0}</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>Cumulative</div>
        </div>

        <div style={{ padding: 16, background: "#fbfdff", borderRadius: 8, border: "1px solid #e6e9ef" }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Total Volunteers</div>
          <div style={{ fontSize: 32, fontWeight: "bold", color: "#10b981" }}>{stats.totalVolunteers || 0}</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>Active</div>
        </div>

        <div style={{ padding: 16, background: "#fbfdff", borderRadius: 8, border: "1px solid #e6e9ef" }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Average Hours per Volunteer</div>
          <div style={{ fontSize: 32, fontWeight: "bold", color: "#f59e0b" }}>{stats.avgHoursPerVolunteer || 0}</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>Mean</div>
        </div>

        <div style={{ padding: 16, background: "#fbfdff", borderRadius: 8, border: "1px solid #e6e9ef" }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Opportunities</div>
          <div style={{ fontSize: 32, fontWeight: "bold", color: "#06b6d4" }}>{stats.activeOpportunities || 0}</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>Open ({stats.completedOpportunities || 0} completed)</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Top Volunteers */}
        <div style={{ padding: 16, background: "#fbfdff", borderRadius: 8, border: "1px solid #e6e9ef" }}>
          <h4 style={{ marginTop: 0 }}>Top Volunteers</h4>
          {(stats.topVolunteers || []).length > 0 ? (
            <div style={{ display: "grid", gap: 12 }}>
              {stats.topVolunteers.map((v: any, idx: number) => (
                <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottom: "1px solid #e6e9ef" }}>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: 14 }}>#{idx + 1}</div>
                    <div style={{ fontSize: 13 }}>{v.full_name || "Unknown"}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: "bold", color: "#10b981" }}>{v.total_hours || 0}</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>hours</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#6b7280" }}>No volunteer data yet</p>
          )}
        </div>

        {/* Popular Opportunities */}
        <div style={{ padding: 16, background: "#fbfdff", borderRadius: 8, border: "1px solid #e6e9ef" }}>
          <h4 style={{ marginTop: 0 }}>Most Popular Opportunities</h4>
          {(stats.opportunityPopularity || []).length > 0 ? (
            <div style={{ display: "grid", gap: 12 }}>
              {stats.opportunityPopularity.map((o: any) => (
                <div key={o.id} style={{ paddingBottom: 12, borderBottom: "1px solid #e6e9ef" }}>
                  <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 6 }}>{o.title}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                    <div>
                      <span style={{ color: "#6b7280" }}>{o.registrations}/{o.needed} registered</span>
                    </div>
                    <div style={{
                      width: 40,
                      height: 6,
                      background: "#e6e9ef",
                      borderRadius: 3,
                      overflow: "hidden"
                    }}>
                      <div style={{
                        width: `${o.fillRate}%`,
                        height: "100%",
                        background: o.fillRate === 100 ? "#10b981" : "#f59e0b",
                        transition: "width 0.3s"
                      }} />
                    </div>
                    <div style={{ color: "#0284c7", fontWeight: "bold" }}>{o.fillRate}%</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#6b7280" }}>No opportunities yet</p>
          )}
        </div>
      </div>

      {/* Volunteer Distribution */}
      <div style={{ marginTop: 20, padding: 16, background: "#fbfdff", borderRadius: 8, border: "1px solid #e6e9ef" }}>
        <h4 style={{ marginTop: 0 }}>Volunteer Hours Distribution</h4>
        <div style={{ display: "grid", gap: 12 }}>
          {volunteers.slice(0, 10).map((v: any) => (
            <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 120, fontSize: 12 }}>{v.full_name || "Unnamed"}</div>
              <div style={{
                flex: 1,
                height: 24,
                background: "#e6e9ef",
                borderRadius: 4,
                overflow: "hidden",
                position: "relative"
              }}>
                <div style={{
                  height: "100%",
                  width: `${Math.min((v.total_hours || 0) / (stats.totalHours / volunteers.length || 1) * 100, 100)}%`,
                  background: "#0284c7",
                  transition: "width 0.3s"
                }} />
              </div>
              <div style={{ width: 40, textAlign: "right", fontWeight: "bold", color: "#0284c7" }}>
                {v.total_hours || 0}h
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
