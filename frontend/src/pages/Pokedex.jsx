import { useState, useEffect } from "react";
import { api } from "../services/api";
import PokemonCard from "../components/PokemonCard";
import PokemonDetail from "../components/PokemonDetail";

export default function Pokedex() {
  const [pokemons, setPokemons] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadPokemons(); }, []);

  async function loadPokemons() {
    const res = await api.get("/pokemon?limit=50");
    setPokemons(res.data.results);
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!search) return loadPokemons();
    try {
      const res = await api.get(`/pokemon/${search.toLowerCase()}`);
      setPokemons([{ name: res.data.name, image: res.data.image }]);
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
          placeholder="Pesquisar Pokémon..."
          className="border p-2 rounded-l w-60"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 rounded-r">Buscar</button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {pokemons.map((p) => (
          <PokemonCard key={p.name} pokemon={p} onClick={setSelected} />
        ))}
      </div>

      {selected && (
        <PokemonDetail
          name={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
