import { useState, useEffect } from "react";
import { api } from "../services/api";

export default function MyTeam() {
  const [team, setTeam] = useState(null);

  async function loadTeam() {
    const res = await api.get("/team/");
    setTeam(res.data);
  }

  useEffect(() => { loadTeam(); }, []);

  async function removePokemon(name) {
    await api.delete(`/team/remove/${name}`);
    loadTeam();
  }

  if (!team) return <p>Loading the team...</p>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-center mb-4">My Team</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {team.pokemons.map((p) => (
          <div key={p.id} className="border p-2 text-center bg-white rounded-lg">
            <img src={p.image} alt={p.name} className="mx-auto w-20 h-20" />
            <p className="capitalize">{p.name}</p>
            <button onClick={() => removePokemon(p.name)} className="text-red-500">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
