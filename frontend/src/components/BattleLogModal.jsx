import { useState, useEffect } from "react";

function HealthBar({ currentHp, maxHp, name }) {
  const percentage = Math.max(0, (currentHp / maxHp) * 100);
  let barColor = "bg-green-500";
  if (percentage < 50) barColor = "bg-yellow-500";
  if (percentage < 20) barColor = "bg-red-500";

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="font-bold capitalize">{name}</span>
        <span>{Math.max(0, currentHp)} / {maxHp} HP</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-6">
        <div
          className={`${barColor} h-6 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

export default function BattleLogModal({ isOpen, onClose, battleData, isLoading }) {
  const [p1Stats, setP1Stats] = useState(null);
  const [p2Stats, setP2Stats] = useState(null);
  const [displayedLog, setDisplayedLog] = useState([]);

  useEffect(() => {
    if (battleData) {
      setP1Stats(battleData.p1_stats);
      setP2Stats(battleData.p2_stats);
      setDisplayedLog([]);
    }
  }, [battleData]);

  useEffect(() => {
    if (!battleData || displayedLog.length >= battleData.log.length) {
      return;
    }

    const timer = setTimeout(() => {
      const currentLogEntry = battleData.log[displayedLog.length];
      setDisplayedLog((prev) => [...prev, currentLogEntry]);

      if (currentLogEntry.includes("damage")) {
        const parts = currentLogEntry.split(" ");
        const targetName = parts[2];
        const damage = parseInt(parts[4]);

        if (p1Stats && targetName.toLowerCase() === p1Stats.name.toLowerCase()) {
          setP1Stats(prev => ({ ...prev, hp: prev.hp - damage }));
        }
        if (p2Stats && targetName.toLowerCase() === p2Stats.name.toLowerCase()) {
          setP2Stats(prev => ({ ...prev, hp: prev.hp - damage }));
        }
      }
    }, 700); // Delay for log animation

    return () => clearTimeout(timer);
  }, [battleData, displayedLog, p1Stats, p2Stats]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Battle Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <div className="overflow-y-auto flex-grow">
          {isLoading ? (
            <p>Loading details...</p>
          ) : !battleData || !p1Stats || !p2Stats ? (
            <p>Could not load battle details.</p>
          ) : (
            <>
              <div className="text-center mb-4">
                <p className="text-xl font-bold">
                  <span className="capitalize">{battleData.pokemon1_name}</span> vs <span className="capitalize">{battleData.pokemon2_name}</span>
                </p>
                <p className="text-lg">Winner: <span className="font-bold capitalize text-green-600">{battleData.winner_name}</span></p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4">
                  <img src={p1Stats.image} alt={p1Stats.name} className="w-20 h-20" />
                  <div className="flex-1">
                    <HealthBar currentHp={p1Stats.hp} maxHp={p1Stats.maxHp} name={p1Stats.name} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex-1">
                    <HealthBar currentHp={p2Stats.hp} maxHp={p2Stats.maxHp} name={p2Stats.name} />
                  </div>
                  <img src={p2Stats.image} alt={p2Stats.name} className="w-20 h-20" />
                </div>
              </div>

              <div className="bg-gray-800 text-white p-4 rounded-lg font-mono h-64 overflow-y-auto">
                {displayedLog.map((line, index) => (
                  <p key={index} className="animate-fade-in">{`> ${line}`}</p>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
