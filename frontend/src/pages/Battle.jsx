import { useState, useEffect } from "react";
import { api } from "../services/api";
import PokemonCard from "../components/PokemonCard";
import BattleArena from "../components/BattleArena";

export default function Battle() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPokemons, setSelectedPokemons] = useState([]);
  const [battleStarted, setBattleStarted] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    try {
      setLoading(true);
      const res = await api.get("/team/list");
      setTeams(res.data);
    } catch (err) {
      console.error("Failed to load teams:", err);
    } finally {
      setLoading(false);
    }
  }

  const handlePokemonSelect = (pokemon) => {
    if (selectedPokemons.length < 2 && !selectedPokemons.find(p => p.id === pokemon.id)) {
      setSelectedPokemons([...selectedPokemons, pokemon]);
    }
  };

  const handlePokemonDeselect = (pokemon) => {
    setSelectedPokemons(selectedPokemons.filter(p => p.id !== pokemon.id));
  };

  const startBattle = () => {
    if (selectedPokemons.length === 2) {
      setBattleStarted(true);
    }
  };

  if (battleStarted) {
    return <BattleArena pokemons={selectedPokemons} onBattleEnd={() => {
      setBattleStarted(false);
      setSelectedPokemons([]);
    }} />;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Choose Your Fighters</h1>
      
      {selectedPokemons.length > 0 && (
        <div className="mb-6 p-4 border rounded-lg shadow-md bg-gray-50">
          <h2 className="text-xl font-bold mb-2">Selected for Battle</h2>
          <div className="flex gap-4">
            {selectedPokemons.map(p => (
              <div key={p.id} className="text-center">
                <img src={p.image} alt={p.name} className="w-20 h-20 mx-auto" />
                <p className="capitalize font-semibold">{p.name}</p>
                <button onClick={() => handlePokemonDeselect(p)} className="text-xs bg-red-500 text-white px-2 py-1 rounded mt-1">Deselect</button>
              </div>
            ))}
          </div>
          {selectedPokemons.length === 2 && (
            <button onClick={startBattle} className="mt-4 w-full bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 transition-colors">
              Start Battle!
            </button>
          )}
        </div>
      )}

      {loading && <div>Loading teams...</div>}

      {!teams.length && !loading && (
        <div className="text-center text-gray-500">You have no teams. Go to "My Teams" to create one and add some Pokémon!</div>
      )}

      {teams.map((team) => (
        <div key={team.id} className="mb-8">
          <h2 className="text-2xl font-bold mb-3">{team.name}</h2>
          {team.pokemons.length === 0 ? (
            <p className="text-gray-500">This team is empty.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {team.pokemons.map((p) => (
                <div key={p.id} onClick={() => handlePokemonSelect(p)} className={`cursor-pointer p-2 rounded-lg transition-all ${selectedPokemons.find(sp => sp.id === p.id) ? 'ring-4 ring-blue-500' : 'hover:scale-105'}`}>
                  <PokemonCard pokemon={p} showFavoriteButton={false} />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}