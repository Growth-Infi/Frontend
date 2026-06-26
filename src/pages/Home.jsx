import { TrendingUp, Mail, Users, Target } from "lucide-react"
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts"

const STATS = [
    { label: "Active campaigns", value: "12", delta: "+2 this week", icon: Target },
    { label: "Emails sent", value: "8,402", delta: "+14% vs last week", icon: Mail },
    { label: "Verified contacts", value: "3,219", delta: "+318 this week", icon: Users },
    { label: "Reply rate", value: "6.4%", delta: "+0.8pt vs last week", icon: TrendingUp },
]

const CHART_DATA = [
    { day: "Mon", sent: 820, replies: 41 },
    { day: "Tue", sent: 932, replies: 58 },
    { day: "Wed", sent: 1100, replies: 64 },
    { day: "Thu", sent: 980, replies: 49 },
    { day: "Fri", sent: 1240, replies: 77 },
    { day: "Sat", sent: 410, replies: 12 },
    { day: "Sun", sent: 290, replies: 9 },
]

function StatCard({ label, value, delta, icon: Icon }) {
    return (
        <div className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">{label}</span>
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Icon size={16} strokeWidth={2} />
                </span>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-2xl font-semibold text-stone-900">{value}</span>
                <span className="text-xs text-emerald-700">{delta}</span>
            </div>
        </div>
    )
}

export default function Home() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-xl font-semibold text-stone-900">Welcome back</h1>
                <p className="text-sm text-stone-500 mt-1">
                    Here's how your outreach is performing this week.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {STATS.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                ))}
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-stone-900">
                        Emails sent vs. replies
                    </h2>
                    <span className="text-xs text-stone-500">Last 7 days</span>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={CHART_DATA} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                            <defs>
                                <linearGradient id="sentFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#1d4ed8" stopOpacity={0.18} />
                                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#E8E6E1" vertical={false} />
                            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#78716c" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: "#78716c" }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E8E6E1", fontSize: 13 }} />
                            <Area type="monotone" dataKey="sent" stroke="#1d4ed8" strokeWidth={2} fill="url(#sentFill)" />
                            <Area type="monotone" dataKey="replies" stroke="#0f766e" strokeWidth={2} fill="transparent" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}