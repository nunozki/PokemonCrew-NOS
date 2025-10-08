import { useState, useEffect } from "react";
import { api } from "../services/api";

export default function PokemonTeamManagement({ name, onClose }) {
  const [data, setData] = useState(null);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const [pRes, tRes] = await Promise.all([
        api.get(`/pokemon/${name}`),
        api.get(`/pokemon/${name}/teams`)
      ]);
      setData(pRes.data);
      setTeams(tRes.data.available_teams);
    }
    fetchData();
  }, [name]);

  async function addToTeam(teamId) {
    await api.post(`/team/${teamId}/add`, {
      name: data.name,
      image: data.image,
    });
    alert(`${data.name} added to the team!`);
    onClose();
  }

  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        {/* detalhes */}
        <h2 className="text-2xl font-bold mb-2 capitalize">{data.name}</h2>

        {/* equipas */}
        <h3 className="mt-4 font-semibold">Team Manager</h3>
        {teams.map((t) => (
          <div key={t.id} className="flex justify-between mt-1">
            <span>{t.name}</span>
            {t.has_space ? (
              <button
                onClick={() => addToTeam(t.id)}
                className="bg-green-500 text-white px-2 rounded"
              >
                Add
              </button>
            ) : (
              <span className="text-gray-400 text-sm">Full</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
