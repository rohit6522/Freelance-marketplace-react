import { useCallback, useEffect, useState } from "react";

export function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ loading: true, error: "", data: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: "" })); // keep old data while reloading
    fetcher()
      .then((data) => active && setState({ loading: false, error: "", data }))
      .catch((err) => active && setState({ loading: false, error: err.message, data: null }));
    return () => {
      active = false;
    };
  }, [...deps, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}