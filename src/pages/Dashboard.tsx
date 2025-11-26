import React, { useEffect, useState } from "react";
import { api } from "../api";

type Opportunity = any;

// Helper function to format datetime for MySQL
function formatDateTimeForDB(dateTimeLocal: string): string | null {
  if (!dateTimeLocal) return null;
  // dateTimeLocal format: "2025-02-21T23:00"
  // Convert to: "2025-02-21 23:00:00"
  const date = new Date(dateTimeLocal);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export default function Dashboard(){
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [form, setForm] = useState({ title:"", description:"", location:"", date_needed:"", category_id: "", volunteers_needed: 1 });
  const [editingOpportunityId, setEditingOpportunityId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", location: "", date_needed: "", category_id: "", volunteers_needed: 1, status: "open" });
  const [loading, setLoading] = useState(true);
  const [filterSkill, setFilterSkill] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const [oRes, sRes] = await Promise.all([api.get("/api/v1/opportunities"), api.get("/api/v1/skills")]);
    setOpportunities(oRes.data);
    setSkills(sRes.data);
    setLoading(false);
  };

  const getFilteredOpportunities = () => {
    return opportunities.filter(o => {
      if (filterSkill && o.category_id !== parseInt(filterSkill)) return false;
      if (filterStatus && o.status !== filterStatus) return false;
      if (filterLocation && !o.location.toLowerCase().includes(filterLocation.toLowerCase())) return false;
      if (filterSearch && !(o.title.toLowerCase().includes(filterSearch.toLowerCase()) || o.description.toLowerCase().includes(filterSearch.toLowerCase()))) return false;
      return true;
    });
  };

  useEffect(()=>{ load(); }, []);

  const addOpportunity = async (e:any) => {
    e.preventDefault();
    try{
      const catId = form.category_id && form.category_id !== "" ? parseInt(form.category_id) : null;
      const volNeeded = form.volunteers_needed && form.volunteers_needed > 0 ? form.volunteers_needed : 1;
      
      const res = await api.post("/api/v1/opportunities", { 
        title: form.title, 
        description: form.description || "", 
        location: form.location || "",
        date_needed: formatDateTimeForDB(form.date_needed),
        category_id: catId,
        volunteers_needed: volNeeded
      });
      setForm({ title:"", description:"", location:"", date_needed:"", category_id: "", volunteers_needed: 1 });
      await load();
    }catch(err:any){
      console.error(err);
      alert(err?.response?.data?.error || 'Failed to add opportunity');
    }
  };

  const deleteOpportunity = async (id:number) => {
    if (!confirm("Delete opportunity?")) return;
    try {
      await api.delete("/api/v1/opportunities/" + id);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to delete opportunity');
    }
  };

  const startEdit = (o: any) => {
    setEditingOpportunityId(o.id);
    // Format date from ISO to datetime-local format
    let formattedDate = "";
    if (o.date_needed) {
      const d = new Date(o.date_needed);
      formattedDate = d.toISOString().slice(0, 16);
    }
    setEditForm({ 
      title: o.title || "", 
      description: o.description || "", 
      location: o.location || "", 
      date_needed: formattedDate,
      category_id: o.category_id ? o.category_id.toString() : "",
      volunteers_needed: o.volunteers_needed || 1,
      status: o.status || "open"
    });
  };

  const cancelEdit = () => {
    setEditingOpportunityId(null);
    setEditForm({ title:"", description:"", location:"", date_needed:"", category_id: "", volunteers_needed: 1, status: "open" });
  };

  const saveEdit = async () => {
    if (!editingOpportunityId) return;
    try{
      const catId = editForm.category_id ? parseInt(editForm.category_id) : null;
      await api.put(`/api/v1/opportunities/${editingOpportunityId}`, { 
        title: editForm.title, 
        description: editForm.description, 
        location: editForm.location,
        date_needed: formatDateTimeForDB(editForm.date_needed),
        category_id: catId,
        volunteers_needed: parseInt(editForm.volunteers_needed.toString()) || 1,
        status: editForm.status
      });
      await load();
      cancelEdit();
    }catch(err:any){
      alert(err?.response?.data?.error || 'Failed to save opportunity');
    }
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h3 style={{ margin:0 }}>Service Opportunities</h3>
        <div className="muted">{getFilteredOpportunities().length} available</div>
      </div>

      <form onSubmit={addOpportunity} style={{ marginBottom:12 }} className="form-row">
        <input placeholder="Opportunity Title" value={form.title} onChange={e=>setForm({ ...form, title: e.target.value })} required />
        <input placeholder="Description" value={form.description} onChange={e=>setForm({ ...form, description: e.target.value })} />
        <input placeholder="Location" value={form.location} onChange={e=>setForm({ ...form, location: e.target.value })} />
        <input type="datetime-local" value={form.date_needed} onChange={e=>setForm({ ...form, date_needed: e.target.value })} />
        <select value={form.category_id} onChange={e=>setForm({ ...form, category_id: e.target.value })}>
          <option value="">Select Skill Category</option>
          {skills.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type="number" min={1} placeholder="Volunteers Needed" value={form.volunteers_needed} onChange={e=>setForm({ ...form, volunteers_needed: Number(e.target.value) })} />
        <button type="submit" className="btn" disabled={!form.title}>Add</button>
      </form>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 6 }}>Search</label>
          <input placeholder="Title or description..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)} style={{ width: "100%" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 6 }}>Skill Category</label>
          <select value={filterSkill} onChange={e => setFilterSkill(e.target.value)} style={{ width: "100%" }}>
            <option value="">All Skills</option>
            {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 6 }}>Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: "100%" }}>
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 6 }}>Location</label>
          <input placeholder="Filter by location..." value={filterLocation} onChange={e => setFilterLocation(e.target.value)} style={{ width: "100%" }} />
        </div>
      </div>

      {editingOpportunityId && (
        <div style={{ padding: 12, border: '1px solid #eef2f6', marginBottom: 12, borderRadius: 8, background:'#fbfdff' }}>
          <h4 style={{ marginTop:0 }}>Edit Opportunity</h4>
          <div className="form-row">
            <div style={{ display:'flex', flexDirection:'column' }}>
              <label style={{ fontSize:12, color:'#6b7280', marginBottom:6 }}>Title</label>
              <input placeholder="Title" value={editForm.title} onChange={e=>setEditForm({ ...editForm, title: e.target.value })} />
            </div>
            <div style={{ display:'flex', flexDirection:'column' }}>
              <label style={{ fontSize:12, color:'#6b7280', marginBottom:6 }}>Description</label>
              <input placeholder="Description" value={editForm.description} onChange={e=>setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div style={{ display:'flex', flexDirection:'column' }}>
              <label style={{ fontSize:12, color:'#6b7280', marginBottom:6 }}>Location</label>
              <input placeholder="Location" value={editForm.location} onChange={e=>setEditForm({ ...editForm, location: e.target.value })} />
            </div>
            <div style={{ display:'flex', flexDirection:'column' }}>
              <label style={{ fontSize:12, color:'#6b7280', marginBottom:6 }}>Date Needed</label>
              <input type="datetime-local" value={editForm.date_needed} onChange={e=>setEditForm({ ...editForm, date_needed: e.target.value })} />
            </div>
            <select value={editForm.category_id} onChange={e=>setEditForm({ ...editForm, category_id: e.target.value })}>
              <option value="">Select Skill Category</option>
              {skills.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div style={{ display:'flex', flexDirection:'column' }}>
              <label style={{ fontSize:12, color:'#6b7280', marginBottom:6 }}>Volunteers Needed</label>
              <input type="number" min={1} value={editForm.volunteers_needed} onChange={e=>setEditForm({ ...editForm, volunteers_needed: Number(e.target.value) })} />
            </div>
            <div style={{ display:'flex', flexDirection:'column' }}>
              <label style={{ fontSize:12, color:'#6b7280', marginBottom:6 }}>Status</label>
              <select value={editForm.status} onChange={e=>setEditForm({ ...editForm, status: e.target.value })}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <button onClick={saveEdit} type="button" className="btn" disabled={!editForm.title}>Save</button>
            <button onClick={cancelEdit} type="button" className="btn secondary">Cancel</button>
          </div>
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <table className="table">
          <thead><tr><th>Title</th><th>Location</th><th></th><th>Volunteers</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {getFilteredOpportunities().map((o:any)=>(<tr key={o.id}>
              <td data-label="Title">{o.title}</td>
              <td data-label="Location">{o.location}</td>
              <td data-label="Skill">{o.category_name}</td>
              <td data-label="Volunteers">{o.volunteers_registered}/{o.volunteers_needed}</td>
              <td data-label="Date">{o.date_needed ? new Date(o.date_needed).toLocaleDateString() : 'N/A'}</td>
              <td data-label="Status">{o.status}</td>
              <td data-label="Actions">
                <button className="btn secondary" onClick={()=>startEdit(o)}>Edit</button>
                <button className="btn ghost" onClick={()=>deleteOpportunity(o.id)}>Delete</button>
              </td>
            </tr>))}
          </tbody>
        </table>
      )}
    </div>
  );
}
