import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:9000/api",
  withCredentials: true, // This is the key change
});

export default api;