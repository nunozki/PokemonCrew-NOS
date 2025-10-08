import { Routes, Route } from "react-router-dom";
import Pokedex from "./pages/Pokedex";
import MyTeam from "./pages/MyTeam";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/Layout";
import Battle from "./pages/Battle";
import BattleHistory from "./pages/BattleHistory";
import DevOverlay from "./components/DevOverlay";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ProtectedRoute><Pokedex /></ProtectedRoute>} />
          <Route path="my-team" element={<ProtectedRoute><MyTeam /></ProtectedRoute>} />
          <Route path="battle" element={<ProtectedRoute><Battle /></ProtectedRoute>} />
          <Route path="battle-history" element={<ProtectedRoute><BattleHistory /></ProtectedRoute>} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Routes>
      <DevOverlay />
    </>
  );
}

export default App;
