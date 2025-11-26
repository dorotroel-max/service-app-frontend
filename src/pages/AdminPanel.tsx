import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function AdminPanel() {
  const [tab, setTab] = useState<"registrations" | "hours">("registrations");
  const [pendingRegistrations, setPendingRegistrations] = useState<any[]>([]);
  const [pendingHours, setPendingHours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [regRes, hrsRes] = await Promise.all([
        api.get("/api/v1/approvals/registrations/pending"),
        api.get("/api/v1/approvals/hours/pending")
      ]);
      setPendingRegistrations(regRes.data);
      setPendingHours(hrsRes.data);
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const approveRegistration = async (regId: number, volunteerId: number, oppId: number) => {
    try {
      await api.post(`/api/v1/approvals/registrations/${regId}/approve`, {
        volunteer_id: volunteerId,
        opportunity_id: oppId
      });
      setMessage("Registration approved");
      setTimeout(() => setMessage(""), 3000);
      await loadData();
    } catch (err: any) {
      setMessage(err?.response?.data?.error || "Failed to approve");
    }
  };

  const rejectRegistration = async (regId: number) => {
    if (!confirm("Reject this registration?")) return;
    try {
      await api.post(`/api/v1/approvals/registrations/${regId}/reject`);
      setMessage("Registration rejected");
      setTimeout(() => setMessage(""), 3000);
      await loadData();
    } catch (err: any) {
      setMessage(err?.response?.data?.error || "Failed to reject");
    }
  };

  const verifyHours = async (hoursId: number, comment: string) => {
    try {
      await api.post(`/api/v1/approvals/hours/${hoursId}/verify`, { comment });
      setMessage("Hours verified");
      setTimeout(() => setMessage(""), 3000);
      await loadData();
    } catch (err: any) {
      setMessage(err?.response?.data?.error || "Failed to verify");
    }
  };

  const rejectHours = async (hoursId: number) => {
    const comment = prompt("Reason for rejection:");
    if (!comment) return;
    try {
      await api.post(`/api/v1/approvals/hours/${hoursId}/reject`, { comment });
      setMessage("Hours rejected");
      setTimeout(() => setMessage(""), 3000);
      await loadData();
    } catch (err: any) {
      setMessage(err?.response?.data?.error || "Failed to reject");
    }
  };

  if (loading) return <p>Loading admin panel...</p>;

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Admin Panel</h3>

      {message && (
        <div
          style={{
            padding: 10,
            marginBottom: 12,
            borderRadius: 8,
            background: message.includes("successfully") || message.includes("approved") || message.includes("verified") ? "#d1fae5" : "#fee2e2",
            color: message.includes("successfully") || message.includes("approved") || message.includes("verified") ? "#065f46" : "#7f1d1d",
            fontSize: 13
          }}
        >
          {message}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          className={`btn ${tab === "registrations" ? "" : "secondary"}`}
          onClick={() => setTab("registrations")}
        >
          Pending Registrations ({pendingRegistrations.length})
        </button>
        <button
          className={`btn ${tab === "hours" ? "" : "secondary"}`}
          onClick={() => setTab("hours")}
        >
          Pending Hours ({pendingHours.length})
        </button>
      </div>

      {tab === "registrations" && (
        <div>
          {pendingRegistrations.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No pending registrations</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Volunteer</th>
                  <th>Opportunity</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRegistrations.map((reg: any) => (
                  <tr key={reg.id}>
                    <td data-label="Volunteer">{reg.full_name}</td>
                    <td data-label="Opportunity">{reg.title}</td>
                    <td data-label="Registered">{new Date(reg.registered_at).toLocaleDateString()}</td>
                    <td data-label="Actions">
                      <button
                        className="btn"
                        onClick={() => approveRegistration(reg.id, reg.volunteer_id, reg.opportunity_id)}
                        style={{ padding: "4px 8px", fontSize: 12, marginRight: 4 }}
                      >
                        Approve
                      </button>
                      <button
                        className="btn ghost"
                        onClick={() => rejectRegistration(reg.id)}
                        style={{ padding: "4px 8px", fontSize: 12 }}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "hours" && (
        <div>
          {pendingHours.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No pending hours to verify</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Volunteer</th>
                  <th>Opportunity</th>
                  <th>Hours</th>
                  <th>Date</th>
                  <th>Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingHours.map((h: any) => (
                  <tr key={h.id}>
                    <td data-label="Volunteer">{h.full_name}</td>
                    <td data-label="Opportunity">{h.title}</td>
                    <td data-label="Hours" style={{ fontWeight: "bold" }}>{h.hours}</td>
                    <td data-label="Date">{h.date_logged}</td>
                    <td data-label="Note" style={{ fontSize: 12, color: "#6b7280" }}>{h.note || "-"}</td>
                    <td data-label="Actions">
                      <button
                        className="btn"
                        onClick={() => verifyHours(h.id, "")}
                        style={{ padding: "4px 8px", fontSize: 12, marginRight: 4 }}
                      >
                        Verify
                      </button>
                      <button
                        className="btn ghost"
                        onClick={() => rejectHours(h.id)}
                        style={{ padding: "4px 8px", fontSize: 12 }}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
