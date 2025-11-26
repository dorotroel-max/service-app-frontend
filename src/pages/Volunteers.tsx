// import React, { useEffect, useState } from "react";
// import { api } from "../api";

// export default function Volunteers() {
//   const [volunteers, setVolunteers] = useState<any[]>([]);
//   const [opportunities, setOpportunities] = useState<any[]>([]);
//   const [selectedVolunteer, setSelectedVolunteer] = useState<any | null>(null);
//   const [volunteerOpportunities, setVolunteerOpportunities] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState("");
//   const [searchName, setSearchName] = useState("");
//   const [filterSkill, setFilterSkill] = useState("");
//   const [allSkills, setAllSkills] = useState<any[]>([]);

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     try {
//       setLoading(true);
//       const [vRes, oRes, sRes] = await Promise.all([
//         api.get("/api/v1/volunteers"),
//         api.get("/api/v1/opportunities?status=open"),
//         api.get("/api/v1/skills")
//       ]);
//       setVolunteers(vRes.data);
//       setOpportunities(oRes.data);
//       setAllSkills(sRes.data);
//     } catch (err: any) {
//       console.error(err);
//       setMessage("Failed to load volunteers");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getFilteredVolunteers = () => {
//     return volunteers.filter(v => {
//       if (searchName && !v.full_name?.toLowerCase().includes(searchName.toLowerCase())) return false;
//       if (filterSkill && selectedVolunteer?.skills && !selectedVolunteer.skills.some((s: any) => s.skill_id === parseInt(filterSkill))) return false;
//       return true;
//     });
//   };

//   const getSuggestedOpportunities = () => {
//     if (!selectedVolunteer?.skills || selectedVolunteer.skills.length === 0) {
//       return opportunities;
//     }
//     const volunteerSkillIds = selectedVolunteer.skills.map((s: any) => s.skill_id);
//     return opportunities.sort((a: any, b: any) => {
//       const aHasSkill = a.category_id && volunteerSkillIds.includes(a.category_id) ? 1 : 0;
//       const bHasSkill = b.category_id && volunteerSkillIds.includes(b.category_id) ? 1 : 0;
//       return bHasSkill - aHasSkill;
//     });
//   };

//   const loadVolunteerDetails = async (volunteerId: number) => {
//     try {
//       const [volRes, oppRes] = await Promise.all([
//         api.get(`/api/v1/volunteers/${volunteerId}`),
//         api.get(`/api/v1/volunteers/${volunteerId}/opportunities`)
//       ]);
//       setSelectedVolunteer(volRes.data);
//       setVolunteerOpportunities(oppRes.data);
//     } catch (err: any) {
//       console.error(err);
//       setMessage("Failed to load volunteer details");
//     }
//   };

//   const registerVolunteer = async (opportunityId: number) => {
//     if (!selectedVolunteer) return;
//     try {
//       await api.post(`/api/v1/volunteers/${selectedVolunteer.id}/register`, { opportunity_id: opportunityId });
//       await loadVolunteerDetails(selectedVolunteer.id);
//       setMessage("Successfully registered for opportunity");
//       setTimeout(() => setMessage(""), 3000);
//     } catch (err: any) {
//       setMessage(err?.response?.data?.error || "Failed to register");
//     }
//   };

//   const unregisterVolunteer = async (registrationId: number) => {
//     if (!selectedVolunteer) return;
//     try {
//       await api.delete(`/api/v1/volunteers/${selectedVolunteer.id}/register/${registrationId}`);
//       await loadVolunteerDetails(selectedVolunteer.id);
//       setMessage("Successfully unregistered from opportunity");
//       setTimeout(() => setMessage(""), 3000);
//     } catch (err: any) {
//       setMessage(err?.response?.data?.error || "Failed to unregister");
//     }
//   };

//   if (loading) return <p>Loading...</p>;

//   return (
//     <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
//       <div style={{ borderRight: "1px solid #e6e9ef", paddingRight: 20 }}>
//         <h4 style={{ marginTop: 0 }}>Volunteers</h4>
//         <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
//           <input
//             type="text"
//             placeholder="Search by name..."
//             value={searchName}
//             onChange={e => setSearchName(e.target.value)}
//           />
//           <select value={filterSkill} onChange={e => setFilterSkill(e.target.value)}>
//             <option value="">All Skills</option>
//             {allSkills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
//           </select>
//         </div>
//         <div style={{ display: "grid", gap: 8 }}>
//           {getFilteredVolunteers().map(vol => (
//             <div
//               key={vol.id}
//               onClick={() => loadVolunteerDetails(vol.id)}
//               style={{
//                 padding: 12,
//                 borderRadius: 8,
//                 background: selectedVolunteer?.id === vol.id ? "#dbeafe" : "#f3f4f6",
//                 cursor: "pointer",
//                 border: selectedVolunteer?.id === vol.id ? "2px solid #0284c7" : "1px solid #e5e7eb"
//               }}
//             >
//               <div style={{ fontWeight: "bold", fontSize: 14 }}>{vol.full_name || "Unnamed"}</div>
//               <div style={{ fontSize: 12, color: "#6b7280" }}>{vol.total_hours} hours</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div>
//         {selectedVolunteer ? (
//           <>
//             <h3 style={{ marginTop: 0 }}>{selectedVolunteer.full_name || "Volunteer"}</h3>
            
//             {message && (
//               <div
//                 style={{
//                   padding: 10,
//                   marginBottom: 12,
//                   borderRadius: 8,
//                   background: message.includes("Success") ? "#d1fae5" : "#fee2e2",
//                   color: message.includes("Success") ? "#065f46" : "#7f1d1d",
//                   fontSize: 13
//                 }}
//               >
//                 {message}
//               </div>
//             )}

//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
//               <div>
//                 <h4>Profile</h4>
//                 <div style={{ padding: 12, background: "#fbfdff", borderRadius: 8, border: "1px solid #e6e9ef" }}>
//                   <div style={{ marginBottom: 12 }}>
//                     <div style={{ fontSize: 12, color: "#6b7280" }}>Total Hours Volunteered</div>
//                     <div style={{ fontSize: 18, fontWeight: "bold", color: "#0f172a" }}>{selectedVolunteer.total_hours}</div>
//                   </div>
//                   <div style={{ marginBottom: 12 }}>
//                     <div style={{ fontSize: 12, color: "#6b7280" }}>Phone</div>
//                     <div style={{ fontSize: 14 }}>{selectedVolunteer.phone || "Not set"}</div>
//                   </div>
//                   <div>
//                     <div style={{ fontSize: 12, color: "#6b7280" }}>Address</div>
//                     <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{selectedVolunteer.address || "Not set"}</div>
//                   </div>
//                 </div>

//                 {selectedVolunteer.skills && selectedVolunteer.skills.length > 0 && (
//                   <>
//                     <h4>Skills</h4>
//                     <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
//                       {selectedVolunteer.skills.map((skill: any) => (
//                         <div
//                           key={skill.id}
//                           style={{
//                             padding: "6px 12px",
//                             background: "#dbeafe",
//                             borderRadius: 20,
//                             color: "#0c4a6e",
//                             fontSize: 13
//                           }}
//                         >
//                           {skill.name}
//                         </div>
//                       ))}
//                     </div>
//                   </>
//                 )}
//               </div>

//               <div>
//                 <h4>Opportunities</h4>
//                 <div style={{ display: "grid", gap: 8, maxHeight: "400px", overflowY: "auto" }}>
//                   {volunteerOpportunities.length > 0 ? (
//                     <>
//                       <div>
//                         <h5 style={{ marginTop: 0, marginBottom: 8 }}>Registered For</h5>
//                         {volunteerOpportunities
//                           .filter((opp: any) => opp.status === "registered")
//                           .map((opp: any) => (
//                             <div
//                               key={opp.id}
//                               style={{
//                                 padding: 10,
//                                 background: "#ecfdf5",
//                                 borderRadius: 6,
//                                 borderLeft: "3px solid #10b981",
//                                 marginBottom: 8,
//                                 display: "flex",
//                                 justifyContent: "space-between",
//                                 alignItems: "center"
//                               }}
//                             >
//                               <div>
//                                 <div style={{ fontWeight: "bold", fontSize: 13 }}>{opp.title}</div>
//                                 <div style={{ fontSize: 12, color: "#6b7280" }}>
//                                   {opp.hours_contributed} hours | {new Date(opp.date_needed).toLocaleDateString()}
//                                 </div>
//                               </div>
//                               <button
//                                 onClick={() => unregisterVolunteer(opp.id)}
//                                 className="btn ghost"
//                                 style={{ padding: "4px 8px", fontSize: 12 }}
//                               >
//                                 Remove
//                               </button>
//                             </div>
//                           ))}
//                       </div>
//                       <div>
//                         <h5 style={{ marginTop: 0, marginBottom: 8 }}>Available To Join</h5>
//                         {getSuggestedOpportunities()
//                           .filter((opp: any) => !volunteerOpportunities.some((v: any) => v.opportunity_id === opp.id))
//                           .map((opp: any) => {
//                             const hasMatchingSkill = selectedVolunteer?.skills?.some((s: any) => s.skill_id === opp.category_id);
//                             return (
//                               <div
//                                 key={opp.id}
//                                 style={{
//                                   padding: 10,
//                                   background: hasMatchingSkill ? "#f0fdf4" : "#f0f9ff",
//                                   borderRadius: 6,
//                                   borderLeft: hasMatchingSkill ? "3px solid #10b981" : "3px solid #0284c7",
//                                   marginBottom: 8,
//                                   display: "flex",
//                                   justifyContent: "space-between",
//                                   alignItems: "center",
//                                   position: "relative"
//                                 }}
//                               >
//                                 {hasMatchingSkill && (
//                                   <div style={{ position: "absolute", top: 4, right: 4, fontSize: 12, color: "#10b981", fontWeight: "bold" }}>⭐</div>
//                                 )}
//                                 <div>
//                                   <div style={{ fontWeight: "bold", fontSize: 13 }}>{opp.title}</div>
//                                   <div style={{ fontSize: 12, color: "#6b7280" }}>
//                                     {opp.volunteers_registered}/{opp.volunteers_needed} volunteers
//                                   </div>
//                                 </div>
//                                 {opp.volunteers_registered < opp.volunteers_needed && (
//                                   <button
//                                     onClick={() => registerVolunteer(opp.id)}
//                                     className="btn"
//                                     style={{ padding: "4px 8px", fontSize: 12 }}
//                                   >
//                                     Join
//                                   </button>
//                                 )}
//                               </div>
//                             );
//                           })}
//                       </div>
//                     </>
//                   ) : (
//                     <p style={{ color: "#6b7280" }}>Not registered for any opportunities yet</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </>
//         ) : (
//           <div style={{ color: "#6b7280", textAlign: "center", padding: 40 }}>
//             Select a volunteer to view details
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Volunteers() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<any | null>(null);
  const [volunteerOpportunities, setVolunteerOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchName, setSearchName] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [allSkills, setAllSkills] = useState<any[]>([]);

  // State for adding a new volunteer
  const [newVolunteer, setNewVolunteer] = useState({
    full_name: "",
    phone: "",
    address: "",
    skills: [] as number[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vRes, oRes, sRes] = await Promise.all([
        api.get("/api/v1/volunteers"),
        api.get("/api/v1/opportunities?status=open"),
        api.get("/api/v1/skills")
      ]);
      setVolunteers(vRes.data);
      setOpportunities(oRes.data);
      setAllSkills(sRes.data);
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to load volunteers");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredVolunteers = () => {
    return volunteers.filter(v => {
      if (searchName && !v.full_name?.toLowerCase().includes(searchName.toLowerCase())) return false;
      if (filterSkill && selectedVolunteer?.skills && !selectedVolunteer.skills.some((s: any) => s.skill_id === parseInt(filterSkill))) return false;
      return true;
    });
  };

  const getSuggestedOpportunities = () => {
    if (!selectedVolunteer?.skills || selectedVolunteer.skills.length === 0) {
      return opportunities;
    }
    const volunteerSkillIds = selectedVolunteer.skills.map((s: any) => s.skill_id);
    return opportunities.sort((a: any, b: any) => {
      const aHasSkill = a.category_id && volunteerSkillIds.includes(a.category_id) ? 1 : 0;
      const bHasSkill = b.category_id && volunteerSkillIds.includes(b.category_id) ? 1 : 0;
      return bHasSkill - aHasSkill;
    });
  };

  const loadVolunteerDetails = async (volunteerId: number) => {
    try {
      const [volRes, oppRes] = await Promise.all([
        api.get(`/api/v1/volunteers/${volunteerId}`),
        api.get(`/api/v1/volunteers/${volunteerId}/opportunities`)
      ]);
      setSelectedVolunteer(volRes.data);
      setVolunteerOpportunities(oppRes.data);
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to load volunteer details");
    }
  };

  const registerVolunteer = async (opportunityId: number) => {
    if (!selectedVolunteer) return;
    try {
      await api.post(`/api/v1/volunteers/${selectedVolunteer.id}/register`, { opportunity_id: opportunityId });
      await loadVolunteerDetails(selectedVolunteer.id);
      setMessage("Successfully registered for opportunity");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setMessage(err?.response?.data?.error || "Failed to register");
    }
  };

  const unregisterVolunteer = async (registrationId: number) => {
    if (!selectedVolunteer) return;
    try {
      await api.delete(`/api/v1/volunteers/${selectedVolunteer.id}/register/${registrationId}`);
      await loadVolunteerDetails(selectedVolunteer.id);
      setMessage("Successfully unregistered from opportunity");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setMessage(err?.response?.data?.error || "Failed to unregister");
    }
  };

  const addVolunteer = async () => {
    try {
      const res = await api.post("/api/v1/volunteers", newVolunteer);
      setVolunteers([...volunteers, res.data]);
      setNewVolunteer({ full_name: "", phone: "", address: "", skills: [] });
      setMessage("Volunteer added successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      console.error(err);
      setMessage(err?.response?.data?.error || "Failed to add volunteer");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
      {/* Sidebar - Volunteer List + Add Volunteer Form */}
      <div style={{ borderRight: "1px solid #e6e9ef", paddingRight: 20 }}>
        <h4 style={{ marginTop: 0 }}>Volunteers</h4>

        {/* Add Volunteer Form */}
        <div style={{ marginBottom: 20, padding: 12, border: "1px solid #e5e7eb", borderRadius: 8 }}>
          <h5>Add New Volunteer</h5>
          <input
            type="text"
            placeholder="Full Name"
            value={newVolunteer.full_name}
            onChange={e => setNewVolunteer({ ...newVolunteer, full_name: e.target.value })}
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          />
          <input
            type="text"
            placeholder="Phone"
            value={newVolunteer.phone}
            onChange={e => setNewVolunteer({ ...newVolunteer, phone: e.target.value })}
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          />
          <textarea
            placeholder="Address"
            value={newVolunteer.address}
            onChange={e => setNewVolunteer({ ...newVolunteer, address: e.target.value })}
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          />
          <select
            multiple
            value={newVolunteer.skills.map(String)}
            onChange={e =>
              setNewVolunteer({
                ...newVolunteer,
                skills: Array.from(e.target.selectedOptions).map(o => parseInt(o.value))
              })
            }
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          >
            {allSkills.map(skill => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
          <button onClick={addVolunteer} style={{ padding: "6px 12px", cursor: "pointer" }}>
            Add Volunteer
          </button>
        </div>

        {/* Search and Filter */}
        <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
          />
          <select value={filterSkill} onChange={e => setFilterSkill(e.target.value)}>
            <option value="">All Skills</option>
            {allSkills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Volunteer List */}
        <div style={{ display: "grid", gap: 8 }}>
          {getFilteredVolunteers().map(vol => (
            <div
              key={vol.id}
              onClick={() => loadVolunteerDetails(vol.id)}
              style={{
                padding: 12,
                borderRadius: 8,
                background: selectedVolunteer?.id === vol.id ? "#dbeafe" : "#f3f4f6",
                cursor: "pointer",
                border: selectedVolunteer?.id === vol.id ? "2px solid #0284c7" : "1px solid #e5e7eb"
              }}
            >
              <div style={{ fontWeight: "bold", fontSize: 14 }}>{vol.full_name || "Unnamed"}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{vol.total_hours} hours</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - Volunteer Details */}
      <div>
        {selectedVolunteer ? (
          <>
            <h3 style={{ marginTop: 0 }}>{selectedVolunteer.full_name || "Volunteer"}</h3>

            {message && (
              <div
                style={{
                  padding: 10,
                  marginBottom: 12,
                  borderRadius: 8,
                  background: message.includes("success") ? "#d1fae5" : "#fee2e2",
                  color: message.includes("success") ? "#065f46" : "#7f1d1d",
                  fontSize: 13
                }}
              >
                {message}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Profile & Skills */}
              <div>
                <h4>Profile</h4>
                <div style={{ padding: 12, background: "#fbfdff", borderRadius: 8, border: "1px solid #e6e9ef" }}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>Total Hours Volunteered</div>
                    <div style={{ fontSize: 18, fontWeight: "bold", color: "#0f172a" }}>{selectedVolunteer.total_hours}</div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>Phone</div>
                    <div style={{ fontSize: 14 }}>{selectedVolunteer.phone || "Not set"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>Address</div>
                    <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{selectedVolunteer.address || "Not set"}</div>
                  </div>
                </div>

                {selectedVolunteer.skills?.length > 0 && (
                  <>
                    <h4>Skills</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {selectedVolunteer.skills.map((skill: any) => (
                        <div key={skill.id} style={{ padding: "6px 12px", background: "#dbeafe", borderRadius: 20, color: "#0c4a6e", fontSize: 13 }}>
                          {skill.name}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Opportunities */}
              <div>
                <h4>Opportunities</h4>
                <div style={{ display: "grid", gap: 8, maxHeight: "400px", overflowY: "auto" }}>
                  {volunteerOpportunities.length > 0 ? (
                    <>
                      <div>
                        <h5 style={{ marginTop: 0, marginBottom: 8 }}>Registered For</h5>
                        {volunteerOpportunities
                          .filter((opp: any) => opp.status === "registered")
                          .map((opp: any) => (
                            <div key={opp.id} style={{ padding: 10, background: "#ecfdf5", borderRadius: 6, borderLeft: "3px solid #10b981", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <div style={{ fontWeight: "bold", fontSize: 13 }}>{opp.title}</div>
                                <div style={{ fontSize: 12, color: "#6b7280" }}>{opp.hours_contributed} hours | {new Date(opp.date_needed).toLocaleDateString()}</div>
                              </div>
                              <button onClick={() => unregisterVolunteer(opp.id)} style={{ padding: "4px 8px", fontSize: 12 }}>Remove</button>
                            </div>
                          ))}
                      </div>

                      <div>
                        <h5 style={{ marginTop: 0, marginBottom: 8 }}>Available To Join</h5>
                        {getSuggestedOpportunities()
                          .filter((opp: any) => !volunteerOpportunities.some((v: any) => v.opportunity_id === opp.id))
                          .map((opp: any) => {
                            const hasMatchingSkill = selectedVolunteer?.skills?.some((s: any) => s.skill_id === opp.category_id);
                            return (
                              <div key={opp.id} style={{ padding: 10, background: hasMatchingSkill ? "#f0fdf4" : "#f0f9ff", borderRadius: 6, borderLeft: hasMatchingSkill ? "3px solid #10b981" : "3px solid #0284c7", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
                                {hasMatchingSkill && <div style={{ position: "absolute", top: 4, right: 4, fontSize: 12, color: "#10b981", fontWeight: "bold" }}>⭐</div>}
                                <div>
                                  <div style={{ fontWeight: "bold", fontSize: 13 }}>{opp.title}</div>
                                  <div style={{ fontSize: 12, color: "#6b7280" }}>{opp.volunteers_registered}/{opp.volunteers_needed} volunteers</div>
                                </div>
                                {opp.volunteers_registered < opp.volunteers_needed && (
                                  <button onClick={() => registerVolunteer(opp.id)} style={{ padding: "4px 8px", fontSize: 12 }}>Join</button>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </>
                  ) : (
                    <p style={{ color: "#6b7280" }}>Not registered for any opportunities yet</p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ color: "#6b7280", textAlign: "center", padding: 40 }}>Select a volunteer to view details</div>
        )}
      </div>
    </div>
  );
}
