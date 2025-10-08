import { useState, useEffect, useMemo } from "react";
import { api } from "../services/api";
import PokemonCard from "../components/PokemonCard";
import PokemonDetail from "../components/PokemonDetail";

export default function Pokedex() {
  const [pokemons, setPokemons] = useState([]);
  const [search, setSearch] = useState("");
  const [teams, setTeams] = useState([]);
  const [selected, setSelected] = useState(null);

  const sortedPokemons = useMemo(() => {
    if (!teams.length) return pokemons;
    const favoriteNames = new Set(teams.flatMap(t => t.pokemons).map(p => p.name.toLowerCase()));
    return [...pokemons].sort((a, b) => {
        const aIsFavorite = favoriteNames.has(a.name.toLowerCase());
        const bIsFavorite = favoriteNames.has(b.name.toLowerCase());
        if (aIsFavorite === bIsFavorite) return 0;
        return aIsFavorite ? -1 : 1;
    });
  }, [pokemons, teams]);

  useEffect(() => {
    loadPokemons();
    loadTeams();
  }, []);

  async function loadPokemons() {
    const res = await api.get("/pokemon?limit=50");
    setPokemons(res.data.results);
  }

  async function loadTeams() {
    const res = await api.get("/team/list");
    setTeams(res.data);
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!search) return loadPokemons();
    try {
      const res = await api.get(`/pokemon/${search.toLowerCase()}`);
      // The search result has a different structure. We need to map it
      // to the same structure as the list from `loadPokemons`.
      // The key is to provide the `image` property directly.
      const pokemon = { name: res.data.name, image: res.data.image };
      setPokemons([pokemon]);
    } catch {
      alert("Pokemon not found!");
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Pokédex</h1>

      <form onSubmit={handleSearch} className="flex justify-center mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Searching Pokemon..."
          className="border p-2 rounded-l w-60"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 rounded-r">Search</button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {sortedPokemons.map((p) => (
          <PokemonCard key={p.name} pokemon={p} teams={teams} onUpdate={loadTeams} onClick={() => setSelected(p.name)} />
        ))}
      </div>

      {selected && (
        <PokemonDetail
          name={selected}
          teams={teams}
          onUpdate={loadTeams}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}