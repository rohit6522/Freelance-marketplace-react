import { createContext, useEffect, useMemo, useState } from "react";
import { socket } from "../realtime/socket";
import { useAuth } from "../hooks/useAuth";

export const RealtimeContext = createContext({ connected: false });

export function RealtimeProvider({ children }) {
  const { user } = useAuth();
  const userId = user?._id;
  const [connected, setConnected] = useState(false);

  // Connect while logged in, disconnect on logout
  useEffect(() => {
    if (!userId) {
      socket.disconnect();
      setConnected(false);
      return;
    }

    let retries = 0;
    let timer;
    const onConnect = () => {
      retries = 0;
      setConnected(true);
    };
    const onDisconnect = (reason) => {
      setConnected(false);
      // When the SERVER closes the socket on purpose (for example after a password change) the browser does not
      // retry by itself, so reconnect. If the login is no longer valid, the retries in onError give up after a few tries.
      if (reason === "io server disconnect") socket.connect();
    };
    // After a password change the old cookie is rejected for a moment, so retry a few times with a growing delay
    const onError = () => {
      setConnected(false);
      if (retries < 5) {
        retries += 1;
        timer = setTimeout(() => socket.connect(), 2000 * retries);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onError);
    socket.connect();

    return () => {
      clearTimeout(timer);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onError);
      socket.disconnect();
    };
  }, [userId]);

  const value = useMemo(() => ({ connected }), [connected]);
  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}