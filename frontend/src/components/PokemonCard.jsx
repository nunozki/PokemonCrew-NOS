import { useState, useEffect } from "react";
import { api } from "../services/api";

export default function PokemonCard({ pokemon: p, teams, onUpdate, onClick, onRemove, showFavoriteButton = true }) {
    const [pokemon, setPokemon] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showTeams, setShowTeams] = useState(false);
  
    useEffect(() => {
      async function loadPokemonDetails() {
        if (p.url) {
          // The URL from PokeAPI is absolute, so we don't want axios to prepend the baseURL.
          // We can create a temporary instance or just use fetch.
          // Or, we can just get the ID and call our own API.
          const id = p.url.split('/').filter(Boolean).pop();
          const res = await api.get(`/pokemon/${id}`);
          setPokemon(res.data);
        } else {
          setPokemon(p);
        }
      }
      loadPokemonDetails();
    }, [p]);

    useEffect(() => {
      if (teams && pokemon) {
        const favorite = teams.some(t => t.pokemons.some(p => p.name === pokemon.name));
        setIsFavorite(favorite);
      }
    }, [teams, pokemon]);
  
    async function handleFavoriteClick(e) {
      e.stopPropagation();
      if (isFavorite) {
        // If it's already a favorite, just remove it. No need to show team selection.
        if (showTeams) {
          setShowTeams(false);
        }
        await removeFromTeam();
      } else {
        if (teams.length === 0) {
          alert("You need to create a team first on the 'My Teams' page.");
          return;
        }
        if (teams.length === 1) {
          await addToTeam(teams[0].id);
        } else {
          setShowTeams(true);
        }
      }
    }

    async function addToTeam(teamId) {
      setShowTeams(false);
      setLoading(true);
      try {
        await api.post(`/team/${teamId}/add`, { name: pokemon.name, image: pokemon.image });
        if (onUpdate) {
          onUpdate();
        }
      } catch (error) { 
        console.error("Error toggling favorite:", error);
        alert(error.response?.data?.detail || "Could not add to team. Is it full?");
      } finally {
        setLoading(false);
      }
    }

    async function removeFromTeam(teamId) {
      // If teamId is not provided, find the team this pokemon belongs to.
      // This is for the Pokedex page where the context of the team is not explicit.
      if (!teamId) {
        const team = teams.find(t => t.pokemons.some(p => p.name === pokemon.name));
        if (team) teamId = team.id;
      }
      await api.delete(`/team/${teamId}/remove/${pokemon.name}`);
      if (onUpdate) onUpdate();
    }

  if (!pokemon) return <div className="border rounded-lg p-4 text-center bg-white shadow h-48 animate-pulse"></div>;

  return (
    <div className="border rounded-lg p-4 text-center bg-white shadow-md hover:shadow-xl transition-shadow duration-200 cursor-pointer" onClick={onClick}>
      <img
        src={pokemon.image}
        alt={pokemon.name}
        className="mx-auto w-24 h-24"
      />
      <h3 className="text-lg font-bold capitalize">{pokemon.name}</h3>
      <div className="mt-2 h-8 flex items-center justify-center">
        {showFavoriteButton && (
          <button
            onClick={handleFavoriteClick}
            className={`text-2xl transition-transform transform hover:scale-125 ${isFavorite ? "text-yellow-500" : "text-gray-300"}`}
            disabled={loading}
          >
            {loading ? '...' : (isFavorite ? '⭐' : '☆')}
          </button>
        )}
      </div>
      {showTeams && (
        <div className="absolute z-10 mt-2 w-48 bg-white border rounded-md shadow-lg" onClick={e => e.stopPropagation()}>
          <div className="py-1">
            <div className="px-3 py-2 text-xs text-gray-500">Add to team:</div>
            {teams.map(team => (
              <button key={team.id} onClick={() => addToTeam(team.id)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                {team.name}
              </button>
            ))}
            <button onClick={() => setShowTeams(false)} className="block w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer border-t">Cancel</button>
          </div>
        </div>
      )}
      {onRemove && (
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={onRemove} className="bg-red-500 text-white px-3 py-1 rounded text-sm w-full hover:bg-red-600 transition-colors" disabled={loading}>
            {loading ? 'Removing...' : 'Remove'}
          </button>
        </div>
      )}
    </div>
  );
}
