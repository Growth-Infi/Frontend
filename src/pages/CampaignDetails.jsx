import { useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
    ArrowLeft, Play, Pause, Upload, X,
    Mail, CheckCircle2, Circle, UserPlus,
    Trash2, TrendingUp, MousePointerClick, Reply, Send
} from "lucide-react"

const TABS = ["Sequence", "Sender Accounts", "Analysis", "Settings"]

const MOCK_ACCOUNTS = [
    { id: 1, name: "test", email: "test@gmail.com", enabled: true },
    { id: 2, name: "test", email: "test@gmail.com", enabled: true },
    { id: 3, name: "test", email: "test@gmail.com", enabled: false },
]

const TIMEZONES = [
    "UTC", "America/New_York", "America/Chicago",
    "America/Denver", "America/Los_Angeles",
    "Europe/London", "Europe/Paris", "Asia/Tokyo", "Asia/Kolkata",
]

function SequenceTab() {
    const [csvFile, setCsvFile] = useState(null)
    const [csvColumns, setCsvColumns] = useState([])
    const [emailColumn, setEmailColumn] = useState("")
    const [subject, setSubject] = useState("Quick question about {{company}}'s outbound")
    const [body, setBody] = useState(
        "Hey {{first_name}},\n\nNoticed {{company}} has been scaling the GTM team — curious how you're handling outbound right now.\n\nWorth a quick chat?"
    )
    const fileRef = useRef()

    function handleCSV(e) {
        const file = e.target.files[0]
        if (!file) return
        setCsvFile(file)
        const reader = new FileReader()
        reader.onload = (ev) => {
            const firstLine = ev.target.result.split("\n")[0]
            const cols = firstLine.split(",").map((c) => c.trim().replace(/^"|"$/g, ""))
            setCsvColumns(cols)
            setEmailColumn(cols[0] || "")
        }
        reader.readAsText(file)
    }

    return (
        <div className="flex gap-6">
            {/* Left: leads */}
            <div className="flex flex-col gap-4 w-80 shrink-0">
                <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-stone-900">Lead list</h3>

                    {!csvFile ? (
                        <button
                            onClick={() => fileRef.current.click()}
                            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-stone-200 rounded-lg py-8 text-stone-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
                        >
                            <Upload size={20} />
                            <span className="text-xs font-medium">Upload CSV</span>
                            <span className="text-xs">Click to browse</span>
                        </button>
                    ) : (
                        <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5">
                            <div className="flex items-center gap-2 min-w-0">
                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                <span className="text-xs font-medium text-stone-700 truncate">{csvFile.name}</span>
                            </div>
                            <button
                                onClick={() => { setCsvFile(null); setCsvColumns([]); setEmailColumn("") }}
                                className="text-stone-400 hover:text-stone-700 ml-2"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />

                    {csvColumns.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-stone-500">Column with email address</label>
                            <select
                                value={emailColumn}
                                onChange={(e) => setEmailColumn(e.target.value)}
                                className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
                            >
                                {csvColumns.map((col) => (
                                    <option key={col} value={col}>{col}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: message */}
            <div className="flex-1 bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-stone-900">Message</h3>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-stone-500">Subject line</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Subject line"
                        className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                    />
                </div>

                <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-xs font-medium text-stone-500">
                        Body
                        <span className="ml-2 text-stone-400 font-normal">
                            Use {"{{first_name}}"}, {"{{company}}"} for personalisation
                        </span>
                    </label>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Write your email..."
                        className="text-sm border border-stone-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 min-h-64"
                    />
                </div>

                <div className="flex justify-end pt-1">
                    <button className="text-sm font-medium px-3.5 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors">
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}

function SenderAccountsTab() {
    const [accounts, setAccounts] = useState(MOCK_ACCOUNTS)

    function toggle(id) {
        setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)))
    }

    return (
        <div className="flex flex-col gap-4 max-w-full">
            <p className="text-sm text-stone-500">
                Choose which sender accounts to rotate across for this campaign.
            </p>

            {accounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 bg-white border border-stone-200 rounded-xl py-14">
                    <Mail size={24} className="text-stone-300" />
                    <p className="text-sm text-stone-500">No sender accounts added yet.</p>
                    <button className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors">
                        <UserPlus size={15} />
                        Add account
                    </button>
                </div>
            ) : (
                <>
                    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                        {accounts.map((account, i) => (
                            <div
                                key={account.id}
                                className={`flex items-center justify-between px-4 py-3.5 ${i !== accounts.length - 1 ? "border-b border-stone-100" : ""}`}
                            >
                                <div className="flex items-center gap-3">
                                    <button onClick={() => toggle(account.id)} className="shrink-0">
                                        {account.enabled
                                            ? <CheckCircle2 size={18} className="text-blue-600" />
                                            : <Circle size={18} className="text-stone-300" />
                                        }
                                    </button>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-stone-900">{account.name}</span>
                                        <span className="text-xs text-stone-500">{account.email}</span>
                                    </div>
                                </div>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${account.enabled ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                                    {account.enabled ? "Active" : "Off"}
                                </span>
                            </div>
                        ))}
                    </div>
                    <button className="flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 self-start">
                        <UserPlus size={15} />
                        Add another account
                    </button>
                </>
            )}
        </div>
    )
}

function SettingsTab() {
    const [timezone, setTimezone] = useState("America/New_York")
    const [showConfirm, setShowConfirm] = useState(false)
    const navigate = useNavigate()

    return (
        <div className="flex flex-col gap-6 max-w-xl">
            <div className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-stone-900">Sending schedule</h3>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-stone-500">Timezone</label>
                    <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
                    >
                        {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                    <p className="text-xs text-stone-400">Emails will be sent according to this timezone.</p>
                </div>
                <div className="flex justify-end pt-1">
                    <button className="text-sm font-medium px-3.5 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors">
                        Save
                    </button>
                </div>
            </div>

            <div className="bg-white border border-red-100 rounded-xl p-5 flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-red-600">Danger zone</h3>
                <p className="text-sm text-stone-500">
                    Permanently delete this campaign and all its data. This cannot be undone.
                </p>
                {!showConfirm ? (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors self-start"
                    >
                        <Trash2 size={15} />
                        Delete campaign
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-stone-600">Are you sure?</span>
                        <button
                            onClick={() => navigate("/campaign")}
                            className="text-sm font-medium px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                        >
                            Yes, delete
                        </button>
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="text-sm font-medium px-3 py-1.5 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

function AnalysisTab() {
    const stats = [
        { label: "Sent", value: "1,240", icon: Send, color: "text-blue-600 bg-blue-50" },
        { label: "Opened", value: "756", sub: "61% open rate", icon: MousePointerClick, color: "text-purple-600 bg-purple-50" },
        { label: "Replied", value: "77", sub: "6.4% reply rate", icon: Reply, color: "text-emerald-600 bg-emerald-50" },
        { label: "Bounced", value: "14", sub: "1.1% bounce rate", icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
    ]

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <div key={s.label} className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-stone-500">{s.label}</span>
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                                <s.icon size={15} strokeWidth={2} />
                            </span>
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-stone-900">{s.value}</p>
                            {s.sub && <p className="text-xs text-stone-500 mt-0.5">{s.sub}</p>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-stone-100">
                    <h3 className="text-sm font-semibold text-stone-900">Recent activity</h3>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-stone-100 text-left text-stone-500">
                            <th className="font-medium px-5 py-3">Email</th>
                            <th className="font-medium px-5 py-3">Status</th>
                            <th className="font-medium px-5 py-3">Sent at</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { email: "mark@acmecorp.com", status: "Replied", time: "2h ago" },
                            { email: "sarah@techflow.io", status: "Opened", time: "3h ago" },
                            { email: "dan@ventures.co", status: "Sent", time: "5h ago" },
                            { email: "priya@scale.ai", status: "Bounced", time: "6h ago" },
                        ].map((row) => {
                            const badge = {
                                Replied: "bg-emerald-50 text-emerald-700",
                                Opened: "bg-blue-50 text-blue-700",
                                Sent: "bg-stone-100 text-stone-600",
                                Bounced: "bg-amber-50 text-amber-700",
                            }[row.status]
                            return (
                                <tr key={row.email} className="border-b border-stone-100 last:border-0">
                                    <td className="px-5 py-3.5 text-stone-700">{row.email}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge}`}>{row.status}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-stone-500">{row.time}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default function CampaignDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const isNew = id === "new"
    const [activeTab, setActiveTab] = useState("Sequence")
    const [status, setStatus] = useState("Active")

    const tabContent = {
        Sequence: <SequenceTab />,
        "Sender Accounts": <SenderAccountsTab />,
        Analysis: <AnalysisTab />,
        Settings: <SettingsTab />,
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate("/campaign")}
                    className="text-stone-500 hover:text-stone-900 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-xl font-semibold text-stone-900 flex-1">
                    {isNew ? "New campaign" : "Q3 SaaS Founders Outreach"}
                </h1>
                {!isNew && (
                    <button
                        onClick={() => setStatus((s) => s === "Active" ? "Paused" : "Active")}
                        className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                        {status === "Active" ? <><Pause size={15} /> Pause</> : <><Play size={15} /> Resume</>}
                    </button>
                )}
            </div>

            <div className="flex gap-1 border-b border-stone-200">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={[
                            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                            activeTab === tab
                                ? "border-blue-600 text-blue-700"
                                : "border-transparent text-stone-500 hover:text-stone-900",
                        ].join(" ")}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div>{tabContent[activeTab]}</div>
        </div>
    )
}