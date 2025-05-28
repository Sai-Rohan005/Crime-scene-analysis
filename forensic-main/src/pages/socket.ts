// socket.ts
import { io } from "socket.io-client";

const socket = io("http://localhost:5500", {
  transports: ["websocket"],
  autoConnect: false,
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
});

export default socket;
