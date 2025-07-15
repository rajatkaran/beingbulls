// ✅ pages/dashboard.jsx
import React from "react";
import HistoryTable from "../components/HistoryTable";

const Dashboard = () => {
  return (
    <div className="py-32 px-8">
      <h2 className="text-3xl font-bold mb-6">📊 Your Scan History</h2>
      <HistoryTable />
    </div>
  );
};

export default Dashboard;
