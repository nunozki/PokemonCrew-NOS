import { useContext } from "react";
import { AuthContext } from "./auth.js";

export function useAuth() {
  return useContext(AuthContext);
}