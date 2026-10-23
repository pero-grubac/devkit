import { useState, useEffect, useRef } from "react";
import { loadInput, saveInput } from "./persist";

// useState that survives reloads. Use it for inputs, never for secrets.
// `initial` must be JSON-serialisable; values equal to it are not stored.
export function usePersistentState(toolId, key, initial) {
  const [value, setValue] = useState(() => {
    const saved = loadInput(toolId, key);
    return saved === undefined ? initial : saved;
  });
  const initialRef = useRef(initial);

  useEffect(() => {
    saveInput(toolId, key, value, initialRef.current);
  }, [toolId, key, value]);

  return [value, setValue];
}
