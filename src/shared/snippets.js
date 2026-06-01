// ─── Snippet storage — pure localStorage, no React, no deps ──────────────────

const KEY = "devkit:snippets";

export function loadSnippets() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveSnippet({ title, content, toolId, toolLabel }) {
  const snippets = loadSnippets();
  const item = {
    id:        crypto.randomUUID(),
    title:     title.trim() || toolLabel,
    content,
    toolId,
    toolLabel,
    createdAt: Date.now(),
  };
  snippets.unshift(item);
  localStorage.setItem(KEY, JSON.stringify(snippets));
  return item;
}

export function deleteSnippet(id) {
  const snippets = loadSnippets().filter(s => s.id !== id);
  localStorage.setItem(KEY, JSON.stringify(snippets));
}

export function renameSnippet(id, title) {
  const snippets = loadSnippets().map(s => s.id === id ? { ...s, title } : s);
  localStorage.setItem(KEY, JSON.stringify(snippets));
}

export function clearSnippets() {
  localStorage.removeItem(KEY);
}
