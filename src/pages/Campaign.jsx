import { useNavigate } from "react-router-dom"
import { Plus, MoreHorizontal } from "lucide-react"

const CAMPAIGNS = [
    { id: "c1", name: "Test", status: "Active", sent: 1240, replies: 77, updated: "2h ago" },
    { id: "c2", name: "Test", status: "Active", sent: 410, replies: 12, updated: "1d ago" },
    { id: "c3", name: "Test", status: "Paused", sent: 980, replies: 49, updated: "3d ago" },
    { id: "c4", name: "Test", status: "Draft", sent: 0, replies: 0, updated: "5d ago" },
]

function StatusBadge({ status }) {
    const styles = {
        Active: "bg-emerald-50 text-emerald-700",
        Paused: "bg-amber-50 text-amber-700",
        Draft: "bg-stone-100 text-stone-600",
    }
    return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>{status}</span>
}

export default function Campaign() {
    const navigate = useNavigate()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-stone-900">Campaigns</h1>
                    <p className="text-sm text-stone-500 mt-1">Manage your outreach campaigns.</p>
                </div>
                <button
                    onClick={() => navigate("/campaign/new")}
                    className="flex items-center gap-1.5 bg-blue-700 text-white text-sm font-medium px-3.5 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    New campaign
                </button>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-stone-200 text-left text-stone-500">
                            <th className="font-medium px-5 py-3">Name</th>
                            <th className="font-medium px-5 py-3">Status</th>
                            <th className="font-medium px-5 py-3">Sent</th>
                            <th className="font-medium px-5 py-3">Replies</th>
                            <th className="font-medium px-5 py-3">Updated</th>
                            <th className="px-5 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {CAMPAIGNS.map((c) => (
                            <tr
                                key={c.id}
                                onClick={() => navigate(`/campaign/${c.id}`)}
                                className="border-b border-stone-100 last:border-0 hover:bg-stone-50 cursor-pointer transition-colors"
                            >
                                <td className="px-5 py-3.5 font-medium text-stone-900">{c.name}</td>
                                <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                                <td className="px-5 py-3.5 text-stone-600">{c.sent.toLocaleString()}</td>
                                <td className="px-5 py-3.5 text-stone-600">{c.replies}</td>
                                <td className="px-5 py-3.5 text-stone-500">{c.updated}</td>
                                {/* <td className="px-5 py-3.5 text-right">
                                    <button onClick={(e) => e.stopPropagation()} className="text-stone-400 hover:text-stone-700 p-1 rounded">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}