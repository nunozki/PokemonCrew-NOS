export default function PokemonDetail({ data, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-80 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-red-500 font-bold">✕</button>
        <img src={data.image} alt={data.name} className="mx-auto w-32" />
        <h2 className="text-2xl font-bold mb-2 capitalize">{data.name}</h2>
        <p><strong>Tipos:</strong> {data.types.join(", ")}</p>
        <p><strong>Peso:</strong> {data.weight}</p>
        <p><strong>Altura:</strong> {data.height}</p>
        <h3 className="mt-2 font-semibold">Estatísticas:</h3>
        <ul>
          {Object.entries(data.stats).map(([k, v]) => (
            <li key={k}>{k}: {v}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
