import { useCallback, useEffect, useRef } from "react";
import { socket } from "../realtime/socket";

const REPEAT_MS = 2500; // while someone keeps typing, tell the other side at most this often
const IDLE_MS = 3000; // no keystroke for this long means "stopped typing"

// Sender side of the typing indicator. Call onInput(text) on every change and stop() when a message is sent.
export function useTypingEmitter(conversationId) {
  const typingRef = useRef(false);
  const lastSentRef = useRef(0);
  const idleRef = useRef(null);

  const send = useCallback(
    (typing) => {
      if (!socket.connected) return; // typing is only worth showing right now, so never queue it for later
      socket.volatile.emit("typing", { conversationId: String(conversationId), typing });
    },
    [conversationId]
  );

  const stop = useCallback(() => {
    clearTimeout(idleRef.current);
    if (typingRef.current) {
      typingRef.current = false;
      lastSentRef.current = 0;
      send(false);
    }
  }, [send]);

  const onInput = useCallback(
    (value) => {
      if (!value) return stop(); // the box was emptied
      const now = Date.now();
      if (!typingRef.current || now - lastSentRef.current >= REPEAT_MS) {
        typingRef.current = true;
        lastSentRef.current = now;
        send(true);
      }
      clearTimeout(idleRef.current);
      idleRef.current = setTimeout(stop, IDLE_MS);
    },
    [send, stop]
  );

  // Leaving the conversation or the page must not leave "typing..." showing on the other side
  useEffect(() => stop, [stop]);

  return { onInput, stop };
}