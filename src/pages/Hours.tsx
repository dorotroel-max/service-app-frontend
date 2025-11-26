import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Hours() {
  const [hours, setHours] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [form, setForm] = useState({ volunteer_id: "", opportunity_id: "", hours: "", date_logged: new Date().toISOString().split('T')[0], note: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filterVolunteer, setFilterVolunteer] = useState("");
  const [filterOpportunity, setFilterOpportunity] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hRes, oRes, vRes] = await Promise.all([
        api.get("/api/v1/hours"),
        api.get("/api/v1/opportunities"),
        api.get("/api/v1/volunteers")
      ]);
      setHours(hRes.data);
      setOpportunities(oRes.data);
      setVolunteers(vRes.data);
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to load hours data");
    } finally {
      setLoading(false);
    }
  };

  const logHours = async (e: any) => {
    e.preventDefault();
    if (!form.volunteer_id || !form.opportunity_id || !form.hours) {
      setMessage("All fields required");
      return;
    }
    
    try {
      const hrs = parseInt(form.hours);
      if (isNaN(hrs) || hrs <= 0) {
        setMessage("Hours must be a positive number");
        return;
      }

      await api.post(`/api/v1/hours/log/${form.opportunity_id}`, {
        volunteer_id: parseInt(form.volunteer_id),
        hours: hrs,
        date_logged: form.date_logged,
        note: form.note || null
      });

      setForm({ volunteer_id: "", opportunity_id: "", hours: "", date_logged: new Date().toISOString().split('T')[0], note: "" });
      setMessage("Hours logged successfully");
      setTimeout(() => setMessage(""), 3000);
      await loadData();
    } catch (err: any) {
      setMessage(err?.response?.data?.error || "Failed to log hours");
    }
  };

  const deleteHours = async (id: number) => {
    if (!confirm("Delete this hours entry?")) return;
    try {
      // Note: Backend doesn't have delete endpoint yet, this is placeholder
      setMessage("Delete not implemented yet");
    } catch (err: any) {
      setMessage(err?.response?.data?.error || "Failed to delete");
    }
  };

  const filteredHours = hours.filter(h => {
    if (filterVolunteer && h.volunteer_id !== parseInt(filterVolunteer)) return false;
    if (filterOpportunity && h.opportunity_id !== parseInt(filterOpportunity)) return false;
    return true;
  });

  const totalHours = filteredHours.reduce((sum, h) => sum + h.hours, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Hours Logging</h3>
        <div className="muted">{filteredHours.length} entries | {totalHours} total hours</div>
      </div>

      {message && (
        <div
          style={{
            padding: 10,
            marginBottom: 12,
            borderRadius: 8,
            background: message.includes("successfully") ? "#d1fae5" : "#fee2e2",
            color: message.includes("successfully") ? "#065f46" : "#7f1d1d",
            fontSize: 13
          }}
        >
          {message}
        </div>
      )}

      <form onSubmit={logHours} style={{ marginBottom: 12 }} className="form-row">
        <select value={form.volunteer_id} onChange={e => setForm({ ...form, volunteer_id: e.target.value })} required>
          <option value="">Select Volunteer</option>
          {volunteers.map(v => <option key={v.id} value={v.id}>{v.full_name || v.username}</option>)}
        </select>

        <select value={form.opportunity_id} onChange={e => setForm({ ...form, opportunity_id: e.target.value })} required>
          <option value="">Select Opportunity</option>
          {opportunities.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
        </select>

        <input
          type="number"
          min="1"
          placeholder="Hours"
          value={form.hours}
          onChange={e => setForm({ ...form, hours: e.target.value })}
          required
        />

        <input
          type="date"
          value={form.date_logged}
          onChange={e => setForm({ ...form, date_logged: e.target.value })}
        />

        <input
          placeholder="Note (optional)"
          value={form.note}
          onChange={e => setForm({ ...form, note: e.target.value })}
        />

        <button type="submit" className="btn">Log Hours</button>
      </form>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 6 }}>Filter by Volunteer</label>
          <select value={filterVolunteer} onChange={e => setFilterVolunteer(e.target.value)}>
            <option value="">All Volunteers</option>
            {volunteers.map(v => <option key={v.id} value={v.id}>{v.full_name || v.username}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 6 }}>Filter by Opportunity</label>
          <select value={filterOpportunity} onChange={e => setFilterOpportunity(e.target.value)}>
            <option value="">All Opportunities</option>
            {opportunities.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
          </select>
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <table className="table">
          <thead>
            <tr>
              <th>Volunteer</th>
              <th>Opportunity</th>
              <th>Hours</th>
              <th>Date</th>
              <th>Note</th>
              <th>Logged By</th>
            </tr>
          </thead>
          <tbody>
            {filteredHours.map((h: any) => (
              <tr key={h.id}>
                <td data-label="Volunteer">{h.volunteer_name}</td>
                <td data-label="Opportunity">{h.opportunity_title}</td>
                <td data-label="Hours" style={{ fontWeight: "bold" }}>{h.hours}</td>
                <td data-label="Date">{h.date_logged}</td>
                <td data-label="Note" style={{ fontSize: 13, color: "#6b7280" }}>{h.note || "-"}</td>
                <td data-label="Logged By">{h.logged_by || "system"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
