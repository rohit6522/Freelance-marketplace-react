import { useContext } from "react";
import { RealtimeContext } from "../contexts/RealtimeContext";

export const useRealtime = () => useContext(RealtimeContext);