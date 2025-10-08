import { Routes, Route } from "react-router-dom";
import Pokedex from "./pages/Pokedex";
import MyTeam from "./pages/MyTeam";
import Layout from "./components/Layout";
import DevOverlay from "./components/DevOverlay";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Pokedex />} />
          <Route path="my-team" element={<MyTeam />} />
        </Route>
      </Routes>
      <DevOverlay />
    </>
  );
}

export default App;
