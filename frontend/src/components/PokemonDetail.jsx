import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function PokemonDetail({ name, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <h2 className="text-3xl font-bold text-center capitalize">{data.name}</h2>

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