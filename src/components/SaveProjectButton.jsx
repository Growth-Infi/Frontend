import { useState } from "react";
import { Save, Check, Loader2 } from "lucide-react";
import { saveProject } from "../api/savedProjects";

export default function SaveProjectButton({
  feature,
  columns,
  rows,
  defaultName = "",
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    const name = window.prompt(
      "Name this saved project:",
      defaultName || `${feature} - ${new Date().toLocaleDateString()}`,
    );
    if (!name) return;
    setSaving(true);
    setError("");
    try {
      await saveProject({ feature, name, columns, rows });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 disabled:opacity-50 transition-colors"
      >
        {saving ? (
          <Loader2 size={15} className="animate-spin" />
        ) : saved ? (
          <Check size={15} className="text-emerald-600" />
        ) : (
          <Save size={15} />
        )}
        {saving ? "Saving..." : saved ? "Saved" : "Save project"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
