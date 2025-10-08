import { useState, useEffect } from "react";
import { api } from "../services/api";
import { AuthContext } from "./AuthContextBase";

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (username, password) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const response = await api.post("/users/login", params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    
    localStorage.setItem("pokemon-crew-token", response.data.access_token);
    await fetchUser();
  };

  const logout = () => {
    localStorage.removeItem("pokemon-crew-token");
    setCurrentUser(null);
  };

  const fetchUser = async () => {
    const token = localStorage.getItem("pokemon-crew-token");
    if (token) {
      try {
        const res = await api.get("/users/me");
        setCurrentUser(res.data);
      } catch (error) {
        console.error("Failed to fetch user, logging out.", error);
        logout();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const value = {
    currentUser,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}