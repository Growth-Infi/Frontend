import { useState } from "react"

export default function Settings() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")

    return (
        <div className="flex flex-col gap-6 max-w-xl">
            <div>
                <h1 className="text-xl font-semibold text-stone-900">Settings</h1>
                <p className="text-sm text-stone-500 mt-1">Manage your account details.</p>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-stone-900">Profile</h2>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-stone-500">Full name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                        className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-stone-500">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
                </div>
                <div className="flex justify-end pt-1">
                    <button className="text-sm font-medium px-3.5 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors">
                        Save changes
                    </button>
                </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-stone-900">Password</h2>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-stone-500">Current password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••"
                        className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-stone-500">New password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••"
                        className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400" />
                </div>
                <div className="flex justify-end pt-1">
                    <button className="text-sm font-medium px-3.5 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors">
                        Update password
                    </button>
                </div>
            </div>
        </div>
    )
}