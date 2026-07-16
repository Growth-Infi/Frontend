const API_BASE = import.meta.env.VITE_CORE_API_URL;
const BASE = `${API_BASE}/saved-projects`;

export async function saveProject({ feature, name, columns, rows }) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ feature, name, columns, rows }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to save");
  return res.json();
}

export async function listSavedProjects() {
  const res = await fetch(BASE, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load saved projects");
  return res.json();
}

export async function getSavedProject(id) {
  const res = await fetch(`${BASE}/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load project");
  return res.json();
}

export async function deleteSavedProject(id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete project");
  return res.json();
}
