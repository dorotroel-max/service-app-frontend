import React, { useState } from "react";
import { api } from "../api";

export default function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/v1/auth/login", { username, password });
      onLogin(res.data.token);
    } catch (err: any) {
      // show more detailed error to help debugging (network errors, server messages)
      const serverMsg = err?.response?.data?.error;
      const status = err?.response?.status;
      const fallback = err?.message || JSON.stringify(err);
      setError(serverMsg ? `${serverMsg}${status ? ` (status ${status})` : ""}` : fallback || "Login failed");
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth:420, margin: '36px auto', padding:20, borderRadius:12, boxShadow:'0 10px 30px rgba(2,6,23,0.06)', background:'#fff' }}>
      <h3 style={{ marginTop:0, marginBottom:6 }}>Sign in</h3>
      <div style={{ color:'#6b7280', marginBottom:16 }}>Welcome to Community Service Hub — login to view and manage volunteer opportunities.</div>

      <div style={{ display:'grid', gap:10 }}>
        <div>
          <label style={{ display:'block', fontSize:12, color:'#6b7280', marginBottom:6 }}>Username</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="username" />
        </div>

        <div>
          <label style={{ display:'block', fontSize:12, color:'#6b7280', marginBottom:6 }}>Password</label>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <input
              value={password}
              onChange={e=>setPassword(e.target.value)}
              placeholder="password"
              type={showPassword ? 'text' : 'password'}
              style={{ flex:1 }}
            />
            <button
              type="button"
              onClick={()=>setShowPassword(s=>!s)}
              className="btn secondary"
              aria-pressed={showPassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >{showPassword ? 'Hide' : 'Show'}</button>
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:6 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <input id="remember" type="checkbox" />
            <label htmlFor="remember" style={{ fontSize:13, color:'#6b7280' }}>Remember me</label>
          </div>
          <a className="link" style={{ fontSize:13 }}>Forgot?</a>
        </div>

        <div>
          <button type="submit" className="btn" style={{ width:'100%' }}>Sign in</button>
        </div>
      </div>

      {error && <div style={{color:'red', marginTop:12, fontSize:13}}>{error}</div>}
    </form>
  );
}
