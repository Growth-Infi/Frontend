import { useEffect, useState } from "react";
import { Download, Eye, Trash2, FileText, Loader2, X } from "lucide-react";
import {
  listSavedProjects,
  getSavedProject,
  deleteSavedProject,
} from "../api/savedProjects";
import { buildCSV } from "../utils/csv";

const FEATURE_LABELS = {
  findDomains: "Find Domains",
  iceBreaker: "Ice Breaker",
  aiEnrichment: "AI Enrichment",
};

function ProjectCard({ project, onView, onDownload, onDelete, busyId }) {
  return (
    <div
      className="
        group
        bg-white
        border border-stone-200
        rounded-xl
        p-4
        flex flex-col gap-3
        transition-all duration-200 ease-out
        hover:-translate-y-1
        hover:border-blue-700
        hover:shadow-xl
        hover:shadow-blue-100/50
      "
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="
            w-10 h-10
            rounded-xl
            bg-blue-50
            text-blue-700
            flex items-center justify-center
            shrink-0
            transition-all duration-200
            group-hover:bg-blue-100
          "
        >
          <FileText size={18} />
        </span>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-stone-900 truncate transition-colors group-hover:text-blue-700">
            {project.name}
          </p>

          <p className="text-xs text-stone-500 mt-0.5">
            {FEATURE_LABELS[project.feature] || project.feature}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-stone-500 border-t border-stone-100 pt-3 mt-1">
        <span>{project.rowCount} rows</span>
        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onView(project.id)}
          disabled={busyId === project.id}
          className="
            flex-1
            flex items-center justify-center gap-1.5
            text-xs font-medium
            px-3 py-2
            rounded-lg
            text-stone-600
            transition-all
            hover:bg-blue-50
            hover:text-blue-700
            disabled:opacity-50
          "
        >
          {busyId === project.id ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Eye size={13} />
          )}
          View
        </button>

        <button
          onClick={() => onDownload(project.id)}
          disabled={busyId === project.id}
          className="
            flex-1
            flex items-center justify-center gap-1.5
            text-xs font-medium
            px-3 py-2
            rounded-lg
            text-stone-600
            transition-all
            hover:bg-blue-50
            hover:text-blue-700
            disabled:opacity-50
          "
        >
          <Download size={13} />
          Download
        </button>

        <button
          onClick={() => onDelete(project.id)}
          className="
            p-2
            rounded-lg
            text-stone-400
            transition-all
            hover:bg-red-50
            hover:text-red-600
          "
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function PreviewModal({ project, onClose }) {
  if (!project) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100">
          <h3 className="text-sm font-semibold text-stone-900">
            {project.name}
          </h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700"
          >
            <X size={16} />
          </button>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-left text-stone-500 sticky top-0 bg-white">
                {project.columns.map((c) => (
                  <th key={c} className="font-medium px-5 py-2.5">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {project.rows.map((r, i) => (
                <tr key={i} className="border-b border-stone-100 last:border-0">
                  {project.columns.map((c) => (
                    <td key={c} className="px-5 py-2.5 text-stone-700">
                      {r[c]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function SavedProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    listSavedProjects()
      .then((d) => setProjects(d.projects))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleView(id) {
    setBusyId(id);
    try {
      setPreview(await getSavedProject(id));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDownload(id) {
    setBusyId(id);
    try {
      const full = await getSavedProject(id);
      const csv = buildCSV(full.rows, full.columns);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${full.name}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this saved project?")) return;
    try {
      await deleteSavedProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Saved Projects</h1>
        <p className="text-sm text-stone-500 mt-1">
          CSV results you've saved from your tools.
        </p>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex items-center gap-2 text-stone-500 text-sm">
          <Loader2 size={15} className="animate-spin" /> Loading...
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-10 text-center text-sm text-stone-500">
          No saved projects yet. Save results from any tool to see them here.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onView={handleView}
              onDownload={handleDownload}
              onDelete={handleDelete}
              busyId={busyId}
            />
          ))}
        </div>
      )}
      <PreviewModal project={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
