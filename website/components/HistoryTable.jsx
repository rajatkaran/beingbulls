import React from "react";

const HistoryTable = ({ history }) => {
  return (
    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl shadow-md overflow-x-auto mt-6">
      <h2 className="text-xl font-semibold mb-4 text-white">📜 Scan History</h2>
      <table className="min-w-full border border-white/20 rounded-xl overflow-hidden">
        <thead className="bg-white/10 text-white text-sm">
          <tr>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Pattern</th>
            <th className="px-4 py-2 text-left">Timeframe</th>
            <th className="px-4 py-2 text-left">Result</th>
          </tr>
        </thead>
        <tbody className="text-sm text-white/90">
          {history && history.length > 0 ? (
            history.map((item, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? "bg-white/5" : "bg-white/10"
                } hover:bg-white/20 transition duration-150`}
              >
                <td className="px-4 py-2">{item.date || "N/A"}</td>
                <td className="px-4 py-2">{item.pattern || "N/A"}</td>
                <td className="px-4 py-2">{item.timeframe || "N/A"}</td>
                <td className="px-4 py-2">
                  {item.result ? (
                    <span className="text-green-400 font-medium">✔ Success</span>
                  ) : (
                    <span className="text-red-400 font-medium">✖ Failed</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center px-4 py-4 text-white/70">
                No scan history available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTable;
