import { useState, useEffect } from "react";
import { api } from "../services/api";
import BattleLogModal from "../components/BattleLogModal";

export default function BattleHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailedLog, setDetailedLog] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const handleLogClick = async (log) => {
    setSelectedLog(log);
    setIsModalLoading(true);
    try {
      const res = await api.get(`/battle/${log.id}`);
      
      // The API returns stats for pokemon1 and pokemon2. We need to map them
      // to the correct p1 and p2 based on the names in the log.
      const p1Name = res.data.pokemon1_name;
      const apiP1Stats = res.data.pokemon1_stats;
      const apiP2Stats = res.data.pokemon2_stats;

      let p1_stats, p2_stats;

      if (apiP1Stats.name.toLowerCase() === p1Name.toLowerCase()) {
        p1_stats = { 
          ...apiP1Stats, 
          maxHp: apiP1Stats.hp, 
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${apiP1Stats.id}.png`
        };
        p2_stats = { 
          ...apiP2Stats, 
          maxHp: apiP2Stats.hp, 
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${apiP2Stats.id}.png`
        };
      } else {
        p1_stats = { 
          ...apiP2Stats, 
          maxHp: apiP2Stats.hp, 
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${apiP2Stats.id}.png`
        };
        p2_stats = { 
          ...apiP1Stats, 
          maxHp: apiP1Stats.hp, 
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${apiP1Stats.id}.png`
        };
      }

      setDetailedLog({ ...res.data, p1_stats, p2_stats });
    } catch (err) {
      console.error("Failed to fetch battle details:", err);
      // Optionally, show an error to the user
    } finally {
      setIsModalLoading(false);
    }
  };

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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Battle History</h1>
      {logs.length === 0 ? (
        <p className="text-center text-gray-500">No battles have been recorded yet.</p>
      ) : (
        <div className="space-y-4">
          {logs.map(log => (
            <div 
              key={log.id} 
              className="p-4 border rounded-lg shadow-sm bg-white hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleLogClick(log)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    <span className="capitalize">{log.pokemon1_name}</span> vs <span className="capitalize">{log.pokemon2_name}</span>
                  </p>
                  <p>Winner: <span className="font-bold capitalize text-green-600">{log.winner_name}</span></p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedLog && (
        <BattleLogModal
          isOpen={!!selectedLog}
          onClose={() => { setSelectedLog(null); setDetailedLog(null); }}
          battleData={detailedLog}
          isLoading={isModalLoading}
        />
      )}
    </div>
  );
}