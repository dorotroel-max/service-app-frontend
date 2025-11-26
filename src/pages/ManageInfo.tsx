import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function ManageInfo() {
  const [volunteerInfo, setVolunteerInfo] = useState({ id: "", full_name: "", phone: "", address: "", total_hours: 0 });
  const [editForm, setEditForm] = useState({ full_name: "", phone: "", address: "" });
  const [skills, setSkills] = useState<any[]>([]);
  const [volunteerSkills, setVolunteerSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadVolunteerInfo();
  }, []);

  const loadVolunteerInfo = async () => {
    try {
      setLoading(true);
      const [resMe, resSkills] = await Promise.all([
        api.get("/api/v1/users/me"),
        api.get("/api/v1/skills")
      ]);
      
      setVolunteerInfo(resMe.data);
      setEditForm({ 
        full_name: resMe.data.full_name || "", 
        phone: resMe.data.phone || "", 
        address: resMe.data.address || "" 
      });
      setSkills(resSkills.data);

      // Load volunteer's skills
      try {
        const resVolSkills = await api.get("/api/v1/users/me/skills");
        setVolunteerSkills(resVolSkills.data);
      } catch (err) {
        // Skills endpoint might not return data on first load, that's ok
        setVolunteerSkills([]);
      }
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to load profile info");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put("/api/v1/users/me", editForm);
      await loadVolunteerInfo();
      setEditing(false);
      setMessage("Profile updated successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setMessage(err?.response?.data?.error || "Failed to save profile");
    }
  };

  const addSkill = async (skillId: number) => {
    try {
      await api.post("/api/v1/users/me/skills", { skill_category_id: skillId });
      await loadVolunteerInfo();
      setMessage("Skill added successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setMessage(err?.response?.data?.error || "Failed to add skill");
    }
  };

  const removeSkill = async (skillId: number) => {
    try {
      await api.delete(`/api/v1/users/me/skills/${skillId}`);
      await loadVolunteerInfo();
      setMessage("Skill removed successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setMessage(err?.response?.data?.error || "Failed to remove skill");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h3 style={{ margin: "0 0 12px 0" }}>My Volunteer Profile</h3>
      <div style={{ maxWidth: 600 }}>
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

        <div style={{ padding: 12, border: "1px solid #e6e9ef", borderRadius: 8, background: "#fbfdff", marginBottom: 12 }}>
          <h4 style={{ marginTop: 0 }}>Personal Information</h4>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, display: "block" }}>Total Hours Volunteered</label>
              <div style={{ padding: "10px 12px", background: "#f3f4f6", borderRadius: 8, color: "#0f172a", fontSize: 18, fontWeight: "bold" }}>
                {volunteerInfo.total_hours} hours
              </div>
            </div>

            {editing ? (
              <>
                <div>
                  <label style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, display: "block" }}>Full Name</label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={editForm.full_name}
                    onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, display: "block" }}>Phone</label>
                  <input
                    type="tel"
                    placeholder="123-456-7890"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, display: "block" }}>Address</label>
                  <textarea
                    placeholder="Your address"
                    value={editForm.address}
                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                    style={{ resize: "vertical", minHeight: 80 }}
                  />
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={handleSave} className="btn">
                    Save
                  </button>
                  <button onClick={() => { setEditing(false); setEditForm({ full_name: volunteerInfo.full_name || "", phone: volunteerInfo.phone || "", address: volunteerInfo.address || "" }); }} className="btn secondary" type="button">
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, display: "block" }}>Full Name</label>
                  <div style={{ padding: "10px 12px", background: "#f3f4f6", borderRadius: 8, color: "#0f172a" }}>
                    {volunteerInfo.full_name || "Not set"}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, display: "block" }}>Phone</label>
                  <div style={{ padding: "10px 12px", background: "#f3f4f6", borderRadius: 8, color: "#0f172a" }}>
                    {volunteerInfo.phone || "Not set"}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, display: "block" }}>Address</label>
                  <div style={{ padding: "10px 12px", background: "#f3f4f6", borderRadius: 8, color: "#0f172a", whiteSpace: "pre-wrap" }}>
                    {volunteerInfo.address || "Not set"}
                  </div>
                </div>

                <button onClick={() => setEditing(true)} className="btn" type="button">
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ padding: 12, border: "1px solid #e6e9ef", borderRadius: 8, background: "#fbfdff" }}>
          <h4 style={{ marginTop: 0 }}>My Skills</h4>
          <div style={{ display: "grid", gap: 8 }}>
            {volunteerSkills.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {volunteerSkills.map(skill => (
                  <div key={skill.id} style={{ padding: "6px 12px", background: "#dbeafe", borderRadius: 20, color: "#0c4a6e", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                    {skill.name}
                    <button onClick={() => removeSkill(skill.id)} className="btn" style={{ fontSize: 12, padding: "2px 6px", marginLeft: 4 }} type="button">×</button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#6b7280", fontSize: 13 }}>No skills added yet</p>
            )}

            <div>
              <label style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, display: "block" }}>Add a Skill:</label>
              <select onChange={e => { if (e.target.value) addSkill(Number(e.target.value)); e.target.value = ""; }} defaultValue="">
                <option value="">Select skill to add...</option>
                {skills.map(skill => (
                  <option key={skill.id} value={skill.id}>{skill.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
