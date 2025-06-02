import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const initRescueSocket = () => {
  const socket = io(API_BASE_URL, {
    auth: { token: localStorage.getItem('token') },
  });

  // Gestion des erreurs
  socket.on("connect_error", (err) => {
    console.error("Socket error:", err.message);
  });

  return socket;
};