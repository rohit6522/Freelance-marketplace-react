import { useEffect, useRef } from "react";
import { socket } from "../realtime/socket";

// Subscribes to a socket event for the lifetime of the component
export function useSocketEvent(event, handler) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const fn = (...args) => ref.current(...args);
    socket.on(event, fn);
    return () => socket.off(event, fn);
  }, [event]);
}