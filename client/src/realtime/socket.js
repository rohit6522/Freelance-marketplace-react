import { io } from "socket.io-client";

// Same origin as the page. The Vite dev proxy forwards /socket.io to the API.
export const socket = io({ autoConnect: false, withCredentials: true });