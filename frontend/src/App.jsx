import { Routes, Route } from "react-router-dom";
import Pokedex from "./pages/Pokedex";
import MyTeam from "./pages/MyTeam";
import Layout from "./components/Layout";
import Battle from "./pages/Battle";
import BattleHistory from "./pages/BattleHistory";
import DevOverlay from "./components/DevOverlay";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Pokedex />} />
          <Route path="my-team" element={<MyTeam />} />
          <Route path="battle" element={<Battle />} />
          <Route path="battle-history" element={<BattleHistory />} />
        </Route>
      </Routes>
      <DevOverlay />
    </>
  );
}

export default App;
