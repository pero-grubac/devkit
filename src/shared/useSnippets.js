import { createContext, useContext } from "react";

export const SnippetCtx = createContext(null);

export function useSnippets() {
  const ctx = useContext(SnippetCtx);
  if (!ctx) throw new Error("useSnippets must be used inside <SnippetProvider>");
  return ctx;
}
