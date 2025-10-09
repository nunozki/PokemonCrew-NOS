import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import PokemonCard from "../components/PokemonCard";

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

function TeamSelection({ teams, pokemon1, pokemon2, onSelectPokemon }) {
  const getPokemonCardClassName = (pokemon, teamId) => {
    if (pokemon1?.pokemon.id === pokemon.id || pokemon2?.pokemon.id === pokemon.id) {
      return "border-4 border-blue-500 ring-4 ring-blue-200";
    }
    if (pokemon1 && pokemon1.teamId === teamId && !pokemon2) {
      return "opacity-50 cursor-not-allowed";
    }
    return "cursor-pointer hover:scale-105 transition-transform";
  };

  return teams.map((team) => (
    <div key={team.id} className="space-y-4 mb-8 p-4 border rounded-lg shadow-md bg-gray-50">
      <h2 className="text-xl font-bold text-gray-800">{team.name}</h2>
      {team.pokemons.length === 0 ? (
        <p className="text-gray-500">This team is empty.</p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {team.pokemons.map((p) => (
            <li key={p.id} onClick={() => onSelectPokemon(p, team.id)}>
              <PokemonCard
                pokemon={p}
                showFavoriteButton={false}
                className={getPokemonCardClassName(p, team.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  ));
}

export default function Battle() {
  const [teams, setTeams] = useState([]);
  const [pokemon1, setPokemon1] = useState(null); // { pokemon, teamId }
  const [pokemon2, setPokemon2] = useState(null); // { pokemon, teamId }
  const [battleResult, setBattleResult] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [displayedLog, setDisplayedLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [p1Stats, setP1Stats] = useState(null);
  const [p2Stats, setP2Stats] = useState(null);
  const [attacking, setAttacking] = useState(null); // 'p1' or 'p2'

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await api.get("/team/");
        setTeams(response.data);
      } catch (err) { console.error("Failed to fetch teams", err); }
    };
    fetchTeams();
  }, []);


  useEffect(() => {
    if (battleLog.length > displayedLog.length) {
      const timer = setTimeout(() => {
        const currentLogEntry = battleLog[displayedLog.length];
        setDisplayedLog((prev) => [...prev, currentLogEntry]);
        
        // Update HP based on the log
        if (currentLogEntry.includes("attacks")) {
          const attackerName = currentLogEntry.split(" ")[0];
          if (p1Stats && attackerName.toLowerCase() === p1Stats.name.toLowerCase()) {
            setAttacking('p1');
          } else if (p2Stats && attackerName.toLowerCase() === p2Stats.name.toLowerCase()) {
            setAttacking('p2');
          }
        }
        if (currentLogEntry.includes("damage")) {
          const parts = currentLogEntry.split(" ");
          const targetName = parts[2];
          const damage = parseInt(parts[4]);

          if (p1Stats && targetName.toLowerCase() === p1Stats.name.toLowerCase()) {
            setP1Stats(prevStats => ({ ...prevStats, hp: prevStats.hp - damage }));
          }
          if (p2Stats && targetName.toLowerCase() === p2Stats.name.toLowerCase()) {
            setP2Stats(prevStats => ({ ...prevStats, hp: prevStats.hp - damage }));
          }
        }
        if (currentLogEntry.includes("remaining")) {
          // Reset attacker after damage is shown
          setAttacking(null);
        }

      }, 1000); // 1-second delay between log entries
      return () => clearTimeout(timer);
    }
  }, [battleLog, displayedLog, p1Stats, p2Stats]);

  const handleBattle = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setBattleResult(null);
    setBattleLog([]);
    setDisplayedLog([]);
    setP1Stats(null);
    setP2Stats(null);

    try {
      const response = await api.post("/battle/", [pokemon1.pokemon.name, pokemon2.pokemon.name]);
      const { log, p1_stats, p2_stats } = response.data;
      
      // Find which stats belong to which pokemon
      if (p1_stats.name.toLowerCase() === pokemon1.pokemon.name.toLowerCase()) {
        setP1Stats({ ...p1_stats, maxHp: p1_stats.hp, image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p1_stats.id}.png` });
        setP2Stats({ ...p2_stats, maxHp: p2_stats.hp, image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p2_stats.id}.png` });
      } else {
        setP1Stats({ ...p2_stats, maxHp: p2_stats.hp, image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p2_stats.id}.png` });
        setP2Stats({ ...p1_stats, maxHp: p1_stats.hp, image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p1_stats.id}.png` });
      }

      setBattleLog(log);
      setBattleResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred during the battle.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPokemon = useCallback(
    (pokemon, teamId) => {
      if (battleResult) return; // Don't select if battle is over

      // Deselect logic
      if (pokemon1 && pokemon1.pokemon.id === pokemon.id) {
        setPokemon1(null);
        setPokemon2(null); // Also clear pokemon2 if pokemon1 is deselected
        return;
      }
      if (pokemon2 && pokemon2.pokemon.id === pokemon.id) {
        setPokemon2(null);
        return;
      }

      // Select logic
      if (!pokemon1) {
        setPokemon1({ pokemon, teamId });
      } else if (!pokemon2 && pokemon1.teamId !== teamId) {
        setPokemon2({ pokemon, teamId });
      } else if (pokemon1.teamId === teamId) {
        // Replace selection in the same team
        setPokemon1({ pokemon, teamId });
      } else if (pokemon2 && pokemon2.teamId === teamId) {
        // Replace selection in the other team
        setPokemon2({ pokemon, teamId });
      }
    },
    [battleResult, pokemon1, pokemon2]
  );

  if (teams.length < 2) {
    return <div className="text-center">You need at least two teams with Pokémon to battle.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Pokémon Battle</h1>

      {!battleResult && (
        <div className="mb-6 text-center text-gray-600">
          <p>Select one Pokémon from a team, then select another Pokémon from a different team.</p>
          <p className="font-semibold">
            {pokemon1 ? `Pokémon 1: ${pokemon1.pokemon.name}` : "Select Pokémon 1"}
            {pokemon1 && (pokemon2 ? ` vs Pokémon 2: ${pokemon2.pokemon.name}` : " | Select Pokémon 2 from another team")}
          </p>
        </div>
      )}

      {pokemon1 && pokemon2 && !battleResult && (
        <form onSubmit={handleBattle} className="text-center mb-6">
          <button type="submit" disabled={isLoading} className="bg-red-500 text-white py-2 px-6 rounded-lg text-xl font-bold hover:bg-red-600 disabled:bg-gray-400 transition-all">
            {isLoading ? "Battling..." : "Start Battle!"}
          </button>
        </form>
      )}

      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      {battleResult && !isLoading && displayedLog.length === battleLog.length && (
        <div className="text-center my-4 p-4 bg-green-100 border border-green-400 rounded-lg">
          <h2 className="text-2xl font-bold text-green-800">Winner: {battleResult.winner}</h2>
        </div>
      )}

      {/* Add TeamSelection component and pass handleSelectPokemon */}
      <TeamSelection
        teams={teams}
        pokemon1={pokemon1}
        pokemon2={pokemon2}
        onSelectPokemon={handleSelectPokemon}
      />

      {p1Stats && p2Stats && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4">
            <img src={p1Stats.image} alt={p1Stats.name} className={`w-24 h-24 transition-transform duration-300 ${attacking === 'p1' ? '-translate-y-2' : ''}`} />
            <div className="flex-1">
              <HealthBar currentHp={p1Stats.hp} maxHp={p1Stats.maxHp} name={p1Stats.name} />
            </div>
          </div>
          <div className="flex items-center gap-4 justify-end">
            <div className="flex-1">
              <HealthBar currentHp={p2Stats.hp} maxHp={p2Stats.maxHp} name={p2Stats.name} />
            </div>
            <img src={p2Stats.image} alt={p2Stats.name} className={`w-24 h-24 transition-transform duration-300 ${attacking === 'p2' ? '-translate-y-2' : ''}`} />
          </div>
        </div>
      )}

      {displayedLog.length > 0 && (
        <div className="bg-gray-800 text-white p-4 rounded-lg font-mono h-64 overflow-y-auto">
          {displayedLog.map((line, index) => (
            <p key={index} className="animate-fade-in">{`> ${line}`}</p>
          ))}
        </div>
      )}
    </div>
  );
}