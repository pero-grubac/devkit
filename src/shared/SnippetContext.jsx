import { useState, useCallback } from "react";
import {
  loadSnippets, saveSnippet, deleteSnippet,
  renameSnippet, clearSnippets,
} from "./snippets";
import { SnippetCtx as Ctx } from "./useSnippets";

export function SnippetProvider({ children }) {
  const [snippets, setSnippets] = useState(() => loadSnippets());

  const add = useCallback((data) => {
    const item = saveSnippet(data);
    setSnippets(prev => [item, ...prev]);
    return item;
  }, []);

  const remove = useCallback((id) => {
    deleteSnippet(id);
    setSnippets(prev => prev.filter(s => s.id !== id));
  }, []);

  const rename = useCallback((id, title) => {
    renameSnippet(id, title);
    setSnippets(prev => prev.map(s => s.id === id ? { ...s, title } : s));
  }, []);

  const clear = useCallback(() => {
    clearSnippets();
    setSnippets([]);
  }, []);

  return (
    <Ctx.Provider value={{ snippets, add, remove, rename, clear }}>
      {children}
    </Ctx.Provider>
  );
}
