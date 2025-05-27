import { io, Socket } from "socket.io-client";

const socket: Socket = io('http://localhost:5500', {
  withCredentials: true,
  autoConnect: false,
  transports: ['websocket'],
});

export default socket;