import { useState, useEffect } from "react";
import { api } from "../services/api";

// Simple stat calculation for level 50
const calculateStat = (base, name) => {
  if (name === 'hp') {
    return Math.floor(base * 2 + 110);
  }
  return Math.floor(base * 2 + 5);
};

export default function BattleArena({ pokemons, onBattleEnd }) {
  const [pokemon1, setPokemon1] = useState(null);
  const [pokemon2, setPokemon2] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      const [p1Details, p2Details] = await Promise.all([
        api.get(`/pokemon/${pokemons[0].name}`),
        api.get(`/pokemon/${pokemons[1].name}`),
      ]);

      const p1Stats = {
        ...p1Details.data,
        hp: calculateStat(p1Details.data.stats.hp, 'hp'),
        maxHp: calculateStat(p1Details.data.stats.hp, 'hp'),
        attack: calculateStat(p1Details.data.stats.attack),
        defense: calculateStat(p1Details.data.stats.defense),
        speed: calculateStat(p1Details.data.stats.speed),
      };

      const p2Stats = {
        ...p2Details.data,
        hp: calculateStat(p2Details.data.stats.hp, 'hp'),
        maxHp: calculateStat(p2Details.data.stats.hp, 'hp'),
        attack: calculateStat(p2Details.data.stats.attack),
        defense: calculateStat(p2Details.data.stats.defense),
        speed: calculateStat(p2Details.data.stats.speed),
      };

      if (p1Stats.speed >= p2Stats.speed) {
        setPokemon1(p1Stats);
        setPokemon2(p2Stats);
      } else {
        setPokemon1(p2Stats);
        setPokemon2(p1Stats);
      }
      setBattleLog([`Battle between ${p1Stats.name} and ${p2Stats.name} begins!`]);
    };
    fetchDetails();
  }, [pokemons]);

  const performAttack = (attacker, defender, setDefender) => {
    // Simple damage formula
    const damage = Math.floor(
      (2 * 50 / 5 + 2) * 40 * (attacker.attack / defender.defense) / 50 + 2
    );
    const newHp = Math.max(0, defender.hp - damage);
    
    setBattleLog(prev => [...prev, `${attacker.name} used Tackle!`, `${defender.name} lost ${damage} HP.`]);
    setDefender({ ...defender, hp: newHp });

    if (newHp === 0) {
      setBattleLog(prev => [...prev, `${defender.name} fainted!`, `${attacker.name} wins!`]);
      setIsBattleOver(true);
      setWinner(attacker);
      api.post('/battle/', {
        pokemon1_name: pokemons[0].name,
        pokemon2_name: pokemons[1].name,
        winner_name: attacker.name,
      });
    }
  };

  const handleNextTurn = () => {
    if (isBattleOver) return;

    // Pokemon 1 attacks
    performAttack(pokemon1, pokemon2, setPokemon2);
    if (pokemon2.hp - 1 <= 0) return; // Check if battle ended

    // Pokemon 2 attacks
    setTimeout(() => {
      performAttack(pokemon2, pokemon1, setPokemon1);
    }, 1000); // Delay for visual effect
  };

  if (!pokemon1 || !pokemon2) {
    return <div>Loading battle...</div>;
  }

  const PokemonDisplay = ({ p }) => (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold capitalize mb-2">{p.name}</h2>
      <img src={p.image} alt={p.name} className="w-40 h-40" />
      <div className="w-full bg-gray-200 rounded-full h-6 mt-2 border border-gray-400">
        <div 
          className="bg-green-500 h-full rounded-full transition-all duration-500" 
          style={{ width: `${(p.hp / p.maxHp) * 100}%` }}
        ></div>
      </div>
      <p className="font-mono mt-1">{p.hp} / {p.maxHp}</p>
    </div>
  );

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-6 text-center">Battle Arena</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <PokemonDisplay p={pokemon1} />
        <PokemonDisplay p={pokemon2} />
      </div>

      <div className="mt-8">
        <div className="h-48 bg-gray-800 text-white font-mono p-4 rounded-lg overflow-y-auto">
          {battleLog.map((line, i) => (
            <p key={i} className="animate-fade-in">{`> ${line}`}</p>
          ))}
        </div>
        {!isBattleOver ? (
          <button onClick={handleNextTurn} className="mt-4 w-full bg-red-500 text-white font-bold py-3 px-4 rounded hover:bg-red-600 transition-colors text-lg">
            Attack!
          </button>
        ) : (
          <button onClick={onBattleEnd} className="mt-4 w-full bg-blue-500 text-white font-bold py-3 px-4 rounded hover:bg-blue-600 transition-colors text-lg">
            New Battle
          </button>
        )}
      </div>
    </div>
  );
}