import { useState, useEffect } from "react";
import { api } from "../services/api";

export default function PokemonCard({ pokemon: p, team, onClick }) {
    const [pokemon, setPokemon] = useState(null);
    const [favorite, setFavorite] = useState(false);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      async function loadPokemonDetails() {
        if (p.url) {
          const res = await api.get(p.url);
          setPokemon(res.data);
        } else {
          setPokemon(p);
        }
      }
      loadPokemonDetails();
    }, [p]);

    useEffect(() => {
      if (team) {
        const isFavorite = team.pokemons?.some((p) => p.name === pokemon.name);
        setFavorite(isFavorite);
      }
    }, [team, pokemon]);
  
    async function toggleFavorite() {
      setLoading(true);
      try {
        let res;
        if (!favorite) {
          res = await api.post("/team/add", { name: pokemon.name, image: pokemon.image });
        } else {
          res = await api.delete(`/team/remove/${pokemon.name}`);
        }
        if (res.status !== 200) {
          console.error(`Failed to toggle pokemon. Status code: ${res.status}`);
        }
        setFavorite(!favorite);
      } catch (error) { 
        console.error("Error toggling favorite:", error);
      } finally {
        setLoading(false);
      }
    }

  if (!pokemon) return <div className="border rounded-lg p-4 text-center bg-white shadow h-48 animate-pulse"></div>;

  return (
    <div className="border rounded-lg p-4 text-center bg-white shadow">
      <img
        src={pokemon.image}
        alt={pokemon.name}
        className="mx-auto w-24 h-24 cursor-pointer"
        onClick={onClick}
      />
      <h3 className="text-lg font-bold capitalize">{pokemon.name}</h3>
      <button
        onClick={toggleFavorite}
        className={`text-2xl ${favorite ? "text-yellow-500" : "text-gray-300"}`}
        disabled={loading}
      >
        {favorite ? '⭐' : '☆'}
      </button>
    </div>
  );
}
