export default function PokemonCard({ pokemon, onClick }) {
  return (
    <div
      onClick={() => onClick(pokemon.name)}
      className="cursor-pointer border rounded-lg p-4 text-center hover:shadow-lg bg-white"
    >
      <img src={pokemon.image} alt={pokemon.name} className="mx-auto w-24 h-24" />
      <h3 className="text-lg font-bold capitalize">{pokemon.name}</h3>
    </div>
  );
}
