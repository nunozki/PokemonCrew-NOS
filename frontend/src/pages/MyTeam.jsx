import { useState, useEffect } from "react";
import { api } from "../services/api";
import PokemonCard from "../components/PokemonCard";

export default function MyTeam() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTeamName, setNewTeamName] = useState("");
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editingTeamName, setEditingTeamName] = useState("");

  useEffect(() => { loadTeams(); }, []);

  async function loadTeams() {
    try {
      setLoading(true);
      const res = await api.get("/team/list");
      setTeams(res.data);
    } catch (err) {
      console.error("Failed to load team:", err);
    } finally {
      setLoading(false);
    }
  }

  async function createTeam(e) {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    await api.post("/team/create", { name: newTeamName });
    setNewTeamName("");
    await loadTeams();
  }

  async function handleUpdateTeamName(e, teamId) {
    e.preventDefault();
    await api.put(`/team/${teamId}`, { name: editingTeamName });
    setEditingTeamId(null);
    await loadTeams();
  }

  async function handleDeleteTeam(teamId) {
    if (!confirm(`Are you sure you want to delete this team? This action cannot be undone.`)) {
      return;
    }
    await api.delete(`/team/${teamId}`);
    await loadTeams();
  }

  async function removePokemon(teamId, name) {
    if (!confirm(`Remove ${name} from your team?`)) {
      return;
    }
    try {
      setLoading(true);
      await api.delete(`/team/${teamId}/remove/${name}`);
      await loadTeams();
    } catch (err) {
      console.error("Failed to remove pokemon:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">My Teams</h1>

      <form onSubmit={createTeam} className="mb-8 flex gap-2">
        <input
          type="text"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          placeholder="New team name"
          className="border p-2 rounded-l w-full sm:w-60"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 rounded-r">Create Team</button>
      </form>

      {loading && <div>Loading...</div>}

      {!teams.length && !loading && (
        <div className="text-sm text-gray-500">No teams found. Create one to get started!</div>
      )}

      {teams.map((team) => (
        <div key={team.id} className="space-y-4 mb-8 p-4 border rounded-lg shadow-md bg-gray-50">
          <div className="flex justify-between items-center flex-wrap gap-2">
            {editingTeamId === team.id ? (
              <form onSubmit={(e) => handleUpdateTeamName(e, team.id)} className="flex-grow flex gap-2">
                <input
                  type="text"
                  value={editingTeamName}
                  onChange={(e) => setEditingTeamName(e.target.value)}
                  className="border p-2 rounded-l w-full"
                  autoFocus
                />
                <button type="submit" className="bg-green-500 text-white px-4 rounded-r">Save</button>
              </form>
            ) : (
              <h2 className="text-xl font-bold text-gray-800">{team.name || 'My Favorite Team'}</h2>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => { setEditingTeamId(team.id); setEditingTeamName(team.name || ""); }}
                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
              >
                Rename
              </button>
              <button
                onClick={() => handleDeleteTeam(team.id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
              >
                Delete Team
              </button>
            </div>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {team.pokemons.length === 0 && (
              <li className="text-gray-500 col-span-full text-center py-4">This team is empty. Go to the Pokédex to add some Pokémon!</li>
            )}

            {team.pokemons.map((p) => (
              <PokemonCard
                key={p.id}
                pokemon={p}
                onRemove={() => removePokemon(team.id, p.name)}
                showFavoriteButton={false}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
