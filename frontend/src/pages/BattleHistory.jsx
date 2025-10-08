import { useState, useEffect } from "react";
import { api } from "../services/api";

export default function BattleHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/battle/");
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch battle logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return <div>Loading battle history...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Battle History</h1>
      {logs.length === 0 ? (
        <p className="text-center text-gray-500">No battles have been recorded yet.</p>
      ) : (
        <div className="space-y-4">
          {logs.map(log => (
            <div key={log.id} className="p-4 border rounded-lg shadow-sm bg-white">
              <p className="font-semibold">
                <span className="capitalize">{log.pokemon1_name}</span> vs <span className="capitalize">{log.pokemon2_name}</span>
              </p>
              <p>Winner: <span className="font-bold capitalize text-green-600">{log.winner_name}</span></p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(log.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}