import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function PokemonDetail({ name, teams, onUpdate, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [showTeams, setShowTeams] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get(`/pokemon/${name}`);
        setData(res.data);
      } catch {
        alert("Error! Failed to load Pokemon's details");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [name]);

  useEffect(() => {
    if (teams && data) {
      const favorite = teams.some(t => t.pokemons.some(p => p.name === data.name));
      setIsFavorite(favorite);
    }
  }, [teams, data]);

  async function handleFavoriteClick() {
    if (isFavorite) {
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
    setToggleLoading(true);
    try {
      await api.post(`/team/${teamId}/add`, { name: data.name, image: data.image });
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert(error.response?.data?.detail || "Could not add to team. Is it full?");
    } finally {
      setToggleLoading(false);
    }
  }

  async function removeFromTeam() {
    await api.delete(`/team/remove/${data.name}`);
    if (onUpdate) {
      onUpdate();
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center text-white">
        Loading {name}...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-500 font-bold text-lg"
        >
          ✕
        </button>

        <img src={data.image} alt={data.name} className="mx-auto w-40 h-40" />
        <div className="flex justify-center items-center gap-2">
          <h2 className="text-3xl font-bold text-center capitalize">{data.name}</h2>
          <div className="relative">
            <button
              onClick={handleFavoriteClick}
              className={`text-3xl ${isFavorite ? "text-yellow-500" : "text-gray-300"}`}
              disabled={toggleLoading}
            >
              {isFavorite ? '⭐' : '☆'}
            </button>
            {showTeams && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border rounded-md shadow-lg z-20" onClick={e => e.stopPropagation()}>
                <div className="py-1">
                  <div className="px-3 py-2 text-xs text-gray-500">Add to team:</div>
                  {teams.map(team => (
                    <a key={team.id} onClick={() => addToTeam(team.id)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">{team.name}</a>
                  ))}
                  <a onClick={() => setShowTeams(false)} className="block px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer border-t">Cancel</a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p><strong>Types:</strong> {data.types.join(", ")}</p>
          <p><strong>Weight:</strong> {data.weight}</p>
          <p><strong>Height:</strong> {data.height}</p>

          <h3 className="mt-3 font-semibold">Statistics:</h3>
          <ul className="grid grid-cols-2 gap-x-4">
            {Object.entries(data.stats).map(([key, value]) => (
              <li key={key} className="capitalize">
                {key}: <span className="font-bold">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}