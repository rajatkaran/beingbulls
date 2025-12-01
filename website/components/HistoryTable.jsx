// website/components/HistoryTable.jsx
import React, { useEffect, useState } from "react";
const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function HistoryTable({ limit = 10 }){
  const [rows, setRows] = useState([]);
  useEffect(()=>{
    const token = localStorage.getItem("bb_token") || localStorage.getItem("token");
    if(!token) return;
    fetch(`${BACKEND}/scan/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setRows(d.history || []))
      .catch(()=>{});
  },[]);

  return (
    <div className="glass p-3">
      <table className="w-full text-sm">
        <thead className="text-left text-[#9fb0c0]">
          <tr><th>Date</th><th>Pattern</th><th>EMA</th><th>Confidence</th></tr>
        </thead>
        <tbody>
          {rows.length === 0 ? <tr><td colSpan="4" className="py-3">No scans yet</td></tr> :
            rows.slice(0,limit).map((r,i)=>(
              <tr key={i} className="border-t border-transparent">
                <td>{new Date(r.timestamp).toLocaleString()}</td>
                <td>{r.pattern || "-"}</td>
                <td>{r.emaConfirmed ? "✅" : "❌"}</td>
                <td>{Math.round(r.confidence || 0)}%</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}
