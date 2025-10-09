import { useState, useEffect } from "react";
import { api } from "../services/api";
import { AuthContext } from "./auth.js";

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (username, password) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    await api.post("/users/login", params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    
    await fetchUser();
  };

  const logout = async () => {
    //Ideally, there would be a /logout endpoint on the backend to invalidate the cookie
    setCurrentUser(null);
    //Force a reload to ensure state is cleared across the entire app    window.location.href = '/login';
  };

  const fetchUser = async () => {
    try {
      try {
        const res = await api.get("/users/me");
        setCurrentUser(res.data);
      } catch (error) {
        console.error("Failed to fetch user, logging out.", error);
        logout();
      }
    } finally {
      setLoading(false);
    }
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