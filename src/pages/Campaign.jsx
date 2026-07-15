// src/pages/Campaign.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Mail, Loader2, AlertCircle, Megaphone } from "lucide-react";
useAuth;???
import { api } from "../lib/api";
import CreateCampaignModal from "../components/CreateCampaignModal";

const STATUS_STYLES = {
  running: "bg-emerald-50 text-emerald-700",
  draft: "bg-stone-100 text-stone-600",
  pending: "bg-blue-50 text-blue-700",
  paused: "bg-amber-50 text-amber-700",
  completed: "bg-violet-50 text-violet-700",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}
    >
      {status}
    </span>
  );
}

export default function Campaign() {
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();
  const token = session?.access_token;

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (authLoading || !token) return;
    (async () => {
      try {
        const data = await api.campaigns.list(token);
        setCampaigns(data);
      } catch (err) {
        setError(err.message || "Failed to load campaigns");
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, token]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Campaigns</h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage your outreach campaigns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/senders")}
            className="flex items-center gap-1.5 border border-stone-200 text-stone-700 text-sm font-medium px-3.5 py-2 rounded-lg hover:bg-stone-50 transition-colors"
          >
            <Mail size={15} />
            Sender accounts
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            <Plus size={16} strokeWidth={2.5} />
            New campaign
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48 gap-2 text-stone-400">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Loading campaigns…</span>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center justify-center h-48 gap-2 text-red-600">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {!loading && !error && campaigns.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 bg-white border border-stone-200 rounded-xl py-16 text-stone-500">
          <Megaphone size={24} className="opacity-30" />
          <p className="text-sm">No campaigns yet</p>
          <button
            onClick={() => setCreateOpen(true)}
            className="text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            + Create your first campaign
          </button>
        </div>
      )}

      {!loading && !error && campaigns.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="font-medium px-5 py-3">Name</th>
                <th className="font-medium px-5 py-3">Status</th>
                <th className="font-medium px-5 py-3">Sent</th>
                <th className="font-medium px-5 py-3">Recipients</th>
                <th className="font-medium px-5 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/campaign/${c.id}`)}
                  className="border-b border-stone-100 last:border-0 hover:bg-stone-50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium text-stone-900">
                    {c.name}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-3.5 text-stone-600">
                    {c.sent_count ?? 0}
                  </td>
                  <td className="px-5 py-3.5 text-stone-600">
                    {c.total_recipients ?? 0}
                  </td>
                  <td className="px-5 py-3.5 text-stone-500">
                    {c.created_at
                      ? new Date(c.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {createOpen && (
        <CreateCampaignModal
          onClose={() => setCreateOpen(false)}
          onCreated={(campaign) => setCampaigns((prev) => [campaign, ...prev])}
        />
      )}
    </div>
  );
}
