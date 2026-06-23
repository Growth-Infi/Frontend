import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"

export default function AppLayout() {
    return (
        <div className="flex min-h-screen bg-stone-50">
            <Sidebar />
            <main className="flex-1 min-w-0 px-10 py-8">
                <Outlet />
            </main>
        </div>
    )
}