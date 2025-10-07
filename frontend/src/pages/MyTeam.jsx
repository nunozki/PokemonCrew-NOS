import { useState, useEffect } from "react";
import { api } from "../services/api";

export default function MyTeams() {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadTeam(); }, []);

  async function loadTeam() {
    try {
      setLoading(true);
      const res = await api.get("/team/");
      setTeam(res.data);
    } catch (err) {
      console.error("Failed to load team:", err);
    } finally {
      setLoading(false);
    }
  }

  async function removePokemon(name) {
    if (!confirm(`Remove ${name} from your team?`)) {
      return;
    }
    try {
      setLoading(true);
      await api.delete(`/team/remove/${name}`);
      await loadTeam();
    } catch (err) {
      console.error("Failed to remove pokemon:", err);
    } finally {
      setLoading(false);
    }
  }

  // Note: backend exposes POST /team/{team_id}/add to add a pokemon. UI for adding
  // is intentionally simple: users add from Pokedex (star on card). Here we show
  // available actions and the concrete endpoints used by the codebase.

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">My Team</h1>

      {loading && <div>Loading...</div>}

      {!team && !loading && (
        <div className="text-sm text-gray-500">No team found. Open the Pokedex to create or add Pokemons.</div>
      )}

      {team && (
        <div className="space-y-4">
          <div className="border p-2 rounded bg-gray-50">
            <div className="text-sm text-gray-600">Team id: <strong>{team.id}</strong></div>
            <div className="text-sm text-gray-600">Name: <strong>{team.name || 'My Team'}</strong></div>
            <div className="text-sm text-gray-600">Actions available: <em>View</em>, <em>Add (from Pokedex)</em>, <em>Remove</em></div>
            <div className="text-xs text-gray-500 mt-1">Endpoints: GET /api/team/, POST /api/team/{"team_id"}/add, DELETE /api/team/remove/{"name"}</div>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {team.pokemons.length === 0 && (
              <li className="text-gray-500">No Pokemons in the team yet. Use the Pokedex to add some.</li>
            )}

            {team.pokemons.map((p) => (
              <li key={p.id} className="border p-2 rounded flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="w-12 h-12" />
                  <div>
                    <div className="font-semibold capitalize">{p.name}</div>
                    <div className="text-sm text-gray-500">id: {p.id}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => removePokemon(p.name)} className="bg-red-500 text-white px-3 py-1 rounded">Remove</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
