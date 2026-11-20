import { useCallback, useEffect, useRef, useState } from "react";
import { useSocketEvent } from "./useSocketEvent";

const SAFETY_MS = 6000; // if the "stopped typing" event is ever lost, hide the indicator anyway

// Receiver side. The server only sends this event to the other person in this conversation.
export function useTypingIndicator(conversationId) {
  const [otherTyping, setOtherTyping] = useState(false);
  const timer = useRef(null);

  const clearTyping = useCallback(() => {
    clearTimeout(timer.current);
    setOtherTyping(false);
  }, []);

  useSocketEvent("typing", (payload) => {
    if (!payload || payload.conversationId !== String(conversationId)) return;
    clearTimeout(timer.current);
    if (payload.typing === true) {
      setOtherTyping(true);
      timer.current = setTimeout(() => setOtherTyping(false), SAFETY_MS);
    } else {
      setOtherTyping(false);
    }
  });

  useEffect(() => {
    clearTyping();
    return () => clearTimeout(timer.current);
  }, [conversationId, clearTyping]);

  return { otherTyping, clearTyping };
}